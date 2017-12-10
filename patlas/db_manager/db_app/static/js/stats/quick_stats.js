//********//
// PLOTS  //
//********//

const arraytoHighcharts = (array) => {
  const report = {}
  const exportArray = []
  const categories = []
  // puts every unique entry in array into a unique key in object report
  array.forEach( (el) => {
    report[el] = report[el] + 1 || 1
  })
  for (const entry in report) {
    if ({}.hasOwnProperty.call(report, entry)) {
      exportArray.push({
        name: entry,
        y: report[entry]
      })
      categories.push(entry)
    }
  }
  // returns two arrays: exportArray with the data array and categories
  // array for x labels
  return [exportArray, categories]
}

// function to parse stats //
const statsParser = (accessionResultsList, masterObj, layout, taxaType, sortAlp, sortVal) => {
  // controls progress bar div
  $("#progressBar").hide()
  $("#progressDiv").hide()
  $("#chartContainer1").show()

  const colorsPlot = {
    species: "#058DC7",
    genus: "#50B432",
    family: "#ED561B",
    order: "#DDDF00",
    resistances: "#24CBE5",
    plasmidfamilies: "#64E572",
    length: "#FF9655"
  }

  // parse the final array
  // here it assures that sorts are made just once
  const finalArray = (sortAlp === true) ? masterObj.sort() : (sortVal === true) ? arraytByValue(masterObj) : masterObj
  const doubleArray = arraytoHighcharts(finalArray)

  // categories have to be added to the xAxis labels
  if (taxaType !== "length") {
    layout.xAxis = {categories: doubleArray[1]}
    // then add the series to the graph itself
    layout.series = [{
      type: "column",
      data: doubleArray[0],
      name: "# of plasmids",
      showInLegend: false,
      color: colorsPlot[taxaType.replace(" ", "")]
    }]
    // enable sort buttons again
    $("#sortGraph").removeAttr("disabled")
    $("#sortGraphAlp").removeAttr("disabled")
  } else {
    //converts every element in finalArray to float and then sorts it
    const histoArray = finalArray.map( (e) => { return parseFloat(e) }).sort()
    layout.xAxis = [{
      labels: { enabled: false},
      categories: accessionResultsList,
      title: { text: null},
      opposite: true
    }, {
     title: { text: "Sequence size (histogram)"},
     // opposite: true
    }]
    layout.yAxis = [{
      title: { text: "Sequence size (scatter)"},
      opposite: true
    }, {
      title: { text: "Number of plasmids (histogram)"},
      // opposite: true
    }]
    // tooltip that enables different tooltips on each series
    // series.name is here used to return different tooltips for each
    layout.tooltip = {
      formatter: function() {
        if (this.series.name === "Individual plasmids") {
          return "<b>Accession no.: </b>" +
            this.x + "<br><b>Size (bp): </b>" + this.y
        } else {
          return "<b>No. of plasmids: </b>" + this.y + "<br><b>Range: </b>" +
            Math.floor(this.x + 1) + " - " + Math.floor(this.point.x2)
        }
      }
    }
    layout.series = [{
      type: "histogram",
      name: "Distribution by length",
      xAxis: 1,
      yAxis: 1,
      baseSeries: 1,
      color: colorsPlot[taxaType.replace(" ", "")],
      zIndex: -1
    }, {
      name: "Individual plasmids",
      type: "scatter",
      data: histoArray,
      marker: {
        radius: 3
      }
    }]
    // disable sort buttons
    $("#sortGraph").attr("disabled", true)
    $("#sortGraphAlp").attr("disabled", true)
  }
  Highcharts.chart("chartContainer1", layout)
}

const resetProgressBar = () => {
  // resets progressBar
  $("#actualProgress").width("0%") // sets the width to 0 at each interaction
  $("#progressBar").show()
  $("#progressDiv").show()
  $("#chartContainer1").hide()
}

// function to make layout
const layoutGet = (taxaType, length) => {
  return {
    chart: {
      zoomType: "x",
      panKey: "ctrl",   //key used to navigate the graph when zommed
      panning: true     // allow paning of the graph when zommed
    },
    title: {
      text: `${length} ${taxaType} in selection`
    },
    yAxis: {
      title: {
        text: "Number of selected plasmids"
      }
    }
  }
}

// function equivalent to getMetadata but for Database db (plasmidfinder db)
const getMetadataPF = (tempList, taxaType, sortAlp, sortVal) => {
  // resets progressBar
  resetProgressBar()

  let PFList = []
  let promises = []

  for (const item in tempList) {
    if ({}.hasOwnProperty.call(tempList, item)) {
      const nodeId = tempList[item]
      promises.push(
        $.get("api/getplasmidfinder/", {"accession": nodeId}, () => {
          // for each instance of item update progressBar
          progressBarControl(parseInt(item) + 1, tempList.length)
        })
      )
    }
  }

  let counter = 0
  // when all promises are gathered
  Promise.all(promises)
    .then( (results) => {
      results.map( (data) => {
        const pfName = (data.json_entry.gene === null) ?
          "unknown" : data.json_entry.gene.replace(/['u\[\] ]/g, "").split(",")
        //then if unknown can push directly to array
        if (pfName === "unknown") {
          PFList.push(pfName)
          counter += 1
        } else {
          // otherwise needs to parse the array into an array
          for (const i in pfName) {
            if ({}.hasOwnProperty.call(pfName, i)) {
              PFList.push(pfName[i])
              counter += 1
            }
          }
        }

      })
      // EXECUTE STATS
      if (PFList.length === counter) {
        const layout = layoutGet(taxaType, [...new Set(PFList)].length)
        statsParser(false, PFList, layout, taxaType, sortAlp, sortVal)
      }
    })

  return PFList
}

// function equivalent to getMetadata but for Card db
const getMetadataRes = (tempList, taxaType, sortAlp, sortVal) => {
  // TODO this should plot resfinder and card seperately
  // resets progressBar
  resetProgressBar()

  let resList = []
  let promises = []

  for (const item in tempList) {
    if ({}.hasOwnProperty.call(tempList, item)) {
      const nodeId = tempList[item]
      promises.push(
        $.get("api/getresistances/", {"accession": nodeId}, () => {
          // for each instance of item update progressBar
          progressBarControl(parseInt(item) + 1, tempList.length)
        })
      )
    }
  }

  // when all promises are gathered
  let counter = 0
  Promise.all(promises)
    .then( (results) => {
      results.map( (data) => {
        const pfName = (data.json_entry.gene === null) ?
          "unknown" : data.json_entry.gene.replace(/['u\[\] ]/g, "").split(",")
        //then if unknown can push directly to array
        if (pfName === "unknown") {
          counter += 1
          resList.push(pfName)
        } else {
          // otherwise needs to parse the array into an array
          for (const i in pfName) {
            resList.push(pfName[i])
            counter += 1
          }
        }

      })
      // EXECUTE STATS
      if (resList.length === counter) {
        const layout = layoutGet(taxaType, [...new Set(resList)].length)
        statsParser(false, resList, layout, taxaType, sortAlp, sortVal)
      }
    })

  return resList
}

// metadata handler function

const getMetadata = (tempList, taxaType, sortAlp, sortVal) => {
  // resets progressBar
  resetProgressBar()
  let speciesList = []
  let promises = []
  // const speciesObject = {}
  for (const item in tempList) {
    if ({}.hasOwnProperty.call(tempList, item)) {
      const nodeId = tempList[item]
      promises.push(
        // query used to push to promise the . there is no need for the
        // function that parses the data and status but just to push data
        // into the promises array
        $.get("api/getspecies/", {"accession": nodeId}, () => {
          // for each instance of item update progressBar
          progressBarControl(parseInt(item) + 1, tempList.length)

        })
      )
    }
  }
  // waits for all promises to finish and then execute functions that will
  // render the graph
  Promise.all(promises)
    .then( (results) => {
      const accessionResultsList = []
      results.map( (result) => {
        // checks if plasmid is present in db
        if (result.plasmid_id !== null) {
          if (taxaType === "species") {
            const speciesName = (result.json_entry.name === null) ? "unknown" : result.json_entry.name.split("_").join(" ")
            // push to main list to control the final of the loop
            speciesList.push(speciesName)
          } else if (taxaType === "genus") {
            const genusName = (result.json_entry.taxa === "unknown") ? "unknown" : result.json_entry.taxa.split(",")[0].replace(/['[]/g, "")
            // push to main list to control the final of the loop
            speciesList.push(genusName)
          } else if (taxaType === "family") {
            const familyName = (result.json_entry.taxa === "unknown") ? "unknown" : result.json_entry.taxa.split(",")[1].replace(/[']/g, "")
            speciesList.push(familyName)
          } else if (taxaType === "order") {
            const orderName = (result.json_entry.taxa === "unknown") ? "unknown" : result.json_entry.taxa.split(",")[2].replace(/['\]]/g, "")
            speciesList.push(orderName)
          } else {
            const speciesLength = (result.json_entry.length === null) ? "unknown" : result.json_entry.length
            speciesList.push(speciesLength)
            accessionResultsList.push(result.plasmid_id)
            // assumes that it is length by default
          }
        } else {
          // this adds in the case of singletons
          speciesList.push("singletons") // have no way to know since it is
          // not in db
        }
      })
      // if (taxaType === "species") {
      const layout = layoutGet(taxaType, [...new Set(speciesList)].length)
      if (speciesList.length === tempList.length) { statsParser(accessionResultsList, speciesList, layout, taxaType, sortAlp, sortVal) }
    })
    .catch( (error) => {
      console.log("Error: ", error)
    })
  return speciesList // this is returned async but there is no problem
}

// stats using node colors... if listGiFilter is empty

const statsColor = (g, graphics, mode, sortAlp, sortVal) => {
  let tempListAccessions = []
  g.forEachNode( (node) => {
    const currentNodeUI = graphics.getNodeUI(node.id)
    if (currentNodeUI.color === 0x23A900) { tempListAccessions.push(node.id) }
  })
  // function to get the data from the accessions on the list
  const taxaList = (mode === "plasmid families") ? getMetadataPF(tempListAccessions, mode, sortAlp, sortVal)
    : (mode === "resistances") ? getMetadataRes(tempListAccessions, mode, sortAlp, sortVal) :
    getMetadata(tempListAccessions, mode, sortAlp, sortVal)
  return taxaList
}

// repetitive function that is often called by main js
// (visualization_functions.js)
const repetitivePlotFunction = (areaSelection, listGiFilter, clickerButton, g, graphics) => {
  const listPlots = (areaSelection === false) ?
    getMetadata(listGiFilter, clickerButton, false, false)
    : statsColor(g, graphics, clickerButton, false, false)
  return listPlots
}

const pfRepetitivePlotFunction = (areaSelection, listGiFilter, clickerButton, g, graphics) => {
  const listPlots = (areaSelection === false) ? getMetadataPF(listGiFilter, clickerButton, false, false)
    : statsColor(g, graphics, clickerButton, false, false)
  return listPlots
}

const resRepetitivePlotFunction = (areaSelection, listGiFilter, clickerButton, g, graphics) => {
  const listPlots = (areaSelection === false) ? getMetadataRes(listGiFilter, clickerButton, false, false)
    : statsColor(g, graphics, clickerButton, false, false)
  return listPlots
}
