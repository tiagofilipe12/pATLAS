/**
 * Function to fix div string
 * @param {Array} divNameList
 * @returns {Array}
 */
const quickFixString = (divNameList) => {
  let returnArray = []
  for (const divName of divNameList) {
    returnArray.push($(divName).text().replace(":", ",").trim())
  }
  return returnArray
}

/**
 * Array to export an array to an csv file. This function collects info in
 * an array and forces it to be downloaded to a file
 * @param {Array} array - the array of entries to be dumped into csv export.
 */
const arrayToCsv = (array) => {
  // should parse an array with key: value, e.g. [
  let csvContent = "data:text/csv;charset=utf-8,"
  array.forEach( (entry) => {
    // each array will correspond to a row
    csvContent += entry + "\n"
  })
  const encodedUri = encodeURI(csvContent)
  // window.open(encodedUri)
  const link = document.createElement("a")
  link.setAttribute("href", encodedUri)
  link.setAttribute("download", "pATLAS_entry.csv")
  document.body.appendChild(link) // Required for FF
  link.click() // This will download the data file named "my_data.csv".
}


/**
 * Function to remove attribute from object, in this case the objects from nodes
 * that are used to render popup_description
 * @param {Object} node - this object contains all node associated data.
 */
const removeImportInfo = (node) => {

  const arrayDivs = [
    "percentage",
    "copyNumber",
    "percMash",
    "sharedHashes",
    "percMashDist"
  ]

  arrayDivs.forEach( (e) => delete node.data[e])
}

/**
 * Function that prepares the top-right corner popup to display
 * @param {Object} node - node object that contains the metadata associated
 * with that plasmid
 * @param {String} speciesName - a string with the species name of the node
 * being displayed
 * @param {String} plasmidName - a string with the plasmid name of the node
 * being displayed
 * @param {String} clusterId - A string with the id of the cluster being
 * displayed
 */
const setupPopupDisplay = (node, speciesName, plasmidName, clusterId) => {

  // empties individual divs for imports
  $("#percentagePopMashDist, #hashPop, #percentagePopMash, #copyNumberPop, " +
    "#percentagePop").hide()
  $("#percentagePopSpan, #percentagePopSpanMash, #copyNumberPopSpan, " +
    "#percentagePopMashDistSpan, #hashPopSpan").html("")

  // adds everything that is common metadata to the database
  if (typeof node.data !== "undefined") {
    $("#accessionPop").html(node.data.sequence)
    $("#speciesNamePopSpan").html(speciesName)
    $("#lengthPop").html(node.data.seqLength)
    $("#plasmidNamePopSpan").html(plasmidName)
    $("#clusterIdPopSpan").html(clusterId)
  }
  
  if (node.data.percentage) {
    //if statement to append to mapping divs in popup_description
    $("#percentagePopSpan").html(node.data.percentage)

    $("#percentagePop").show()
    $("#importDiv").show()
  }

  if (node.data.percMash) {
    //if statement to append to mash screen divs in popup_description
    $("#percentagePopSpanMash").html(node.data.percMash)
    $("#copyNumberPopSpan").html(node.data.copyNumber)

    $("#copyNumberPop, #percentagePopMash").show()
    $("#importDiv").show()
  }

  if (node.data.percMashDist) {
    // if statement to append mash dist divs in popup_description
    $("#percentagePopSpanMashDist").html(node.data.percMashDist)
    $("#hashPopSpan").html(node.data.sharedHashes)

    $("#percentagePopMashDist, #hashPop").show()
    $("#importDiv").show()
  }

  if (!node.data.percentage && !node.data.percMash && !node.data.percMashDist) {
    // if none of the import data is associated with the node then hide
    // the importDiv
    $("#importDiv").hide()
  }

  $("#popup_description").show()
}