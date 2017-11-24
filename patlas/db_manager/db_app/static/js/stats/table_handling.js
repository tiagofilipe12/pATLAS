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

const heatmapMaker = (bootstrapTableList, readObjects) => {
  console.log(bootstrapTableList, readObjects)
  Highcharts.chart('container', {

    chart: {
      type: 'heatmap',
      marginTop: 40,
      marginBottom: 80,
      plotBorderWidth: 1
    },


    title: {
      text: 'Sales per employee per weekday'
    },

    xAxis: {
      categories: ['Alexander', 'Marie', 'Maximilian', 'Sophia', 'Lukas', 'Maria', 'Leon', 'Anna', 'Tim', 'Laura']
    },

    yAxis: {
      categories: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
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
        return '<b>' + this.series.xAxis.categories[this.point.x] + '</b> sold <br><b>' +
          this.point.value + '</b> items on <br><b>' + this.series.yAxis.categories[this.point.y] + '</b>';
      }
    },

    series: [{
      name: 'Sales per employee',
      borderWidth: 1,
      data: [[0, 0, 10], [0, 1, 19], [0, 2, 8], [0, 3, 24], [0, 4, 67], [1, 0, 92], [1, 1, 58], [1, 2, 78], [1, 3, 117], [1, 4, 48], [2, 0, 35], [2, 1, 15], [2, 2, 123], [2, 3, 64], [2, 4, 52], [3, 0, 72], [3, 1, 132], [3, 2, 114], [3, 3, 19], [3, 4, 16], [4, 0, 38], [4, 1, 5], [4, 2, 8], [4, 3, 117], [4, 4, 115], [5, 0, 88], [5, 1, 32], [5, 2, 12], [5, 3, 6], [5, 4, 120], [6, 0, 13], [6, 1, 44], [6, 2, 88], [6, 3, 98], [6, 4, 96], [7, 0, 31], [7, 1, 1], [7, 2, 82], [7, 3, 32], [7, 4, 30], [8, 0, 85], [8, 1, 97], [8, 2, 123], [8, 3, 64], [8, 4, 84], [9, 0, 47], [9, 1, 114], [9, 2, 31], [9, 3, 48], [9, 4, 91]],
      dataLabels: {
        enabled: true,
        color: '#000000'
      }
    }]

  })
}