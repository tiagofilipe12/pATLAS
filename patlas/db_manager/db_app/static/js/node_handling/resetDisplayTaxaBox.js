// function to repopulate #displayCurrentBox
// idsArrays = ["p_Order", "p_Family", "p_Genus", "p_Species"] //global variable
function resetDisplayTaxaBox (idsArrays) {
  for (let x = 0; x < idsArrays.length; x++) {
    // empty field
    $(`#${idsArrays[x]}`).empty()
    // reset to default of html
    $(`#${idsArrays[x]}`).append(`${idsArrays[x].replace("p_", "")}: No filters applied`)
  }
}

// function to remove a specific string from an array
function stringRmArray (string, array) {
  for (let i = array.length - 1; i >= 0; i--) {
    if (array[i] === string) {
      array.splice(i, 1)
    }
  }
  return array
}
