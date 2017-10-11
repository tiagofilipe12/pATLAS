// function to parse stats

const statsParser = (masterObj) => {
  console.log(masterObj)
  const data = [{
    x: ['giraffes', 'orangutans', 'monkeys'],
    y: [20, 14, 23],
    type: 'bar'
  }]

  Plotly.newPlot('chartContainer1', data)
}

// metadata handler function

const getMetadata = (tempList) => {
  const speciesList = []
  const speciesObject = {}
  const lengthObject = {}
  for (const item in tempList) {
    nodeId = tempList[item]
    $.get('api/getspecies/', {'accession': nodeId}, (data, status) => {
      // this request uses nested json object to access json entries
      // available in the database
      // if request return no speciesName or plasmidName
      // sometimes plasmids have no descriptor for one of these or both
      if (data.json_entry.name === null) {
        speciesName = "unknown"
      } else {
        speciesName = data.json_entry.name.split("_").join(" ")
      }
      // get data for length
      if (data.json_entry.length === null) {
        speciesLength = "unknown"
      } else {
        speciesLength = data.json_entry.length
      }
      // push to main list to control the final of the loop
      speciesList.push(speciesName)
      // constructs the speciesObject object that counts the number of
      // occurrences of a species
      if (!(speciesName in speciesObject)) {
        speciesObject[speciesName] = 1
      } else {
        speciesObject[speciesName] = speciesObject[speciesName] + 1
      }
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
      if (speciesList.length === tempList.length) { statsParser({speciesObject, lengthObject}) }
    })
  }
}

// stats using node colors... if listGiFilter is empty

const statsColor = (g, graphics) => {
  let tempListAccessions = []
  g.forEachNode( (node) => {
    const currentNodeUI = graphics.getNodeUI(node.id)
    if (currentNodeUI.color === 0xFFA500ff) { tempListAccessions.push(node.id) }
  })
  // function to get the data from the accessions on the list
  getMetadata(tempListAccessions)
}
