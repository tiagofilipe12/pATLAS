const singleDropdownPopulate = (divId, arrayToSort, className) => {
  // first sort the array alphabetically
  const sortedArray = arrayToSort.sort()
  // then iterate over the array to populate the div
  for (let i = 0; i < sortedArray.length; i++) {
    $(divId).append(`<option class=${className}>${sortedArray[i]}</option>`)
  }
  $(divId).append(`<option class=${className}><em>Other</em></option>`)
  // populate the select with the newly added options
  $(divId).selectpicker("refresh")

}