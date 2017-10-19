// function sort object by values in javascript

// const sortByValues = (obj) => {
//   const sort = (obj) => {
//     return Object.keys(obj).sort( (a, b) => {
//       return obj[b] - obj[a]
//     })
//   }
//
//   const sorted = sort(obj)
//
//   sortedKeys = sorted.map( (key) => { return key })
//   sortedValues = sorted.map( (key) => { return obj[key] })
//
//   return [sortedKeys, sortedValues]
// }

// function to parse stats

const statsParser = (masterObj, layout, autobinxVar, customColor) => {

  // by default species are executed when opening stats visualization
  const data = [{
    x: masterObj,
    type: "histogram",
    autobinx: autobinxVar,
    xbins: {
      start: Math.min(...masterObj),
      end: Math.max(...masterObj),
      size: 10000
    },
    marker: {
      color: customColor,
    }
  }]

  Plotly.newPlot("chartContainer1", data, layout)
}

// metadata handler function

const getMetadata = (tempList) => {
  const speciesList = []
  const speciesObject = {}
  for (const item in tempList) {
    if ({}.hasOwnProperty.call(tempList, item)) {
      const nodeId = tempList[item]
      $.get("api/getspecies/", {"accession": nodeId}, (data, status) => {
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
        if (!(speciesName in speciesObject)) {
          speciesObject[speciesName] = 1
        } else {
          speciesObject[speciesName] = speciesObject[speciesName] + 1
        }
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
        if (speciesList.length === tempList.length) { statsParser(speciesList, layout, true, "#B71C1C") }
      })
    }
  }
}

const getMetadataGenus = (tempList) => {
  const genusList = []
  const genusObject = {}
  for (const item in tempList) {
    if ({}.hasOwnProperty.call(tempList, item)) {
      const nodeId = tempList[item]
      $.get("api/getspecies/", {"accession": nodeId}, (data, status) => {
        // this request uses nested json object to access json entries
        // available in the database
        // if request return no genusName or plasmidName
        // sometimes plasmids have no descriptor for one of these or both
        // replace [ and ' by nothing for proper display
        const genusName = (data.json_entry.taxa === "unknown") ?
          "unknown" : data.json_entry.taxa.split(",")[0].replace(/['[]/g, "")
        // push to main list to control the final of the loop
        genusList.push(genusName)
        // constructs the genusObject object that counts the number of
        // occurrences of a species
        if (!(genusName in genusObject)) {
          genusObject[genusName] = 1
        } else {
          genusObject[genusName] = genusObject[genusName] + 1
        }
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
        if (genusList.length === tempList.length) { statsParser(genusList, layout, true, "red") }
      })
    }
  }
}

const getMetadataFamily = (tempList) => {
  const familyList = []
  const familyObject = {}
  for (const item in tempList) {
    if ({}.hasOwnProperty.call(tempList, item)) {
      const nodeId = tempList[item]
      $.get("api/getspecies/", {"accession": nodeId}, (data, status) => {
        // this request uses nested json object to access json entries
        // available in the database
        // if request return no genusName or plasmidName
        // sometimes plasmids have no descriptor for one of these or both
        // replace ' by nothing for proper display
        const familyName = (data.json_entry.taxa === "unknown") ?
          "unknown" : data.json_entry.taxa.split(",")[1].replace(/[']/g, "")
        // push to main list to control the final of the loop
        familyList.push(familyName)
        // constructs the familyObject object that counts the number of
        // occurrences of a species
        if (!(familyName in familyObject)) {
          familyObject[familyName] = 1
        } else {
          familyObject[familyName] = familyObject[familyName] + 1
        }
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
        if (familyList.length === tempList.length) { statsParser(familyList, layout, true, "#FF5722") }
      })
    }
  }
}

const getMetadataOrder = (tempList) => {
  const orderList = []
  const orderObject = {}
  for (const item in tempList) {
    if ({}.hasOwnProperty.call(tempList, item)) {
      const nodeId = tempList[item]
      $.get("api/getspecies/", {"accession": nodeId}, (data, status) => {
        // this request uses nested json object to access json entries
        // available in the database
        // if request return no genusName or plasmidName
        // sometimes plasmids have no descriptor for one of these or both
        // replace ' by nothing for proper display
        const orderName = (data.json_entry.taxa === "unknown") ?
          "unknown" : data.json_entry.taxa.split(",")[2].replace(/['\]]/g, "")
        // push to main list to control the final of the loop
        orderList.push(orderName)
        // constructs the orderObject object that counts the number of
        // occurrences of a species
        if (!(orderName in orderObject)) {
          orderObject[orderName] = 1
        } else {
          orderObject[orderName] = orderObject[orderName] + 1
        }
        // if orderList reaches the size of accessions given to tempList
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
        if (orderList.length === tempList.length) { statsParser(orderList, layout, true, "orange") }
      })
    }
  }
}

const getMetadataLength = (tempList) => {
  const lengthList = []
  const lengthObject = {}
  for (const item in tempList) {
    if ({}.hasOwnProperty.call(tempList, item)) {
      const nodeId = tempList[item]
      $.get("api/getspecies/", {"accession": nodeId}, (data, status) => {
        // this request uses nested json object to access json entries
        // available in the database

        // get data for length
        const speciesLength = (data.json_entry.length === null) ?
          "unknown" : data.json_entry.length
        // push to main list to control the final of the loop
        lengthList.push(speciesLength)
        // constructs the lengthObject that counts the number of occurrences
        // of a given distribution
        // TODO this should be categorical --> Some user provided param
        if (!(speciesLength in lengthObject)) {
          lengthObject[speciesLength] = 1
        } else {
          lengthObject[speciesLength] = lengthObject[speciesLength] + 1
        }
        // if speciesList reaches the size of accessions given to tempList
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
        if (lengthList.length === tempList.length) { statsParser(lengthList, layout, false, "#2196F3") }
      })
    }
  }
}

// stats using node colors... if listGiFilter is empty

const statsColor = (g, graphics, mode) => {
  let tempListAccessions = []
  g.forEachNode( (node) => {
    const currentNodeUI = graphics.getNodeUI(node.id)
    if (currentNodeUI.color === 0xFFA500ff) { tempListAccessions.push(node.id) }
  })
  // function to get the data from the accessions on the list
  if (mode === "species") {
    getMetadata(tempListAccessions)
  } else if (mode === "length") {
    getMetadataLength(tempListAccessions)
  } else if (mode === "genus") {
    getMetadataGenus(tempListAccessions)
  } else if (mode === "family") {
    getMetadataFamily(tempListAccessions)
  } else if (mode === "order") {
    getMetadataOrder(tempListAccessions)
  }
}
