/*globals colorList, listGiFilter, colorNodes, legendInst, typeOfProject,
blockFilterModal */

/**
 * Function to remove the first character from every string in an array
 * @param arr
 * @returns {*}
 */
const removeFirstCharFromArray = (arr) => {
  // return arr.map( (el) => el.replace(" ", ""))
  const returnArray = arr.map( (el) => {
    if (el.startsWith(" ")) {
      return el.slice(1)
    } else {
      return el
    }
  })
  return returnArray
}

/**
 * Function to populate any dropdown menu with select
 * @param {String} divId - the id of the div
 * @param {Array} arrayToSort - the array that will be sorted and put into
 * the dropdown
 * @param {String} className - the class of each select to be added to the
 * dropdown
 */
const singleDropdownPopulate = (divId, arrayToSort, className) => {
  // first sort the array alphabetically
  const sortedArray = arrayToSort.sort()

  className = (className === false) ? "" : className

  // then iterate over the array to populate the div
  for (let i = 0; i < sortedArray.length; i++) {
    $(divId).append(`<option class=${className}>${sortedArray[i]}</option>`)
  }
  // populate the select with the newly added options
  $(divId).selectpicker("refresh")
}

/**
 * Function to query the resistance database
 * @param g
 * @param graphics
 * @param renderer
 * @param {String} gene - the gene being queried
 * @param currentColor - the color code to be attributed to all nodes that have
 * the queried gene.
 * @returns {*}
 */
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
    if (currentColor !== false) {
      colorNodes(g, graphics, renderer, listData, currentColor)
      renderer.rerender()
    }
  })
}

/**
 * Function to query the plasmidfinder database
 * @param g
 * @param graphics
 * @param renderer
 * @param {String} gene - the gene being queried
 * @param currentColor - the color code to be attributed to all nodes that have
 * the queried gene.
 * @returns {*}
 */
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
    if (currentColor !== false) {
      colorNodes(g, graphics, renderer, listData, currentColor)
      renderer.rerender()
    }
  })
}

/**
 * Function to query the vfdb database
 * @param g
 * @param graphics
 * @param renderer
 * @param {String} gene - the gene being queried
 * @param currentColor - the color code to be attributed to all nodes that have
 * the queried gene.
 * @returns {*}
 */
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
    if (currentColor !== false) {
      colorNodes(g, graphics, renderer, listData, currentColor)
      renderer.rerender()
    }
  })
}

/**
 * Function to query metal resistance db (bacmet)
 * @param g
 * @param graphics
 * @param renderer
 * @param gene
 * @param currentColor
 * @returns {*}
 */
const metalRequest = (g, graphics, renderer, gene, currentColor) => {
  // return a promise for each query
  const geneQuotes = `"${gene}"`  // quotes were added to prevent substrings
  // inside other genes such as ermc ermc1 and so on
  return $.get("api/getaccessionmetal/", {"gene": geneQuotes}, (data, status) => {
    let listData = []
    for (let object in data) {
      if ({}.hasOwnProperty.call(data, object)) {
        listData.push(data[object].plasmid_id)
      }
    }
    if (currentColor !== false) {
      colorNodes(g, graphics, renderer, listData, currentColor)
      renderer.rerender()
    }
  })
}

/**
 * Function that iterates through all the arrays available for the resistance
 * databases (card and resfinder). Used within the scope of resSubmitFunction.
 * @param {Array} array - the list of all the selected resistances
 * @param g
 * @param graphics
 * @param renderer
 * @param tempPageReRun
 * @returns {Promise<string>}
 */
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
        " class='centeredList'><button class='jscolor btn btn-default'" +
        " style='background-color:" + colorList[i] + "'></button>&nbsp;" + gene +
        "</li>"

      const resHandle = await resRequest(g, graphics, renderer, gene, currentColor)
      resHandle.map( (request) => {
        if (tempPageReRun === false) {
          listGiFilter.push(request.plasmid_id)
        }
      })
    }
  }
  return storeLis
}

/**
 * Function to display resistances after clicking resSubmit button. Enables
 * queries from the left side menu
 * @param g
 * @param graphics
 * @param renderer
 * @param tempPageReRun
 * @returns {Promise<boolean>}
 */
const resSubmitFunction = async (g, graphics, renderer, tempPageReRun) => {
  listGiFilter = (tempPageReRun === false) ? [] : listGiFilter
  // starts legend variable
  let legendInst = false // by default legend is off
  let storeLis = ""  // initiates storeLis to store the legend entries and colors
  // now processes the current selection

  const cardQuery = document.getElementById("p_Card").innerHTML,
    resfinderQuery = document.getElementById("p_Resfinder").innerHTML

  let selectedCard = cardQuery.replace("Card:", "").split(",").filter(Boolean),
    selectedResfinder = resfinderQuery.replace("Resfinder:", "").split(",").filter(Boolean)
  // remove first char from selected* arrays
  selectedCard = removeFirstCharFromArray(selectedCard)
  selectedResfinder = removeFirstCharFromArray(selectedResfinder)

  // stores all resistance queries
  typeOfProject["resistance"] = {
    "card": selectedCard,
    "resfinder": selectedResfinder
  }

  if (selectedCard !== 0 || selectedResfinder.length !== 0) {
    legendInst = true
    // if blockFilterModal is false then show modal that allows to show
    // buttons to filter or not the current selection right ahead
    if (!blockFilterModal) { await $("#reRunModalResults").modal("show") }
  }

  // check if arrays are empty
  if (selectedCard.length !== 0 && selectedResfinder.length === 0) {
    // if only card has selected entries
    storeLis = await iterateSelectedArrays(selectedCard, g, graphics,
      renderer, tempPageReRun)
  } else if (selectedCard.length === 0 && selectedResfinder.length !== 0) {
    // if only resfinder has selected entries
    storeLis = await iterateSelectedArrays(selectedResfinder, g, graphics,
      renderer, tempPageReRun)
  } else if (selectedCard.length !== 0 && selectedResfinder.length !== 0) {
    // if multiple menus are selected
    const currentColor = 0xf71735   // sets color of all changes_nodes to be red
    storeLis = "<li class='centeredList'><button class='jscolor btn btn-default'" +
      " style='background-color:#f71735'></button>&nbsp;multiple selection</li>"
    const mergedSelectedArray = selectedCard.concat(selectedResfinder)
    // in this case selected color must be the same and constant

    for (let i in mergedSelectedArray) {
      if ({}.hasOwnProperty.call(mergedSelectedArray, i)) {
        const gene = mergedSelectedArray[i]

        const resHandle = await resRequest(g, graphics, renderer, gene, currentColor)
        resHandle.map( (request) => {
          if (tempPageReRun === false && !listGiFilter.includes(request.plasmid_id)) {
            listGiFilter.push(request.plasmid_id)
          }
        })
      }
    }


  } else {
    // raise error message for the user
    document.getElementById("alertId").style.display = "block"
  }

  $("#res_label").show()
  await $("#colorLegendBoxRes").empty()
    .append(
      storeLis +
      "<li class='centeredList'><button class='jscolor btn btn-default'" +
      " style='background-color:#666370' ></button>&nbsp;unselected</li>"
    )
    .show()
  return legendInst
}

/**
 * Function to display plasmidfinder after clicking pfSubmit button. Enables
 * queries from the left side menu
 * @param g
 * @param graphics
 * @param renderer
 * @param tempPageReRun
 * @returns {Promise<boolean>}
 */
const pfSubmitFunction = async (g, graphics, renderer, tempPageReRun) => {
  listGiFilter = (tempPageReRun === false) ? [] : listGiFilter
  // starts legend variable
  let legendInst = false // by default legend is off
  let storeLis = ""  // initiates storeLis to store the legend entries and colors
  // now processes the current selection
  const pfQuery = document.getElementById("p_PlasmidFinder").innerHTML

  let selectedPf = pfQuery.replace("PlasmidFinder:", "")
    .split(",")
    .filter(Boolean)

  selectedPf = removeFirstCharFromArray(selectedPf)

  // adds plasmid_finder selection to typeOfProject
  typeOfProject["plasmidFinder"] = selectedPf

  // check if arrays are empty
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
            " class='centeredList'><button class='jscolor btn btn-default'" +
            "  style='background-color:" + colorList[i] + "'></button>&nbsp;" + gene +
            "</li>"
        } else {
          storeLis = storeLis + "<li" +
            " class='centeredList'><button class='jscolor btn btn-default'" +
            " style='background-color:" + colorList[i] + "'></button>&nbsp;" + gene +
            "</li>"
        }
        // after setting the legend make the actual request
        const pfHandle = await pfRequest(g, graphics, renderer, gene, currentColor)
        pfHandle.map( (request) => {
          if (tempPageReRun === false) {
            listGiFilter.push(request.plasmid_id)
          }
        })

      }
    }
    legendInst = true

    // if blockFilterModal is false then show modal that allows to show
    // buttons to filter or not the current selection right ahead
    if (!blockFilterModal) { await $("#reRunModalResults").modal("show") }
  } else {
    // raise error message for the user
    document.getElementById("alertId").style.display = "block"
  }
  // shows legend
  $("#pf_label").show()
  await $("#colorLegendBoxPf").empty()
    .append(
      storeLis +
      "<li class='centeredList'><button class='jscolor btn btn-default'" +
      " style='background-color:#666370' ></button>&nbsp;unselected</li>"
    )
    .show()
  // }
  return legendInst
}

/**
 * Function to display virulence after clicking virSubmit button. Enables
 * queries from the left side menu
 * @param g
 * @param graphics
 * @param renderer
 * @param tempPageReRun
 * @returns {Promise<boolean>}
 */
const virSubmitFunction = async (g, graphics, renderer, tempPageReRun) => {
  listGiFilter = (tempPageReRun === false) ? [] : listGiFilter
  // starts legend variable
  let legendInst = false // by default legend is off
  let storeLis = ""  // initiates storeLis to store the legend entries and colors
  // now processes the current selection
  const pfQuery = document.getElementById("p_Virulence").innerHTML
  let selectedVir = pfQuery.replace("Virulence:", "").split(",").filter(Boolean)

  selectedVir = removeFirstCharFromArray(selectedVir)

  // adds selected virulence to typeOfProject
  typeOfProject["virulence"] = selectedVir

  // check if arrays are empty
  if (selectedVir.length !== 0) {

    for (let i in selectedVir) {
      if ({}.hasOwnProperty.call(selectedVir, i)) {
        // establish current color to use
        const currentColor = colorList[i].replace("#", "0x")
        // variable with the selected gene
        const gene = selectedVir[i].replace(" ", "")
        // variable to store all lis for legend
        if (storeLis === "undefined") {
          storeLis = "<li" +
            " class='centeredList'><button class='jscolor btn btn-default'" +
            " style='background-color:" + colorList[i] + "'></button>&nbsp;" + gene +
            "</li>"
        } else {
          storeLis = storeLis + "<li" +
            " class='centeredList'><button class='jscolor btn btn-default'" +
            " style='background-color:" + colorList[i] + "'></button>&nbsp;" + gene +
            "</li>"
        }
        // after setting the legend make the actual request
        const virHandle = await virRequest(g, graphics, renderer, gene, currentColor)
        virHandle.map( (request) => {
          if (tempPageReRun === false) {
            listGiFilter.push(request.plasmid_id)
          }
        })

        // if blockFilterModal is false then show modal that allows to show
        // buttons to filter or not the current selection right ahead
        if (!blockFilterModal) { await $("#reRunModalResults").modal("show") }
      }
    }
    legendInst = true

    // if blockFilterModal is false then show modal that allows to show
    // buttons to filter or not the current selection right ahead
    if (!blockFilterModal) { await $("#reRunModalResults").modal("show") }
  } else {
    // raise error message for the user
    document.getElementById("alertId").style.display = "block"
  }
  // shows legend
  $("#vir_label").show()
  await $("#colorLegendBoxVir").empty()
    .append(
      storeLis +
      "<li class='centeredList'><button class='jscolor btn btn-default'" +
      " style='background-color:#666370' ></button>&nbsp;unselected</li>"
    )
    .show()

  return legendInst
}

/**
 * Function to display metal resistance after clicking virSubmit button. Enables
 * queries from the left side menu
 * @param g
 * @param graphics
 * @param renderer
 * @param tempPageReRun
 * @returns {Promise<boolean>}
 */
const metalSubmitFunction = async (g, graphics, renderer, tempPageReRun) => {
  listGiFilter = (tempPageReRun === false) ? [] : listGiFilter
  // starts legend variable
  let legendInst = false // by default legend is off
  let storeLis = ""  // initiates storeLis to store the legend entries and colors
  // now processes the current selection
  const pfQuery = document.getElementById("p_Metal").innerHTML
  let selectedMetal = pfQuery.replace("Biocide & Metal:", "").split(",").filter(Boolean)

  selectedMetal = removeFirstCharFromArray(selectedMetal)

  // adds selected  metal to typeOfProject
  typeOfProject["metal"] = selectedMetal

  // check if arrays are empty
  if (selectedMetal.length !== 0) {

    for (let i in selectedMetal) {
      if ({}.hasOwnProperty.call(selectedMetal, i)) {
        // establish current color to use
        const currentColor = colorList[i].replace("#", "0x")
        // variable with the selected gene
        const gene = selectedMetal[i].replace(" ", "")
        // variable to store all lis for legend
        if (storeLis === "undefined") {
          storeLis = "<li" +
            " class='centeredList'><button class='jscolor btn btn-default'" +
            " style='background-color:" + colorList[i] + "'></button>&nbsp;" + gene +
            "</li>"
        } else {
          storeLis = storeLis + "<li" +
            " class='centeredList'><button class='jscolor btn btn-default'" +
            " style='background-color:" + colorList[i] + "'></button>&nbsp;" + gene +
            "</li>"
        }
        // after setting the legend make the actual request
        // promises.push(
        const metalHandle = await metalRequest(g, graphics, renderer, gene, currentColor)
        metalHandle.map( (request) => {
          if (tempPageReRun === false) {
            listGiFilter.push(request.plasmid_id)
          }
        })

        // if blockFilterModal is false then show modal that allows to show
        // buttons to filter or not the current selection right ahead
        if (!blockFilterModal) { await $("#reRunModalResults").modal("show") }
      }
    }
    legendInst = true

    // if blockFilterModal is false then show modal that allows to show
    // buttons to filter or not the current selection right ahead
    if (!blockFilterModal) { await $("#reRunModalResults").modal("show") }
  } else {
    // raise error message for the user
    document.getElementById("alertId").style.display = "block"
  }
  // if legend is requested then execute this!
  // shows legend
  // if (legendInst === true) {
  $("#metal_label").show()
  await $("#colorLegendBoxMetal").empty()
    .append(
      storeLis +
      "<li class='centeredList'><button class='jscolor btn btn-default'" +
      " style='background-color:#666370' ></button>&nbsp;unselected</li>"
    )
    .show()
  // }

  return legendInst
}
