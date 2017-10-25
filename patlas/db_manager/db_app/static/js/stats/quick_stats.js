//********//
// PLOTLY //
//********//
// function to parse stats //

const statsParser = (masterObj, layout, autobinxVar, customColor, sortAlp, sortVal) => {
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
      start: Math.min(...finalArray),
      end: Math.max(...finalArray),
      size: 10000
    },
    marker: {
      color: customColor,
    }
  }]

  Plotly.newPlot("chartContainer1", data, layout)
}

const getMetadataSpecies = (data, tempList, speciesList, sortAlp, sortVal) => {
  // this request uses nested json object to access json entries
  // available in the database
  // if request return no speciesName or plasmidName
  // sometimes plasmids have no descriptor for one of these or both
  const speciesName = (data.json_entry.name === null) ?
    "unknown" : data.json_entry.name.split("_").join(" ")
  // push to main list to control the final of the loop
  speciesList.push(speciesName)
  // constructs the speciesObject object that counts the number of
  // occurrences of a species
  // if (!(speciesName in speciesObject)) {
  //   speciesObject[speciesName] = 1
  // } else {
  //   speciesObject[speciesName] = speciesObject[speciesName] + 1
  // }
  // if speciesList reaches the size of accessions given to tempList
  // EXECUTE STATS
  const layout = {
    yaxis: {
      title: "Number of selected plasmids"
    },
    xaxis: {
      title: "Species",
      tickangle: -45
    },
    title: "Species in selection",
    margin: {
      b: 200,
      l: 100
    }
  }
  if (speciesList.length === tempList.length) { statsParser(speciesList, layout, true, "#B71C1C", sortAlp, sortVal) }
  return speciesList
}

const getMetadataGenus = (data, tempList, genusList, sortAlp, sortVal) => {
  // this request uses nested json object to access json entries
  // available in the database
  // if request return no genusName or plasmidName
  // sometimes plasmids have no descriptor for one of these or both
  // replace [ and ' by nothing for proper display
  const genusName = (data.json_entry.taxa === "unknown") ?
    "unknown" : data.json_entry.taxa.split(",")[0].replace(/['[]/g, "")
  // push to main list to control the final of the loop
  genusList.push(genusName)
  // if genusList reaches the size of accessions given to tempList
  // EXECUTE STATS
  const layout = {
    yaxis: {
      title: "Number of selected plasmids"
    },
    xaxis: {
      title: "Genera",
      tickangle: -45
    },
    title: "Genera in selection",
    margin: {
      b: 200,
      l: 100
    }
  }
  if (genusList.length === tempList.length) { statsParser(genusList, layout, true, "red", sortAlp, sortVal) }
  return genusList

}

const getMetadataFamily = (data, tempList, familyList, sortAlp, sortVal) => {
  // this request uses nested json object to access json entries
  // available in the database
  // if request return no genusName or plasmidName
  // sometimes plasmids have no descriptor for one of these or both
  // replace ' by nothing for proper display
  const familyName = (data.json_entry.taxa === "unknown") ?
    "unknown" : data.json_entry.taxa.split(",")[1].replace(/[']/g, "")
  // push to main list to control the final of the loop
  familyList.push(familyName)
  // if familyList reaches the size of accessions given to tempList
  // EXECUTE STATS
  const layout = {
    yaxis: {
      title: "Number of selected plasmids"
    },
    xaxis: {
      title: "Families",
      tickangle: -45
    },
    title: "Families in selection",
    margin: {
      b: 200,
      l: 100
    }
  }
  if (familyList.length === tempList.length) { statsParser(familyList, layout, true, "#FF5722", sortAlp, sortVal) }
  return familyList
}

const getMetadataOrder = (data, tempList, orderList, sortAlp, sortVal) => {
  // this request uses nested json object to access json entries
  // available in the database
  // if request return no genusName or plasmidName
  // sometimes plasmids have no descriptor for one of these or both
  // replace ' by nothing for proper display
  const orderName = (data.json_entry.taxa === "unknown") ?
    "unknown" : data.json_entry.taxa.split(",")[2].replace(/['\]]/g, "")
  // push to main list to control the final of the loop
  orderList.push(orderName)
  // EXECUTE STATS
  const layout = {
    yaxis: {
      title: "Number of selected plasmids"
    },
    xaxis: {
      title: "Orders",
      tickangle: -45
    },
    title: "Orders in selection",
    margin: {
      b: 200,
      l: 100
    }
  }
  if (orderList.length === tempList.length) { statsParser(orderList, layout, true, "orange", sortAlp, sortVal) }
  return orderList
}

const getMetadataLength = (data, tempList, lengthList, sortAlp, sortVal) => {
  // this request uses nested json object to access json entries
  // available in the database

  // get data for length
  const speciesLength = (data.json_entry.length === null) ?
    "unknown" : data.json_entry.length
  // push to main list to control the final of the loop
  lengthList.push(speciesLength)
  // EXECUTE STATS
  const layout = {
    yaxis: {
      title: "Number of selected plasmids"
    },
    xaxis: {
      title: "Length",
      tickangle: -45
    },
    title: "Lengths in selection",
    margin: {
      b: 200,
      l: 100
    }
  }
  if (lengthList.length === tempList.length) { statsParser(lengthList, layout, false, "#2196F3", sortAlp, sortVal) }
  return lengthList
}

//**********************//
//*** MAIN FUNCTIONS ***//
//**********************//

// metadata handler function

const getMetadata = (tempList, taxaType, sortAlp, sortVal) => {
  // resets progressBar
  $("#actualProgress").css("width", "0%")
  $("#progressBar").show()
  $("#progressDiv").show()
  $("#chartContainer1").hide()
  let taxaList = []
  // const speciesObject = {}
  for (const item in tempList) {
    if ({}.hasOwnProperty.call(tempList, item)) {
      const nodeId = tempList[item]
      $.get("api/getspecies/", {"accession": nodeId}, (data, status) => {
        // for each instance of item update progressBar
        progressBarControl(parseInt(item) + 1, tempList.length)
        if (taxaType === "species") {
          taxaList = getMetadataSpecies(data, tempList, taxaList, sortAlp, sortVal)
        } else if (taxaType === "genus") {
          taxaList = getMetadataGenus(data, tempList, taxaList, sortAlp, sortVal)
        } else if (taxaType === "family") {
          taxaList = getMetadataFamily(data, tempList, taxaList, sortAlp, sortVal)
        } else if (taxaType === "order") {
          taxaList = getMetadataOrder(data, tempList, taxaList, sortAlp, sortVal)
        } else if (taxaType === "length") {
          // here i reused the names but it is not actually a taxa List but
          // rather a generic list
          taxaList = getMetadataLength(data, tempList, taxaList, sortAlp)
        }
      })
    }
  }
  return taxaList
}

// stats using node colors... if listGiFilter is empty

const statsColor = (g, graphics, mode, sortAlp, sortVal) => {
  let tempListAccessions = []
  g.forEachNode( (node) => {
    const currentNodeUI = graphics.getNodeUI(node.id)
    if (currentNodeUI.color === 0xFFA500ff) { tempListAccessions.push(node.id) }
  })
  // function to get the data from the accessions on the list
  taxaList = getMetadata(tempListAccessions, mode, sortAlp, sortVal)
  return taxaList
}
