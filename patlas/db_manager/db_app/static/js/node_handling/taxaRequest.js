/*globals listGiFilter, colorList, mapRequest, typeOfProject */


/**
 * Function to color nodes that are in the list under accessionRequested
 * @param {Object} g - object that stores vivagraph graph associated functions.
 * @param {Object} graphics - vivagraph functions related with node and link
 * data.
 * @param {Function} renderer - Function that forces the graph to be updated.
 * @param {Array} accessionRequested - A list of accession numbers, for which
 * the corresponding nodes will be colored by this function
 * @param {String} currentColor the hex code with the color to use for this
 * taxa.
 */
const colorNodes = (g, graphics, renderer, accessionRequested, currentColor) => {
  g.forEachNode( (node) => {
    const nodeUI = graphics.getNodeUI(node.id)

    if (accessionRequested.indexOf(node.id) > -1) {
      nodeUI.backupColor = currentColor
      nodeUI.color = currentColor
      // changed_nodes.push(node.id)
    } else {
      nodeUI.backupColor = nodeUI.color
    }
  })
  renderer.rerender()
}


/**
 * Function that fetches the accession numbers from the database given a
 * species. It searches in the psql database json_entry.name string for a
 * matching species
 * @param {Object} g - object that stores vivagraph graph associated functions.
 * @param {Object} graphics - vivagraph functions related with node and link
 * data.
 * @param {Function} renderer - Function that forces the graph to be updated.
 * @param {String} taxa - The speceis to be queried in the psql database
 * @param {String} currentColor - the hex code with the color to use for this
 * taxa.
 * @returns {Promise}
 */
const speciesRequest = (g, graphics, renderer, taxa, currentColor) => {
  // const listOfRequests = []
  const taxaDb = taxa.replace(" ", "_")
  // return a promise for each query
  return $.get("api/getaccession/", {"name": taxaDb}, (data, status) => {
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
 * Function that fetches the accession numbers from the database given a taxa
 * (that is not a species). It searches in the psql database json_entry.taxa
 * array for the existence of the queried taxa.
 * @param {Object} g - object that stores vivagraph graph associated functions.
 * @param {Object} graphics - vivagraph functions related with node and link
 * data.
 * @param {Function} renderer - Function that forces the graph to be updated.
 * @param {String} taxa - The taxa to be queried in the psql database.
 * @param {String} currentColor - the hex code with the color to use for this
 * taxa.
 * @returns {Promise}
 */
const taxaRequest = (g, graphics, renderer, taxa, currentColor) => {

  // this request searches for the presence of the queried taxa in the list
  // under json_entry.taxa
  return $.get("api/getaccessiontaxa/", {taxa}, (data, status) => {

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
 * This function handles the type of the request, when it is a query of species
 * or taxa.
 * @param {Object} g - object that stores vivagraph graph associated functions.
 * @param {Object} graphics - vivagraph functions related with node and link
 * data.
 * @param {Function} renderer - Function that forces the graph to be updated.
 * @param {String} storeLis - The string that will be appended to the legend.
 * @param {Number} i - A number that is used to control the index of the colors
 * stored in colorList variable
 * @param {Array} arrayTaxa - The list of taxa to be queried
 * @param {String} arrayType - A string that says if it is a species query or
 * not
 * @returns {Promise<*[]>}
 */
const taxaRequestWrapper = async (g, graphics, renderer, storeLis,
                                  i, arrayTaxa, arrayType) => {

  for (const sp of arrayTaxa) {

    const currentColor = colorList[i].replace("#", "0x")
    const styleColor = "background-color:" + colorList[i]
    storeLis = storeLis + "<li class='centeredList'><button" +
      " class='jscolor btn btn-default' style=" +
      styleColor + "></button>&nbsp;" + sp +
      "</li>"
    // requests taxa associated accession from db and colors
    // respective nodes
    i += 1

    if (arrayType === "species") {
      const speciesQueryResults = await speciesRequest(g, graphics, renderer,
        sp, currentColor)

      listGiFilter = mapRequest(speciesQueryResults)

    } else {
      const taxaQueryResults = await taxaRequest(g, graphics, renderer, sp,
        currentColor)

      listGiFilter = mapRequest(taxaQueryResults)

    }

  }
  return [storeLis, i]
}


/**
 * A function that will be executed after making all the queries to plot handle
 * the showing and hiding of divs, namely the legend
 * @param {String} storeLis - The string that will be appended to the legend.
 */
const renderAfterTaxaRequests = (storeLis) => {
  if (storeLis !== "") {
    // Promise.all(promises)
    //   .then( () => {
    $("#loading").hide()
    // showLegend.style.display = "block"
    $("#colorLegend").show()
    document.getElementById("taxa_label").style.display = "block" // show label
    $("#colorLegendBox").empty()
      .append(storeLis +
        "<li class='centeredList'><button class='jscolor btn btn-default'" +
        " style='background-color:#666370' ></button>&nbsp;unselected</li>")
    $("#Re_run, #go_back, #download_ds, #tableShow, #heatmapButtonTab," +
      " #plotButton").show()
    // enables button group again
    $("#toolButtonGroup button").removeAttr("disabled")
    // })
  } else {
    $("#loading").hide()
  }
}


/**
 * The key function that handles the order of the queries (order --> family
 * --> genus --> species). This is important because this way nodes with lower
 * taxonomic levels will be colored with priority (because they are the last to
 * be queried). This way it avoids that higher taxonomic levels get priority
 * instead of lower ones. This is the function that is executed under
 * visualization_functions.js.
 * @param {Object} g - object that stores vivagraph graph associated functions.
 * @param {Object} graphics - vivagraph functions related with node and link
 * data.
 * @param {Function} renderer - Function that forces the graph to be updated.
 * @param {Object} alertArrays - The object that stores a key: value with
 * type_of_taxon: [queried_taxa]
 * @param {String} storeLis - The string that will be appended to the legend.
 * @param {Number} i - A number that is used to control the index of the colors
 * stored in colorList variable.
 * @returns {Promise<void>}
 */
const iterateArrays = async (g, graphics, renderer, alertArrays, storeLis, i) => {

  // stores all queried taxa in typeOfProject
  typeOfProject["taxa"] = alertArrays

  if (alertArrays.order.length !== 0) {
    storeLis = storeLis + "<div class='header_taxa'>Orders</div>"

    const outOrder = await taxaRequestWrapper(g, graphics, renderer, storeLis,
      i, alertArrays.order, "order")

    storeLis = outOrder[0]
    i = outOrder[1]
  }

  if (alertArrays.family.length !== 0) {
    storeLis = storeLis + "<div class='header_taxa'>Families</div>"

    const outFamily = await taxaRequestWrapper(g, graphics, renderer, storeLis,
      i, alertArrays.family, "family")

    storeLis = outFamily[0]
    i = outFamily[1]
  }

  if (alertArrays.genus.length !== 0) {
    storeLis = storeLis + "<div class='header_taxa'>Genera</div>"

    const outGenera = await taxaRequestWrapper(g, graphics, renderer, storeLis,
      i, alertArrays.genus, "genus")

    storeLis = outGenera[0]
    i = outGenera[1]
  }

  if (alertArrays.species.length !== 0) {
    storeLis = storeLis + "<div class='header_taxa'>Species</div>"

    const outSpecies = await taxaRequestWrapper(g, graphics, renderer, storeLis,
      i, alertArrays.species, "species")

    storeLis = outSpecies[0]
    i = outSpecies[1]
  }

  // then after all request have been made, handle legends and buttons divs
  await renderAfterTaxaRequests(storeLis)
}