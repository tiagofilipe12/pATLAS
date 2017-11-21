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

// call the requests
const requestPlasmidTable = (node, setupPopupDisplay) => {
  // if statement to check if node is in database or is a new import
  // from mapping
  if (node.data.seq_length) {
    $.get('api/getspecies/', {'accession': node.id}, (data, status) => {
      // this request uses nested json object to access json entries
      // available in the database
      // if request return no speciesName or plasmidName
      // sometimes plasmids have no descriptor for one of these or both
      if (data.json_entry.name === null) {
        speciesName = "N/A"
      } else {
        speciesName = data.json_entry.name.split("_").join(" ")
      }
      if (data.json_entry.plasmid_name === null) {
        plasmidName = "N/A"
      } else {
        plasmidName = data.json_entry.plasmid_name
      }
      // check if data can be called as json object properly from db something like data.species or data.length
      setupPopupDisplay(node, speciesName, plasmidName) //callback
      // function for
      // node displaying after fetching data from db
    })
  }
  // exception when node has no length (used on new nodes?)
  else {
    speciesName = 'N/A'
    plasmidName = 'N/A'
    setupPopupDisplay(node, speciesName, plasmidName) //callback
  }
}