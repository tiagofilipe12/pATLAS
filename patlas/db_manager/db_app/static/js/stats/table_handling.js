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
    if (currentNodeUI.color === 0x23A900) { tempListAccessions.push(node.id) }
  })
  return tempListAccessions
}

const makeTable = (areaSelection, listGiFilter, g, graphics) => {
  let promises = []
  // redefines listGiFilter if area selection is used
  // IMPORTANT: in this case listGiFilter doesn't exit this function scope
  // which is the intended behavior
  listGiFilter = (areaSelection === false) ? listGiFilter : getTableWithAreaSelection(g, graphics)
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
      // promises.push(
      const promiseGather = async () => {
        // starts entry variable
        const entry = {
          "id": "",
          "length": "",
          "percentage": "",
          "speciesName": "",
          "plasmidName": "",
          "resGenes": "",
          "pfGenes": ""
        }
        // sequence of promises that are executed sequentially
        await  $.get("api/getspecies/", {accession}, (data, status) => {
          if (data.plasmid_id) {
            const species = data.json_entry.name.split("_").join(" ")
            const plasmid = data.json_entry.plasmid_name

            // then add all to the object
            entry.id = accession
            entry.length = seqLength
            entry.percentage = seqPercentage
            entry.speciesName = species
            entry.plasmidName = plasmid
          }
        })

        await $.get("api/getresistances/", {accession}, (data, status) => {
          const resistances = (data.plasmid_id) ? data.json_entry.gene :
            "N/A"
            // add to entry
            entry.resGenes = resistances
        })

        await $.get("api/getplasmidfinder/", {accession}, (data, status) => {
          const plasmidfinder = (data.plasmid_id) ? data.json_entry.gene :
          "N/A"
            entry.pfGenes = plasmidfinder
        })
        // async function must return the desired entry to push to dataArray
        // dataArray.push(entry)
        // console.log(dataArray)
        return entry // returns promise
      }
      // collect every promise for each accession number
      promises.push(promiseGather())

      // for every loop instance entries could be added to array, each entry
      // in dataArray should be a single row
    }
  }
  // waits for all promises before constructing full table
  Promise.all(promises)
    .then( (results) => {
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
        }, {
          field: "resGenes",
          title: "Resistance genes",
          visible: false
        }, {
          field: "pfGenes",
          title: "Plasmid families",
          visible: false
        }],
        // data is an array of rows
        data: results
      })
    })
}

const parseReadObj = (readObjects) => {
  const xCategories = []
  const yCategories = []
  const positionsMap = []
  for (const i in readObjects) {
    // x will contain file Ids
    xCategories.push(i)
    console.log(i, JSON.parse(readObjects[i]))
    const fileEntries = JSON.parse(readObjects[i])
    const fileIndex = Object.keys(readObjects).indexOf(i)
    let plasmidIndex, coverageValue
    // iterate through each file entries
    for (const i2 in fileEntries) {
      // checks if it is already in y labels (containing plasmid accessions
      if (yCategories.indexOf(i2) < 0) {
        yCategories.push(i2)
        plasmidIndex = Object.keys(fileEntries).indexOf(i2)
        coverageValue = Math.round(fileEntries[i2] * 100)
      } else {
        plasmidIndex = yCategories.indexOf(i2)
        coverageValue = Math.round(fileEntries[i2] * 100)
      }
      console.log(i2, fileEntries[i2], [fileIndex, plasmidIndex, coverageValue])
      positionsMap.push([fileIndex, plasmidIndex, coverageValue])
    }
  }
  //TODO return three arrays
  return [xCategories, yCategories, positionsMap]
}

const heatmapMaker = (bootstrapTableList, readObjects) => {
  console.log(bootstrapTableList, readObjects)
  const tripleArray = parseReadObj(readObjects)
  console.log(tripleArray)
  Highcharts.chart('chartContainer2', {

    chart: {
      type: 'heatmap',
      marginTop: 50,
      marginBottom: 80,
      plotBorderWidth: 1
    },


    title: {
      text: 'Plasmid coverage in each set of reads'
    },

    xAxis: {
      categories: tripleArray[0]
    },

    yAxis: {
      categories: tripleArray[1],
      title: null
    },

    colorAxis: {
      min: 0,
      minColor: '#FFFFFF',
      maxColor: Highcharts.getOptions().colors[0]
    },

    legend: {
      align: 'right',
      layout: 'vertical',
      margin: 0,
      verticalAlign: 'top',
      y: 25,
      symbolHeight: 280
    },

    tooltip: {
      formatter: function () {
        return '<b>' + this.series.xAxis.categories[this.point.x] + '</b>' +
          ' file' +
          ' <br><b>' +
          this.point.value + '</b> % coverage <br><b>' + this.series.yAxis.categories[this.point.y] + '</b>';
      }
    },

    series: [{
      name: 'Coverage percentage',
      borderWidth: 1,
      data: tripleArray[2],
      dataLabels: {
        enabled: true,
        color: '#000000'
      }
    }]

  })
  $("#chartContainer2").show()
}