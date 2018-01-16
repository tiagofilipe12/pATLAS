/* globals colorList, listGiFilter, colorNodes, legendInst */

// function to remove first char from every string in array
// of course array must have strings
const removeFirstCharFromArray = (array) => {
  return array.map( (el) => el.slice(1))
}

// function to populate any dropdown menu with select
const singleDropdownPopulate = (divId, arrayToSort, className) => {
  // first sort the array alphabetically
  const sortedArray = arrayToSort.sort()
  // then iterate over the array to populate the div
  for (let i = 0; i < sortedArray.length; i++) {
    $(divId).append(`<option class=${className}>${sortedArray[i]}</option>`)
  }
  // $(divId).append(`<option class=${className}><em>unknown</em></option>`)
  // populate the select with the newly added options
  $(divId).selectpicker("refresh")
}

// function to query resistance database
const resRequest = (g, graphics, renderer, gene, currentColor) => {
  // return a promise for each query
  const geneQuotes = `"${gene}"`  // quotes were added to prevent substrings
  // inside other genes such as ermc ermc1 and so on
  return $.get("api/getaccessionres/", {"gene": geneQuotes}, (data, status) => {
    let listData = []
    for (let object in data) {
      if ({}.hasOwnProperty.call(data, object)) {
        listData.push(data[object].plasmid_id)
      }
    }
    colorNodes(g, graphics, renderer, listData, currentColor)
    renderer.rerender()
  })
}

// function to query plasmidfinder database
const pfRequest = (g, graphics, renderer, gene, currentColor) => {
  // return a promise for each query
  const geneQuotes = `"${gene}"`  // quotes were added to prevent substrings
  // inside other genes such as ermc ermc1 and so on
  return $.get("api/getaccessionpf/", {"gene": geneQuotes}, (data, status) => {
    let listData = []
    for (let object in data) {
      if ({}.hasOwnProperty.call(data, object)) {
        listData.push(data[object].plasmid_id)
      }
    }
    colorNodes(g, graphics, renderer, listData, currentColor)
    renderer.rerender()
  })
}

// function to query plasmidfinder database
const virRequest = (g, graphics, renderer, gene, currentColor) => {
  // return a promise for each query
  const geneQuotes = `"${gene}"`  // quotes were added to prevent substrings
  // inside other genes such as ermc ermc1 and so on
  return $.get("api/getaccessionvir/", {"gene": geneQuotes}, (data, status) => {
    let listData = []
    for (let object in data) {
      if ({}.hasOwnProperty.call(data, object)) {
        listData.push(data[object].plasmid_id)
      }
    }
    colorNodes(g, graphics, renderer, listData, currentColor)
    renderer.rerender()
  })
}

const iterateSelectedArrays = async (array, g, graphics, renderer, tempPageReRun) => {
  let storeLis = ""
  for (let i in array) {
    if ({}.hasOwnProperty.call(array, i)) {
      // establish current color to use
      const currentColor = colorList[i].replace("#", "0x")
      // variable with the selected gene
      const gene = array[i]
      // variable to store all lis for legend
      storeLis = storeLis + "<li" +
        " class='centeredList'><button class='jscolor btn'" +
        " btn-default' style='background-color:" + colorList[i] + "'></button>&nbsp;" + gene +
        "</li>"

      const resHandle = await resRequest(g, graphics, renderer, gene, currentColor)
      resHandle.map( (request) => {
        if (tempPageReRun === false) {
          listGiFilter.push(request.plasmid_id)
        }
      })
        // .then( (results) => {
        //   results.map( (request) => {
        //     if (tempPageReRun === false) {
        //       listGiFilter.push(request.plasmid_id)
        //     }
        //   })
        // })
    }
  }
  return storeLis
}

// function to display resistances after clicking resSubmit button
const resSubmitFunction = async (g, graphics, renderer, tempPageReRun) => {
  listGiFilter = (tempPageReRun === false) ? [] : listGiFilter
  // starts legend variable
  let legendInst = false // by default legend is off
  let storeLis  // initiates storeLis to store the legend entries and colors
  // now processes the current selection
  const cardQuery = document.getElementById("p_Card").innerHTML,
    resfinderQuery = document.getElementById("p_Resfinder").innerHTML
  let selectedCard = cardQuery.replace("Card:", "").split(",").filter(Boolean),
    selectedResfinder = resfinderQuery.replace("Resfinder:", "").split(",").filter(Boolean)
  // remove first char from selected* arrays
  selectedCard = removeFirstCharFromArray(selectedCard)
  selectedResfinder = removeFirstCharFromArray(selectedResfinder)
  // const promises = []
  // check if arrays are empty
  if (selectedCard.length !== 0 && selectedResfinder.length === 0) {
    // if only card has selected entries
    storeLis = await iterateSelectedArrays(selectedCard, g, graphics, renderer, tempPageReRun)
    legendInst = true
  } else if (selectedCard.length === 0 && selectedResfinder.length !== 0) {
    // if only resfinder has selected entries
    storeLis = await iterateSelectedArrays(selectedResfinder, g, graphics, renderer, tempPageReRun)
    legendInst = true
  } else if (selectedCard.length !== 0 && selectedResfinder.length !== 0) {
    // if multiple menus are selected
    const currentColor = 0xf71735   // sets color of all changes_nodes to be red
    storeLis = "<li class='centeredList'><button class='jscolor btn'" +
      " btn-default'" +
      " style='background-color:#f71735'></button>&nbsp;multiple selection</li>"
    legendInst = true
    const mergedSelectedArray = selectedCard.concat(selectedResfinder)
    // in this case selected color must be the same and constant
    for (let i in mergedSelectedArray) {
      if ({}.hasOwnProperty.call(mergedSelectedArray, i)) {
        const gene = mergedSelectedArray[i]

        const resHandle = await resRequest(g, graphics, renderer, gene, currentColor)
        resHandle.map( (request) => {
          if (tempPageReRun === false) {
            listGiFilter.push(request.plasmid_id)
          }
        })
        // promises.push(
        //   resRequest(g, graphics, renderer, gene, currentColor)
        //     .then( (results) => {
        //       results.map( (request) => {
        //         if (tempPageReRun === false) {
        //           listGiFilter.push(request.plasmid_id)
        //         }
        //       })
        //     })
        // )
      }
    }
  } else {
    // raise error message for the user
    document.getElementById("alertId").style.display = "block"
  }
  // if legend is requested then execute this!
  // shows legend
  // return Promise.all(promises)
  //   .then( () => {
  console.log(storeLis)
  if (legendInst === true) {
    $("#res_label").show()
    $("#colorLegendBoxRes").empty()
    $("#colorLegendBoxRes").append(
      storeLis +
      "<li class='centeredList'><button class='jscolor btn btn-default'" +
      " style='background-color:#666370' ></button>&nbsp;unselected</li>"
    )
    $("#colorLegendBoxRes").show()
  }
  return legendInst
  // })
}

// function to display resistances after clicking resSubmit button
const pfSubmitFunction = async (g, graphics, renderer, tempPageReRun) => {
  listGiFilter = (tempPageReRun === false) ? [] : listGiFilter
  // starts legend variable
  let legendInst = false // by default legend is off
  let storeLis = ""  // initiates storeLis to store the legend entries and colors
  // now processes the current selection
  const pfQuery = document.getElementById("p_Plasmidfinder").innerHTML
  let selectedPf = pfQuery.replace("Plasmidfinder:", "").split(",").filter(Boolean)
  // remove first char from selected* arrays
  // selectedPf = removeFirstCharFromArray(selectedPf)
  // check if arrays are empty
  // const promises = []
  if (selectedPf.length !== 0) {
    // if only card has selected entries
    for (let i in selectedPf) {
      if ({}.hasOwnProperty.call(selectedPf, i)) {
        // establish current color to use
        const currentColor = colorList[i].replace("#", "0x")
        // variable with the selected gene
        const gene = selectedPf[i].replace(" ", "")
        // variable to store all lis for legend
        if (storeLis === "undefined") {
          storeLis = "<li" +
            " class='centeredList'><button class='jscolor btn'" +
            " btn-default' style='background-color:" + colorList[i] + "'></button>&nbsp;" + gene +
            "</li>"
        } else {
          storeLis = storeLis + "<li" +
            " class='centeredList'><button class='jscolor btn'" +
            " btn-default' style='background-color:" + colorList[i] + "'></button>&nbsp;" + gene +
            "</li>"
        }
        // after setting the legend make the actual request
        // promises.push(
        const pfHandle = await pfRequest(g, graphics, renderer, gene, currentColor)
        pfHandle.map( (request) => {
          if (tempPageReRun === false) {
            listGiFilter.push(request.plasmid_id)
          }
        })
          // .then( (results) => {
          //   results.map( (request) => {
          //     if (tempPageReRun === false) {
          //       listGiFilter.push(request.plasmid_id)
          //     }
          //   })
          // })
        // )
      }
    }
    legendInst = true
  } else {
    // raise error message for the user
    document.getElementById("alertId").style.display = "block"
  }
  // if legend is requested then execute this!
  // shows legend
  // return Promise.all(promises)
  //   .then( () => {
  if (legendInst === true) {
    $("#pf_label").show()
    $("#colorLegendBoxPf").empty()
    $("#colorLegendBoxPf").append(
      storeLis +
      "<li class='centeredList'><button class='jscolor btn btn-default'" +
      " style='background-color:#666370' ></button>&nbsp;unselected</li>"
    )
    $("#colorLegendBoxPf").show()
  }
  return legendInst
  // })
}

// function to display resistances after clicking resSubmit button
const virSubmitFunction = async (g, graphics, renderer, tempPageReRun) => {
  listGiFilter = (tempPageReRun === false) ? [] : listGiFilter
  // starts legend variable
  let legendInst = false // by default legend is off
  let storeLis = ""  // initiates storeLis to store the legend entries and colors
  // now processes the current selection
  const pfQuery = document.getElementById("p_Virulence").innerHTML
  let selectedVir = pfQuery.replace("Virulence:", "").split(",").filter(Boolean)
  // remove first char from selected* arrays
  // selectedPf = removeFirstCharFromArray(selectedPf)
  // check if arrays are empty
  // const promises = []
  if (selectedVir.length !== 0) {
    // if only card has selected entries
    for (let i in selectedVir) {
      if ({}.hasOwnProperty.call(selectedVir, i)) {
        // establish current color to use
        const currentColor = colorList[i].replace("#", "0x")
        // variable with the selected gene
        const gene = selectedVir[i].replace(" ", "")
        // variable to store all lis for legend
        if (storeLis === "undefined") {
          storeLis = "<li" +
            " class='centeredList'><button class='jscolor btn'" +
            " btn-default' style='background-color:" + colorList[i] + "'></button>&nbsp;" + gene +
            "</li>"
        } else {
          storeLis = storeLis + "<li" +
            " class='centeredList'><button class='jscolor btn'" +
            " btn-default' style='background-color:" + colorList[i] + "'></button>&nbsp;" + gene +
            "</li>"
        }
        // after setting the legend make the actual request
        // promises.push(
        const virHandle = await virRequest(g, graphics, renderer, gene, currentColor)
        virHandle.map( (request) => {
          if (tempPageReRun === false) {
            listGiFilter.push(request.plasmid_id)
          }
        })
        //     .then( (results) => {
        //       results.map( (request) => {
        //         if (tempPageReRun === false) {
        //           listGiFilter.push(request.plasmid_id)
        //         }
        //       })
        //     })
        // )
      }
    }
    legendInst = true
  } else {
    // raise error message for the user
    document.getElementById("alertId").style.display = "block"
  }
  // if legend is requested then execute this!
  // shows legend
  // return Promise.all(promises)
  //   .then( () => {
  if (legendInst === true) {
    $("#vir_label").show()
    $("#colorLegendBoxVir").empty()
    $("#colorLegendBoxVir").append(
      storeLis +
      "<li class='centeredList'><button class='jscolor btn btn-default'" +
      " style='background-color:#666370' ></button>&nbsp;unselected</li>"
    )
    $("#colorLegendBoxVir").show()
  }
  return legendInst
  // })
}