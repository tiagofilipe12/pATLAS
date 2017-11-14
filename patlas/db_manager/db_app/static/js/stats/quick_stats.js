//********//
// PLOTLY //
//********//
// function to parse stats //

const statsParser = (masterObj, layout, autobinxVar, customColor, sortAlp, sortVal) => {
  console.log("master", masterObj)
  $("#progressBar").hide()
  $("#progressDiv").hide()
  $("#chartContainer1").show()

  // parse the final array
  // here it assures that sorts are made just once
  const finalArray = (sortAlp === true) ? masterObj.sort() : (sortVal === true) ? arraytByValue(masterObj) : masterObj

  // by default species are executed when opening stats visualization
  const data = [{
    x: finalArray,
    type: "histogram",
    autobinx: autobinxVar,
    xbins: {
      start: Math.min(...finalArray),  //... spread operator allows to pass
      // args in array to function
      end: Math.max(...finalArray),
      size: 10000
    },
    marker: {
      color: customColor,
    }
  }]
  Plotly.newPlot("chartContainer1", data, layout)
}

const resetProgressBar = () => {
  // resets progressBar
  $("#actualProgress").width("0%") // sets the width to 0 at each interaction
  $("#progressBar").show()
  $("#progressDiv").show()
  $("#chartContainer1").hide()
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
    .then((results) => {
      results.map(data => {
        const pfName = (data.json_entry.gene === null) ?
          "unknown" : data.json_entry.gene.replace(/['u\[\] ]/g, "").split(",")
        //then if unknown can push directly to array
        if (pfName === "unknown") {
          PFList.push(pfName)
          counter += 1
        } else {
          // otherwise needs to parse the array into an array
          for (const i in pfName) {
            PFList.push(pfName[i])
            counter += 1
          }
        }

      })
      // EXECUTE STATS
      const layout = {
        yaxis: {
          title: "Number of selected plasmids"
        },
        xaxis: {
          title: "plasmid family genes",
          tickangle: -45
        },
        title: "plasmid families in selection (from card + resfinder" +
        " database)",
        margin: {
          b: 200,
          l: 100
        }
      }
      if (PFList.length === counter) {
        statsParser(PFList, layout, true, "#2196F3", sortAlp, sortVal)
      }
      else {
        console.log("lengths", resList.length, tempList.length)
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
    .then((results) => {
      results.map(data => {
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
      const layout = {
        yaxis: {
          title: "Number of selected plasmids"
        },
        xaxis: {
          title: "resistance genes",
          tickangle: -45
        },
        title: "resistance genes in selection (from card + resfinder database)",
        margin: {
          b: 200,
          l: 100
        }
      }
      if (resList.length === counter) {
        statsParser(resList, layout, true, "#2196F3", sortAlp, sortVal)
      } else {
        console.log("lengths", resList.length, tempList.length, counter)
      }
    })

  return resList
}

//**********************//
//*** MAIN FUNCTIONS ***//
//**********************//

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
    .then((results) => {
      results.map(result => {
        // console.log("taxaList2", taxaType, taxaList, result)
        if (taxaType === "species") {
          const speciesName = (result.json_entry.name === null) ?
            "unknown" : result.json_entry.name.split("_").join(" ")
          // push to main list to control the final of the loop
          speciesList.push(speciesName)
        } else if (taxaType === "genus") {
          const genusName = (result.json_entry.taxa === "unknown") ?
            "unknown" : result.json_entry.taxa.split(",")[0].replace(/['[]/g, "")
          // push to main list to control the final of the loop
          speciesList.push(genusName)
        } else if (taxaType === "family") {
          const familyName = (result.json_entry.taxa === "unknown") ?
            "unknown" : result.json_entry.taxa.split(",")[1].replace(/[']/g, "")
          speciesList.push(familyName)
        } else if (taxaType === "order") {
          const orderName = (result.json_entry.taxa === "unknown") ?
            "unknown" : result.json_entry.taxa.split(",")[2].replace(/['\]]/g, "")
          speciesList.push(orderName)
        } else {
          const speciesLength = (result.json_entry.length === null) ?
            "unknown" : result.json_entry.length
          speciesList.push(speciesLength)
          // assumes that it is length by default
        }
      })
      // execute some function
      if (taxaType === "species") {
        console.log("after then", speciesList)
        const layout = {
          yaxis: {
            title: "Number of selected plasmids"
          },
          xaxis: {
            title: "species",
            tickangle: -45
          },
          title: "species in selection",
          margin: {
            b: 200,
            l: 100
          }
        }
        // assures that speciesList is fully generated before instanciating
        // plotly
        if (speciesList.length === tempList.length) { statsParser(speciesList, layout, true, "#B71C1C", sortAlp, sortVal) }
      } else if (taxaType === "genus") {
        const layout = {
          yaxis: {
            title: "Number of selected plasmids"
          },
          xaxis: {
            title: "genera",
            tickangle: -45
          },
          title: "genera in selection",
          margin: {
            b: 200,
            l: 100
          }
        }
        // assures that speciesList is fully generated before instanciating
        // plotly
        if (speciesList.length === tempList.length) { statsParser(speciesList, layout, true, "red", sortAlp, sortVal) }
      } else if (taxaType === "family") {
        const layout = {
          yaxis: {
            title: "Number of selected plasmids"
          },
          xaxis: {
            title: "families",
            tickangle: -45
          },
          title: "families in selection",
          margin: {
            b: 200,
            l: 100
          }
        }
        // assures that speciesList is fully generated before instanciating
        // plotly
        if (speciesList.length === tempList.length) { statsParser(speciesList, layout, true, "#FF5722", sortAlp, sortVal) }
      } else if (taxaType === "order") {
        const layout = {
          yaxis: {
            title: "Number of selected plasmids"
          },
          xaxis: {
            title: "orders",
            tickangle: -45
          },
          title: "orders in selection",
          margin: {
            b: 200,
            l: 100
          }
        }
        // assures that speciesList is fully generated before instanciating
        // plotly
        if (speciesList.length === tempList.length) { statsParser(speciesList, layout, true, "orange", sortAlp, sortVal) }
      } else {
        const layout = {
          yaxis: {
            title: "Number of selected plasmids"
          },
          xaxis: {
            title: "length",
            tickangle: -45
          },
          title: "lengths in selection",
          margin: {
            b: 200,
            l: 100
          }
        }
        // assures that speciesList is fully generated before instanciating
        // plotly
        if (speciesList.length === tempList.length) { statsParser(speciesList, layout, true, "#2196F3", sortAlp, sortVal) }
      }
    })
    .catch((error) => {
      console.log("Error: ", error)
    })
  return speciesList // this is returned async but there is no problem
}

// stats using node colors... if listGiFilter is empty

const statsColor = (g, graphics, mode, sortAlp, sortVal) => {
  let tempListAccessions = []
  g.forEachNode( (node) => {
    const currentNodeUI = graphics.getNodeUI(node.id)
    if (currentNodeUI.color === 0xFFA500ff) { tempListAccessions.push(node.id) }
  })
  console.log("tempListAccessions", tempListAccessions)
  // function to get the data from the accessions on the list
  const taxaList = (mode === "pf") ? getMetadataPF(tempListAccessions, mode, sortAlp, sortVal)
    : (mode === "res") ? getMetadataRes(tempListAccessions, mode, sortAlp, sortVal) :
    getMetadata(tempListAccessions, mode, sortAlp, sortVal)
  console.log("taxaList", taxaList)
  return taxaList
}

// repetitive function that is often called by main js
// (visualization_functions.js)
const repetitivePlotFunction = (areaSelection, listGiFilter, clickerButton, g, graphics) => {
  console.log("within function")
  const listPlots = (areaSelection === false) ?
    getMetadata(listGiFilter, clickerButton, false, false)
    : statsColor(g, graphics, clickerButton, false, false)
  console.log(listPlots)
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