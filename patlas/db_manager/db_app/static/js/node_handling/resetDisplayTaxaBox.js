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


/**
 * Function that is responsible for updating the respective element that
 * displays the information of the selected taxa, resistances, virulence or
 * plasmidfinder genes.
 * @param {Array} arrayOfSelections
 * @param {String} stringClass - the string with the class name
 * @param {String} divStringClass - the string with the div to which the
 * arrayOfSelections will be outputted in text format
 */
const filterDisplayer = (arrayOfSelections, stringClass, divStringClass) => {
  console.log(arrayOfSelections, stringClass, divStringClass)

  const taxaToParse = arrayOfSelections.join(", ")

  $(divStringClass).empty()
    .append(`${stringClass}: ${taxaToParse}`)
}


/**
 * Function similar to filterDisplayer but specific for project imports since
 * projects select automatically the dropdown menus based on the projectJson
 * object imported
 * @param {String} taxaName - the string with the taxa name
 * @param {String} stringClass - the string class for the taxa level
 * @param {String} divStringClass - the div which stores the strings in the
 * modal displayer
 */
const filterDisplayerProjects = (taxaName, stringClass, divStringClass) => {
  const taxaElements = $(divStringClass).html().split(/[:,]/)
  const taxaToParse = " " + taxaName + ","
  if (taxaElements.indexOf(taxaToParse.replace(",", "")) <= 0) {
    $(divStringClass).append(taxaToParse)
  }
}
