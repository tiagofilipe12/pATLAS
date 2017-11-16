const makeTable = (listGiFilter, g) => {
  let dataArray = []
  let promises = []
  if (listGiFilter.length !== 0) {
    for (const i in listGiFilter) {
      // gets info for every node and puts it in a line
      const accession = listGiFilter[i]
      const nodeData = g.getNode(accession).data
      const seqPercentage = (nodeData.percentage) ? nodeData.percentage : "N/A" // this may be
      // undefined
      // depending if input file is provided or not

      const seqLength = (nodeData.seq_length) ? nodeData.seq_length.split(">")[2] : "N/A"
      // querying database is required before this
      promises.push(
        $.get("api/getspecies/", {"accession": accession}, (data, status) => {
          if (data.plasmid_id) {
            const species = data.json_entry.name.split("_").join(" ")
            const plasmid = data.json_entry.plasmid_name

            // then add all to the object
            const entry = {
              id: accession,
              length: seqLength,
              percentage: seqPercentage,
              speciesName: species,
              plasmidName: plasmid
            }
            dataArray.push(entry)
          }
        })
      )

      // for every loop instance entries could be added to array, each entry
      // in dataArray should be a single row
    }
    // waits for all promises before constructing full table
    Promise.all(promises)
      .then( () => {
        // table is just returned in the end before that a json should be
        // constructed
        $("#metadataTable").bootstrapTable({
          // columens are used to generate headers
          columns: [{
            field: "id",
            title: "Accession number",
            switchable: false
          }, {
            field: "length",
            title: "Sequence length",
            sortable: true
          }, {
            field: "percentage",
            title: "Percentage coverage",
            sortable: true
          }, {
            field: "speciesName",
            title: "Species name",
            sortable: true
          }, {
            field: "plasmidName",
            title: "Plasmid name",
            sortable: true
          }],
          // data is an array of rows
          data: dataArray
        })
      })
  } else {
    // TODO iterate by color
  }
}