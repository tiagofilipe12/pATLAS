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
      if (g.getNode(accession)) { // TODO table doesn't handle what is not
        // in graph
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
            const resistances = (data.plasmid_id) ? data.json_entry.gene : "N/A"
            // add to entry
            entry.resGenes = resistances
          })

          await $.get("api/getplasmidfinder/", {accession}, (data, status) => {
            const plasmidfinder = (data.plasmid_id) ? data.json_entry.gene : "N/A"
            entry.pfGenes = plasmidfinder
          })
          // async function must return the desired entry to push to dataArray
          return entry // returns promise

        }
        // collect every promise for each accession number
        promises.push(promiseGather())
      }

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

const parseReadObj = (readObjects, masterReadArray) => {
  const xCategories = []
  const positionsMap = []
  const valuesArray = []
  for (const i in readObjects) {
    if (readObjects.hasOwnProperty(i)) {
      // x will contain file Ids
      xCategories.push(i)
      const fileEntries = JSON.parse(readObjects[i])
      const fileIndex = Object.keys(readObjects).indexOf(i)
      let plasmidIndex, coverageValue
      for (const i2 in fileEntries) {
        if (fileEntries.hasOwnProperty(i2) && fileEntries[i2] >= cutoffParser()) {
          // checks if it is already in y labels (containing plasmid accessions
          if (masterReadArray.indexOf(i2) < 0) {
            plasmidIndex = masterReadArray.indexOf(i2)
            coverageValue = Math.round(fileEntries[i2] * 100)
            valuesArray.push(coverageValue)
          } else {
            plasmidIndex = masterReadArray.indexOf(i2)
            coverageValue = Math.round(fileEntries[i2] * 100)
            valuesArray.push(coverageValue)
          }
          positionsMap.push([fileIndex, plasmidIndex, coverageValue])
        }
      }
    }
  }
  return [xCategories, positionsMap, valuesArray]
}

const heatmapMaker = (masterReadArray, readObjects) => {
  const tripleArray = parseReadObj(readObjects, masterReadArray)
  Highcharts.chart("chartContainer2", {

    chart: {
      type: "heatmap",
      marginTop: 50,
      plotBorderWidth: 1,
      height: masterReadArray.length * 25, // size is relative to array size
      //width: tripleArray[0].length * 200
    },


    title: {
      text: "Plasmid coverage in each set of reads"
    },

    xAxis: {
      categories: tripleArray[0],
      labels: {
        rotation: -45
      }
    },

    yAxis: {
      categories: masterReadArray,
      title: null,
    },

    colorAxis: {
      min: Math.min.apply(null, tripleArray[2]),  // sets min value for the
      // min value in array of values in dataset
      minColor: "#fcd6d6", //sets min value to light pink
      maxColor: Highcharts.getOptions().colors[8]
    },

    legend: {
      title: {
        text: "Percentage (%)"
      },
      align: "right",
      layout: "vertical",
      margin: 0,
      verticalAlign: "top",
      y: 25,
      symbolHeight: 400
    },

    tooltip: {
      formatter: function () {
        return "<b>" + this.series.xAxis.categories[this.point.x] + "</b>" +
          " file" + " <br><b>" + this.point.value +
          "</b> % coverage <br><b>" +
          this.series.yAxis.categories[this.point.y] + "</b>"
      }
    },

    series: [{
      name: "Coverage percentage",
      borderWidth: 1,
      data: tripleArray[1],
      dataLabels: {
        enabled: true,
        color: "#000000"
      }
    }]

  })
  $("#chartContainer2").show()
}