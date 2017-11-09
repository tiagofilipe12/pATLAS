// function to populate any dropdown menu with select
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

// function to display resistances after clicking resSubmit button
const resSubmitFunction = () => {
  // now processes the current selection
  const cardQuery = document.getElementById("p_Card").innerHTML,
    resfinderQuery = document.getElementById("p_Resfinder").innerHTML
  let selectedCard = cardQuery.replace("Card:", "").split(",").filter(Boolean),
    selectedResfinder = resfinderQuery.replace("Resfinder:", "").split(",").filter(Boolean)
  // remove first char from selected* arrays
  selectedCard = removeFirstCharFromArray(selectedCard)
  selectedResfinder = removeFirstCharFromArray(selectedResfinder)
  // TODO query both of these entries similarly to taxaRequest function
  // needs setting up a flask resource first
}