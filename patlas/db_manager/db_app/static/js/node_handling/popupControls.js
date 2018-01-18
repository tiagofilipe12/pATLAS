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
  // this will assure that even db doesn't return anything these divs are
  // emptied before adding something new
  $("#percentagePopSpan").html("")
  $("#copyNumberPopSpan").html("")
  // first needs to empty the popup in order to avoid having
  // multiple entries from previous interactions
  if (typeof node.data !== "undefined") {
    $("#accessionPop").html(node.data.sequence)
    $("#speciesNamePopSpan").html(speciesName)
    $("#lengthPop").html(node.data.seq_length)
    $("#plasmidNamePopSpan").html(plasmidName)
    $("#percentagePopSpan").html(node.data.percentage)
    $("#copyNumberPopSpan").html(node.data.copyNumber)
    $("#clusterIdPopSpan").html(clusterId)
  }

  $("#popup_description").show()
}