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

const setupPopupDisplay = (node, speciesName, plasmidName, clusterId) => {
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
