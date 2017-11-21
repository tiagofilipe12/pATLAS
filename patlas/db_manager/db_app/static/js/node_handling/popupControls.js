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

const setupPopupDisplay = (node, speciesName, plasmidName) => {
  // first needs to empty the popup in order to avoid having
  // multiple entries from previous interactions
  $("#popup_description").empty()
  $("#popup_description").append(
    "<button id='close' class='btn btn-default' type='button'>&times;</button>" +
    "<button class='btn btn-default' id='downloadCsv'" +
    "type='button' data-toogle='tooptip'" +
    "title='Export as csv'>" +
    "<span class='glyphicon glyphicon-save-file'></span>" +
    "</button>" +
    "<div>General sequence info" +
    "<div id='accessionPop'>" +
    node.data.sequence + "</div>" +
    "<div id='speciesNamePop'><span style='color: #468499'>Species:" +
    " </span>" + speciesName +
    "</div>" + node.data.seq_length +
    "<div id='plasmidNamePop'>" +
    "<span style='color: #468499'>Plasmid: </span>" + plasmidName +
    "</div><div id='percentagePop'>" +
    "<span style='color: #468499'>Percentage:" +
    " </span>" + node.data.percentage +
    "</div><div id='copyNumberPop'>" +
    "<span style='color: #468499'>Relative copy number: " +
    "</span>" + node.data.copyNumber +
    "</div>" +
    // adds buttons for resistances and plasmid families
    "<br />" +
    "<div style='float: left;' class='btn btn-default'" +
    " id='resButton'>" +
    " Resistances" +
    "</div>" +
    "<div style='float: right;' class='btn btn-default'" +
    " id='plasmidButton'>" +
    "Plasmid families" +
    "</div>" +
    "</div>"
  )
  $("#popup_description").show()
}
