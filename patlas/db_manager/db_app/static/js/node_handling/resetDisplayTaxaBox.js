/**
 * function to repopulate #displayCurrentBox
 * @param array
 */
const resetDisplayTaxaBox = (array) => {
  for (let x = 0; x < array.length; x++) {
    // empty field
    $(`#${array[x]}`).empty()
    // reset to default of html
      .append(`${array[x].replace("p_", "")}:`)
  }
}

// function to remove taxa elements from div with main control string
const taxaElementsToString = (taxaElements) => {
  const starter = taxaElements[0] + ":"
  const allOthers = taxaElements.slice(1, taxaElements.length)
  return (starter + allOthers.toString())
}

// function that controls if taxa is present in div and adds or removes
// depending if it is already there or not
const filterDisplayer = (taxaName, stringClass, divStringClass) => {
  const taxaElements = $(divStringClass).html().split(/[:,]/)
  const taxaToParse = " " + taxaName + ","
  if (taxaElements.indexOf(taxaToParse.replace(",", "")) > -1) {
    // remove string from array
    const index = taxaElements.indexOf(taxaToParse.replace(",", "")) // gets
    // the index of the string if higher than -1 then remove it
    if (index !== -1) {
      taxaElements.splice(index, 1)
      $(divStringClass).empty()
        .append(taxaElementsToString(taxaElements))
    }
  } else {
    // if not already in taxaElements then add it
    $(divStringClass).append(taxaToParse)
  }
}
