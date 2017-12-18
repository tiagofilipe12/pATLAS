const arraysEqual = (arr1, arr2) => {
  if (arr2.length === 0) {
    return false
  }
  if(arr1.length !== arr2.length) {
    return false
  }
  for(const i in arr1.length) {
    if(arr1[i] !== arr2[i]) {
      return false
    }
  }
  return true
}

const linkFormatter = (value, row, index) => {
  const reducedAccession = value.split("_").slice(0, 2).join("_")
  const cleanAccession = reducedAccession + "." + value.split("_").slice(2)
  return "<a href='https://www.ncbi.nlm.nih.gov/nuccore/" +
    reducedAccession +
    "' target='_blank'>" + cleanAccession + "</a>"
}

/**
 * This function allows to get accessions associated with green color in
 * area selection events
 * @param {Object} g - vivagraph graph object that allows to add nodes and links
 * @param {Object} graphics - vivagraph object that allows to change colors
 * of nodes and links
 * @returns {Array} an array with all accession numbers
 * that have color. This have similar functions to listGiFilter and in fact
 * will replace it in makeTable function.
 */
const getTableWithAreaSelection = (g, graphics) => {
  let tempListAccessions = []
  g.forEachNode( (node) => {
    const currentNodeUI = graphics.getNodeUI(node.id)
    if (currentNodeUI.color === 0x23A900) { tempListAccessions.push(node.id) }
  })
  return tempListAccessions
}

/**
 * Function that gathers the results for querying the main, resistance and
 * plasmidfinder databases in psql for patlas
 * @param {Array} listGiFilter - a list with all accession numbers required
 * do query the databsae
 * @returns {Object} An object with all the requests made to
 * the database with three keys: sequences, where the main database entries
 * are stored; resistances, where the resistance database entries are stored;
 * and pfamilies, where plasmidfinder database entries are stored
 */
const promiseGather = async (listGiFilter) => {
  let request = {}
  request.sequences = await $.get("api/getspecies/", {"accession": JSON.stringify(listGiFilter)})
  request.resistances = await $.get("api/getresistances/", {"accession": JSON.stringify(listGiFilter)})
  request.pfamilies = await $.get("api/getplasmidfinder/", {"accession": JSON.stringify(listGiFilter)})
  return request
}

/**
 * Function to generate a table for each selection made in vivagraph
 * @param {boolean} areaSelection - boolean that controls if an area
 * selection was made (true) or if nodes were selected using menus (false)
 * @param {Array} listGiFilter - in the case areaSelection is false then
 * this variable will be populated with an array of accession numbers for
 * which colors are assigned in vivagraph network
 * @param {Object} g - vivagraph graph object that allows to add nodes and links
 * @param {Object} graphics - vivagraph object that allows to change colors
 * of nodes and links
 */
const makeTable = (areaSelection, listGiFilter, previousTableList, g, graphics) => {
  let promises = []
  // redefines listGiFilter if area selection is used
  // IMPORTANT: in this case listGiFilter doesn't exit this function scope
  // which is the intended behavior
  listGiFilter = (areaSelection === false) ? listGiFilter : getTableWithAreaSelection(g, graphics)
  console.log(listGiFilter, previousTableList)
  if (arraysEqual(listGiFilter, previousTableList) === false) {
    $("#metadataTable").bootstrapTable("destroy")
    previousTableList = listGiFilter
    // for (const i in listGiFilter) {
      // if ({}.hasOwnProperty.call(listGiFilter, i)) {
        // gets info for every node and puts it in a line
        // const accession = listGiFilter[i]
        // if (g.getNode(accession)) {
        //   const nodeData = g.getNode(accession).data
        //   const seqPercentage = (nodeData.percentage) ? nodeData.percentage : "N/A" // this may be
          // undefined
          // depending if input file is provided or not

          // const seqLength = (nodeData.seq_length) ? nodeData.seq_length.split(">")[2] : "N/A"
          // querying database is required before this
          // promises.push(
          // const promiseGather = async () => {
            // starts entry variable
            // const entry = {
            //   "id": "",
            //   "length": "",
            //   "percentage": "",
            //   "speciesName": "",
            //   "plasmidName": "",
            //   "resGenes": "",
            //   "pfGenes": ""
            // }
            // sequence of promises that are executed sequentially
            // await  $.get("api/getspecies/", {"accession": listGiFilter})
              // if (data.plasmid_id) {
                // const species = data.json_entry.name.split("_").join(" ")
                // const plasmid = data.json_entry.plasmid_name
                // const clusterId = data.json_entry.cluster

                // // then add all to the object
                // entry.id = accession
                // entry.length = seqLength
                // entry.percentage = seqPercentage
                // entry.speciesName = species
                // entry.plasmidName = plasmid
                // entry.cluster = clusterId
              // }
            // })

            // await $.get("api/getresistances/", {"accession": listGiFilter})
              // const resistances = (data.plasmid_id) ? data.json_entry.gene.replace(/['u"\[\]]/g, "") : "N/A"
              // add to entry
              // entry.resGenes = resistances
            // })

            // await $.get("api/getplasmidfinder/", {"accession": listGiFilter})
              // const plasmidfinder = (data.plasmid_id) ? data.json_entry.gene.replace(/['u"\[\]]/g, "") : "N/A"
              // entry.pfGenes = plasmidfinder
            // })
            // async function must return the desired entry to push to dataArray
            // return entry // returns promise

          // }
          // collect every promise for each accession number
          // promises.push(promiseGather())
        // }

        // for every loop instance entries could be added to array, each entry
        // in dataArray should be a single row
      // }
    // }
    // waits for all promises before constructing full table
    // Promise.all(promises)
    promiseGather(listGiFilter)
      .then( (requests) => {
        // let promises = []
        for (let i in listGiFilter) {
          const accession = listGiFilter[i]
          // forces reseting of the entry object to be passed has an array
          const entry = {
            "id": "",
            "length": "",
            "percentage": "",
            "speciesName": "",
            "plasmidName": "",
            "resGenes": "",
            "pfGenes": ""
          }
          // gets percentage
          const seqPercentage = (g.getNode(accession) && g.getNode(accession).data.percentage) ?
            g.getNode(accession).data.percentage : "N/A"

          // iterates through main database entries
          for (mainRequest of requests.sequences) {
            if (mainRequest.plasmid_id === accession) {
              // then add all to the object
              entry.id = accession
              entry.length = mainRequest.json_entry.length
              entry.percentage = seqPercentage
              entry.speciesName = mainRequest.json_entry.name
              entry.plasmidName = mainRequest.json_entry.plasmid_name
              entry.cluster = mainRequest.json_entry.cluster
              // loops must be break because there must be only one entry
              break
            }
          }
          // iterates through resistance database entries
          for (resistanceRequest of requests.resistances) {
            if (resistanceRequest.plasmid_id === accession) {
              entry.resGenes = resistanceRequest.json_entry.gene.replace(/['u"\[\]]/g, "")
              // loops must be break because there must be only one entry
              break
            }
          }
          // iterates through plasmidfinder database entries
          for (pfamiliesRequest of requests.pfamilies) {
            if (pfamiliesRequest.plasmid_id === accession) {
              entry.pfGenes = pfamiliesRequest.json_entry.gene.replace(/['u"\[\]]/g, "")
              // loops must be break because there must be only one entry
              break
            }
          }
          entry.resGenes = (entry.resGenes === "") ? "N/A" : entry.resGenes
          entry.pfGenes = (entry.pfGenes === "") ? "N/A" : entry.pfGenes
          promises.push(entry)
        }

        Promise.all(promises)
          .then( (entry) => {
            console.log(entry)
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
                sortable: true,
                visible: false
              }, {
                field: "speciesName",
                title: "Species name",
                sortable: true,
                detailFilter: true
              }, {
                field: "resGenes",
                title: "Resistance genes",
                visible: false,
                sortable: true
              }, {
                field: "pfGenes",
                title: "Plasmid families",
                visible: false,
                sortable: true
              }, {
                field: "cluster",
                title: "Cluster no.",
                visible: false,
                sortable: true
              }],
              // data is an array of rows
              data: entry,
              // formatLoadingMessage: function () {
              //   return "<img src=\"{{ url_for('static'," +
              //     " filename='images/loading.gif') }}'\" />"
              // }
            })
            $("#loading").hide()
          })
      })
  } else {
    $("#loading").hide()
  }
  return previousTableList
}

const parseReadObj = (readObjects, masterReadArray) => {
  const xCategories = []
  const positionsMap = []
  const valuesArray = []
  for (const i in readObjects) {
    // iterate each file
    if (readObjects.hasOwnProperty(i)) {
      // x will contain file Ids
      xCategories.push(i)
      const fileEntries = JSON.parse(readObjects[i])
      const fileIndex = Object.keys(readObjects).indexOf(i)
      let plasmidIndex, coverageValue
      for (const i2 in fileEntries) {
        // iterate each entry in each json file
        if (fileEntries.hasOwnProperty(i2)) {
          // checks if percentage is a string or an array because it can be
          // both depending if it is an import from mapping or mash respectively
          const percValue = (typeof(fileEntries[i2]) === "number") ?
            fileEntries[i2] : parseFloat(fileEntries[i2][0])
          if (percValue >= cutoffParser()) {
            // checks if it is already in y labels (containing plasmid accessions
            if (masterReadArray.indexOf(i2) < 0) {
              plasmidIndex = masterReadArray.indexOf(i2)
              coverageValue = Math.round(percValue * 100)
              valuesArray.push(coverageValue)
            } else {
              plasmidIndex = masterReadArray.indexOf(i2)
              coverageValue = Math.round(percValue * 100)
              valuesArray.push(coverageValue)
            }
            positionsMap.push([fileIndex, plasmidIndex, coverageValue])
          }
        }
      }
    }
  }
  return [xCategories, positionsMap, valuesArray]
}

const heatmapMaker = (masterReadArray, readObjects) => {
  // clear heatmap div
  $("#chartContainer2").empty()
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