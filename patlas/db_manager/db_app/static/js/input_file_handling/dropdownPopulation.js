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

// function to query resistance database
const resRequest = (g, graphics, renderer, gene, currentColor) => {
  // return a promise for each query
  geneQuotes = `"${gene}"`  // quotes were added to prevent substrings
  // inside other genes such as ermc ermc1 and so on
  return $.get("api/getaccessionres/", {"gene": geneQuotes}, (data, status) => {
    let listData = []
    for (object in data) {
      listData.push(data[object].plasmid_id)
    }
    colorNodes(g, graphics, listData, currentColor)
    renderer.rerender()
  })
}

const iterateSelectedArrays = (array, g, graphics, renderer) => {
  for (let i in array) {
    currentColor = colorList[i].replace('#', '0x')
    gene = array[i]
    resRequest(g, graphics, renderer, gene, currentColor)
      .then(results => {
        results.map(request => {
          listGiFilter.push(request.plasmid_id)
        })
      })
  }
}

// function to display resistances after clicking resSubmit button
const resSubmitFunction = (g, graphics, renderer) => {
  // reset every button click
  changedNodes = []
  // now processes the current selection
  const cardQuery = document.getElementById("p_Card").innerHTML,
    resfinderQuery = document.getElementById("p_Resfinder").innerHTML
  let selectedCard = cardQuery.replace("Card:", "").split(",").filter(Boolean),
    selectedResfinder = resfinderQuery.replace("Resfinder:", "").split(",").filter(Boolean)
  // remove first char from selected* arrays
  selectedCard = removeFirstCharFromArray(selectedCard)
  selectedResfinder = removeFirstCharFromArray(selectedResfinder)
  // check if arrays are empty
  if (selectedCard.length !== 0 && selectedResfinder.length === 0) {
    // if only card has selected entries
    iterateSelectedArrays(selectedCard, g, graphics, renderer)
  } else if (selectedCard.length === 0 && selectedResfinder.length !== 0) {
    // if only resfinder has selected entries

  } else {
    // if multiple menus are selected
    currentColor = 0xf71735   // sets color of all changes_nodes to be red
    storeLis = "<li class='centeredList'><button class='jscolor btn'" +
      " btn-default' style='background-color:#f71735'></button>&nbsp;multi-level selected taxa</li>"
  }
  // TODO query both of these entries similarly to taxaRequest function
  //resRequest(g, graphics, renderer, gene, currentColor)
  // needs setting up a flask resource first
}