/**
 * Function that controls if a selector is being clicked for the first time
 * or if it is being deselected in order to allow to use other selectors
 * from the same level. For example, this prevents that multiple taxa selectors
 * are used at the same time
 * @param {boolean|String} lastTaxaSelector - The variable that controls the
 * last selector that was clicked. When nothing is selected it is false,
 * otherwise it will store the string with the last element that was clicked.
 * @param {Object} e - The object with the event
 * @param {Array} arrayOfSelectors - An array with all the ids of the selectors
 * to control.
 * @returns {boolean|String}
 */
const controlFiltersSameLevel = (lastTaxaSelector, e, arrayOfSelectors) => {

  // if lastTaxaSelector is false then disable all other selectors than the one
  //being clicked
  if (lastTaxaSelector === false) {
    for (const selector of arrayOfSelectors) {
      if (selector !== e.target.id) {
        $(`#${selector}`).prop("disabled", true)
      }
    }
    lastTaxaSelector = e.target.id
  } else {
    // otherwise just remove the disabled property.
    lastTaxaSelector = false
    for (const selector of arrayOfSelectors) {
      $(`#${selector}`).prop("disabled", false)
    }
  }

  // returns the state of lastTaxaSelector
  return lastTaxaSelector
}