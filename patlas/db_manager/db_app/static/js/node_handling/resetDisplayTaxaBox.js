// function to repopulate #displayCurrentBox
// idsArrays = ["p_Order", "p_Family", "p_Genus", "p_Species"] //global variable
function resetDisplayTaxaBox (idsArrays) {
  for (let x = 0; x < idsArrays.length; x++) {
    // empty field
    $(`#${idsArrays[x]}`).empty()
    // reset to default of html
    $(`#${idsArrays[x]}`).append(`${idsArrays[x].replace("p_", "")}:`)
  }
}

// function to remove a specific string from an array
// function stringRmArray (string, array) {
//   for (let i = array.length - 1; i >= 0; i--) {
//     if (array[i] === string) {
//       array.splice(i, 1)
//     }
//   }
//   return array
// }
//
// const resetsFirstInstance = (idsArrays) => {
//   // this function empties every idsArrays contrary to resetDisplayTaxaBox
//   // which adds No filters applied to visualization
//   // therefore this should be used when we want to delete every entry and
//   // add a new instance like Species: Eschericia coli
//   // NOTE:  this should not be used when multiple selections are made
//   for (let x = 0; x < idsArrays.length; x++) {
//     $(`#${idsArrays[x]}`).empty()
//   }
//   return false
// }

const taxaElementsToString = (taxaElements) => {
  console.log(taxaElements)
  const starter = taxaElements[0] + ":"
  const allOthers = taxaElements.slice(1, taxaElements.length)
  return (starter + allOthers.toString())
}

// TODO needs testing for actual datasets execution b/c string was modified
// it is allways retrieving multi taxa selected because of the comma
const filterDisplayer = (taxaName, stringClass, divStringClass) => {
  const taxaElements = $(divStringClass).html().split(/:|,/)
  const taxaToParse = " " + taxaName + ","
  console.log(taxaElements, taxaToParse)
  if (taxaElements.indexOf(taxaToParse.replace(",", "")) > -1) {
    console.log("entered", taxaToParse)
    // remove string from array
    const index = taxaElements.indexOf(taxaToParse.replace(",", "")) // gets
    // the index
    // of the
    // string
    // if higher than -1 then remove it
    if (index !== -1) {
      taxaElements.splice(index, 1)
      console.log(taxaElements)
      $(divStringClass).empty()
        .append(taxaElementsToString(taxaElements))
    }
  } else {
    // if not already in taxaElements then add it
    $(divStringClass).append(taxaToParse)
  }
  console.log($(divStringClass).html())
}

