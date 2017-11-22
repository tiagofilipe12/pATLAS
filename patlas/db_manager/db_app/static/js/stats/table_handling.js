const linkFormatter = (value, row, index) => {
  const reducedAccession = value.split("_").slice(0, 2).join("_")
  const cleanAccession = reducedAccession + "." + value.split("_").slice(2)
  return "<a href='https://www.ncbi.nlm.nih.gov/nuccore/" +
    reducedAccession +
    "' target='_blank'>" + cleanAccession + "</a>"
}

const getTableWithAreaSelection = (g, graphics) => {
  let tempListAccessions = []
  g.forEachNode( (node) => {
    const currentNodeUI = graphics.getNodeUI(node.id)
    if (currentNodeUI.color === 0xFFA500ff) { tempListAccessions.push(node.id) }
  })
  console.log(tempListAccessions)
  return tempListAccessions
}

const makeTable = (areaSelection, listGiFilter, g, graphics) => {
  let dataArray = []
  let promises = []
  // redefines listGiFilter if area selection is used
  // IMPORTANT: in this case listGiFilter doesn't exit this function scope
  // which is the intended behavior
  listGiFilter = (areaSelection === false) ? listGiFilter : getTableWithAreaSelection(g, graphics)
  console.log(listGiFilter)
  for (const i in listGiFilter) {
    if ({}.hasOwnProperty.call(listGiFilter, i)) {
      // gets info for every node and puts it in a line
      const accession = listGiFilter[i]
      const nodeData = g.getNode(accession).data
      const seqPercentage = (nodeData.percentage) ? nodeData.percentage : "N/A" // this may be
      // undefined
      // depending if input file is provided or not

      const seqLength = (nodeData.seq_length) ? nodeData.seq_length.split(">")[2] : "N/A"
      // querying database is required before this
      promises.push(
        $.get("api/getspecies/", {accession}, (data, status) => {
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
    }
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
          field: "state",
          checkbox: true
        }, {
          field: "id",
          title: "Accession number",
          switchable: false,
          formatter: linkFormatter
        }, {
          field: "plasmidName",
          title: "Plasmid name",
          sortable: true
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
        }],
        // data is an array of rows
        data: dataArray
      })
    })
}