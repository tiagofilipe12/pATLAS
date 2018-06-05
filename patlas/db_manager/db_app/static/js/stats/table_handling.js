/*globals Highcharts, cutoffParser, cutoffParserMash, assemblyJson,
 cutoffParserSeq, copyNumberCutoff, cutoffHashSeq */

/**
 * Function to compare two arrays and check if they are equal, i.e. if they
 * have the same elements present in both.
 * @param {Array} arr1 - one of the arrays to be compared
 * @param {Array} arr2 - the other array to be compared
 * @returns {boolean} - returns false when both arrays are different,
 * otherwise it returns true.
 */
const arraysEqual = (arr1, arr2) => {
  if (arr2.length === 0) {
    return false
  }
  if(arr1.length !== arr2.length) {
    return false
  }
  for(const i in arr1.length) {
    if ({}.hasOwnProperty.call(arr1.length, i)) {
      if (arr1[i] !== arr2[i]) {
        return false
      }
    }
  }
  return true
}

/**
 * Function to format link to cell
 * @param {string} value - the accession number
 * @param {undefined} row
 * @param {undefined} index
 * @returns {string} - a element for html link
 */
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
    if (currentNodeUI.color === "0x" + "#fa5e00".replace("#", "")) {
      tempListAccessions.push(node.id)
    }
  })
  return tempListAccessions
}

/**
 * Function that gathers the results for querying the main, resistance and
 * plasmidfinder databases in psql for patlas
 * @param {Array} listGiFilter - a list with all accession numbers required
 * do query the database
 * @returns {Object} An object with all the requests made to
 * the database with three keys: sequences, where the main database entries
 * are stored; resistances, where the resistance database entries are stored;
 * and pfamilies, where plasmidfinder database entries are stored
 */
const promiseGather = async (listGiFilter) => {
  let request = {}
  request.sequences = await $.post("api/getspecies/", {"accession": JSON.stringify(listGiFilter)})
  request.resistances = await $.post("api/getresistances/", {"accession": JSON.stringify(listGiFilter)})
  request.pfamilies = await $.post("api/getplasmidfinder/", {"accession": JSON.stringify(listGiFilter)})
  request.virulence = await $.post("api/getvirulence/", {"accession": JSON.stringify(listGiFilter)})
  return request
}

/**
 * Function to generate a table for each selection made in vivagraph
 * @param {boolean} areaSelection - boolean that controls if an area
 * selection was made (true) or if nodes were selected using menus (false)
 * @param {Array} listGiFilter - in the case areaSelection is false then
 * this variable will be populated with an array of accession numbers for
 * which colors are assigned in vivagraph network
 * @param {Array} previousTableList - a variable that stores the previous
 * array used to construct table. If this is equal to listGiFilter then it
 * will display the previous table rather than the new one.
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
  if (arraysEqual(listGiFilter, previousTableList) === false) {
    $("#metadataTable").bootstrapTable("destroy")
    previousTableList = listGiFilter

    // executes promiseGather function and then executes the remaining code,
    // resulting in a list of entries that will be Promise.all
    promiseGather(listGiFilter)
      .then( (requests) => {
        // let promises = []
        for (const i in listGiFilter) {
          if ({}.hasOwnProperty.call(listGiFilter, i)) {
            const accession = ({}.hasOwnProperty.call(listGiFilter, i)) ? listGiFilter[i] : false
            // forces reseting of the entry object to be passed has an array
            const entry = {
              "id": "",
              "length": "",
              "percentage": "",
              "percentageMashScreen": "",
              "percentageMashDist": "",
              "contigName": "",
              "speciesName": "",
              "plasmidName": "",
              "resGenes": "",
              "pfGenes": ""
            }
            // gets percentage for mapping import
            const seqPercentage = (g.getNode(accession) &&
              g.getNode(accession).data.percentage) ?
              g.getNode(accession).data.percentage : "N/A"

            // gets percentage for mash screen import
            const seqPercentageMashScreen = ( g.getNode(accession) &&
              g.getNode(accession).data.percMash) ?
                g.getNode(accession).data.percMash : "N/A"

            // gets percentage for mash dist / sequence import
            const seqPercentageMashDist = ( g.getNode(accession) &&
              g.getNode(accession).data.percMashDist) ?
                  g.getNode(accession).data.percMashDist : "N/A"

            // get contig name if it exists. only mash dist
            const gotContigName = (g.getNode(accession) &&
              g.getNode(accession).data.contigName) ?
              g.getNode(accession).data.contigName : "N/A"

            // iterates through main database entries
            for (let mainRequest of requests.sequences) {
              if (mainRequest.plasmid_id === accession) {
                // then add all to the object
                entry.id = accession
                entry.length = mainRequest.json_entry.length
                entry.percentage = seqPercentage
                entry.percentageMashScreen = seqPercentageMashScreen
                entry.percentageMashDist = seqPercentageMashDist
                entry.contigName = gotContigName
                entry.speciesName = mainRequest.json_entry.name.split("_").join(" ")
                entry.plasmidName = mainRequest.json_entry.plasmid_name
                entry.cluster = mainRequest.json_entry.cluster
                // loops must be break because there must be only one entry
                break
              }
            }
            // iterates through resistance database entries
            for (let resistanceRequest of requests.resistances) {
              if (resistanceRequest.plasmid_id === accession) {
                entry.resGenes = resistanceRequest.json_entry.gene.replace(/['u"\[\]]/g, "")
                // loops must be break because there must be only one entry
                break
              }
            }
            // iterates through plasmidfinder database entries
            for (let pfamiliesRequest of requests.pfamilies) {
              if (pfamiliesRequest.plasmid_id === accession) {
                entry.pfGenes = pfamiliesRequest.json_entry.gene.replace(/['u"\[\]]/g, "")
                // loops must be break because there must be only one entry
                break
              }
            }
            for (let virulenceRequests of requests.virulence) {
              if (virulenceRequests.plasmid_id === accession) {
                entry.virGenes = virulenceRequests.json_entry.gene.replace(/['u"\[\]]/g, "")
                // loops must be break because there must be only one entry
                break
              }
            }
            // since not allways the response is an empty string and sometimes
            // it returns undefined... this check is to prevent showing empty
            // columns in table
            entry.resGenes = (entry.resGenes === "" || typeof entry.resGenes === "undefined") ? "N/A" : entry.resGenes
            entry.pfGenes = (entry.pfGenes === "" || typeof entry.pfGenes === "undefined") ? "N/A" : entry.pfGenes
            entry.virGenes = (entry.virGenes === "" || typeof entry.virGenes === "undefined") ? "N/A" : entry.virGenes
            promises.push(entry)
          }
        }

        // after everyt entry has been added to promises array it will
        // generate the table itself
        Promise.all(promises)
          .then( (entry) => {
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
                title: "Coverage (%)",
                sortable: true,
                visible: false
              }, {
                field: "percentageMashScreen",
                title: "Mash screen id (%)",
                sortable: true,
                visible: false
              }, {
                field: "percentageMashDist",
                title: "Sequence id (%)",
                sortable: true,
                visible: false
              }, {
                field: "contigName",
                title: "Contig name",
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
                field: "virGenes",
                title: "Virulence genes",
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
              exportOptions: {
                fileName: "pATLAS_table"
              }
            })
            $("#loading").hide()
          })
      })
  } else {
    $("#loading").hide()
  }
  return previousTableList
}

/**
 * Parses the read object to store only the entries that are within the
 * defined cutoffs by cutOffParse() and cutOffParserMash() + copyNumberCutoff()
 * @param {Object} readObjects - An object that maps each accession number
 * and their percentage values to the respective file.
 * @param {Array} masterReadArray - An array with all accession number of the
 * plasmids highlighted on the graph.
 * @returns {*[]}
 */
const parseReadObj = (readObjects, masterReadArray) => {

  const xCategories = []
  const positionsMap = []
  const valuesArray = []

  // iterate each file
  for (const i in readObjects) {

    if (readObjects.hasOwnProperty(i)) {

      // x will contain file Ids
      xCategories.push(i)
      const fileEntries = (typeof readFilejson[i] === "string") ?
        JSON.parse(readFilejson[i]) : readFilejson[i]
      const fileIndex = Object.keys(readObjects).indexOf(i)
      let plasmidIndex, coverageValue

      for (const i2 in fileEntries) {
        // iterate each entry in each json file
        if (fileEntries.hasOwnProperty(i2)) {
          // checks if percentage is a string or an array because it can be
          // both depending if it is an import from mapping or mash respectively
          const percValue = (typeof(fileEntries[i2]) === "number") ?
            fileEntries[i2] : parseFloat(fileEntries[i2][0])

          // checks if it is an import from Mash file
          if (fileEntries[i2].constructor !== Array) {
            const parsedCutoff = cutoffParser()
            if (percValue >= parsedCutoff) {

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

          } else {

            // executes for mash files
            const parsedCutoff = (assemblyJson === false) ? cutoffParserMash() :
              cutoffParserSeq()
            const parsedCopyNumberCutoff = (assemblyJson === false) ? copyNumberCutoff() :
              cutoffHashSeq()

            const copyNumber = fileEntries[i2][1]

            if (percValue >= parsedCutoff && copyNumber >= parsedCopyNumberCutoff) {
              plasmidIndex = masterReadArray.indexOf(i2)
              coverageValue = Math.round(percValue * 100)
              valuesArray.push(coverageValue)
              positionsMap.push([fileIndex, plasmidIndex, coverageValue])
            }
          }
        }
      }
    }
  }

  return [xCategories, positionsMap, valuesArray]
}


/**
 * Function to construct an heatmap that allows users to compare multiple
 * samples in a single and effective manner
 * @param {Array} masterReadArray - An array with all accesion number of the
 * plasmids highlighted on the graph.
 * @param {Object} readObjects - An object that maps each accession number
 * and their percentage values to the respective file.
 */
const heatmapMaker = (g, masterReadArray, readObjects) => {
  console.log(readObjects)
  // clear heatmap div
  $("#chartContainer2").empty()
  const tripleArray = parseReadObj(readObjects, masterReadArray)

  Highcharts.chart("chartContainer2", {
    chart: {
      type: "heatmap",
      marginTop: 50,
      plotBorderWidth: 1,
      height: 200 + masterReadArray.length * 20, // size is relative to array
      // size
      //width: tripleArray[0].length * 200
    },
    title: {
      text: "Plasmid coverage in each set of reads"
    },
    xAxis: {
      categories: tripleArray[0],
      min: 0,
      max: tripleArray[0].length - 1,
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
      symbolHeight: 200
    },
    tooltip: {
      formatter() {
        // gets accession entries for this file
        const accessionEntry = (typeof readObjects[
          this.series.xAxis.categories[this.point.x]] === "string") ?
          JSON.parse(readObjects[this.series.xAxis.categories[this.point.x]]) :
          readObjects[this.series.xAxis.categories[this.point.x]]

        // gets contig name based on the accession number of the plasmid
        const getContigName = accessionEntry[
          this.series.yAxis.categories[this.point.y]
          ]

        const plasmidLength = g.getNode(this.series.yAxis.categories[this.point.y])
          .data.seqLength.split("</span>")[1]

        // sets a default string that will be outputed for all the types of imports
        let returnString = "<b>File name: </b>" + this.series.xAxis.categories[this.point.x] +
          "<br>" + this.point.value + " <b>% coverage</b>" +
          "<br><b>Accession number: </b>" + this.series.yAxis.categories[this.point.y] +
          "<br><b>Plasmid length: </b>" + plasmidLength

        // adds contig information when array has 3 entries,
        // the third is the contig name --- This is only used in the case of
        // assembly import
        if (getContigName.length === 3) {
          returnString += "<br><b>Contig name: </b>" + getContigName[2]
        }

        // then returns the actual tooltip format
        return returnString
      }
    },
    series: [{
      name: "Coverage percentage",
      borderWidth: 1,
      data: tripleArray[1],
      dataLabels: {
        enabled: true,
        color: "#000000"
      },
      point: {
        events: {
          click(event) {
            // empties form value for plasmid or accession search, otherwise it
            // will conflict with clickedHighchart
            $("#formValueId").val("")
            clickedHighchart = event.point.series.yAxis.categories[event.point.y]
            $("#submitButton").click()
          }
        }
      }
    }],
    exporting: {
      filename: "pATLAS_heatmap"
    },
    credits: {
      enabled: false
    }
  })
  $("#chartContainer2").show()
}