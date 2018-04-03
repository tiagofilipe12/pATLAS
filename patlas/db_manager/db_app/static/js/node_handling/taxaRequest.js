/*globals listGiFilter, colorList */
// cycles nodes
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

/////////// IMPORTANT ///////////
// piece of code that should be used to match species name with
// dropdown selection
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
    colorNodes(g, graphics, renderer, listData, currentColor)
  })
}

const taxaRequest = (g, graphics, renderer, taxa, currentColor) => {

  return $.get("api/getaccessiontaxa/", {"taxa": taxa}, (data, status) => {
    let listData = []
    for (let object in data) {
      if ({}.hasOwnProperty.call(data, object)) {
        listData.push(data[object].plasmid_id)
      }
    }
    colorNodes(g, graphics, renderer, listData, currentColor)
  })
}


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

      speciesQueryResults.map( (request) => {
        listGiFilter.push(request.plasmid_id)
      })
    } else {
      const taxaQueryResults = await taxaRequest(g, graphics, renderer, sp,
        currentColor)

      taxaQueryResults.map( (request) => {
        listGiFilter.push(request.plasmid_id)
      })
    }
  }
  return [storeLis, i]
}

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

const iterateArrays = async (g, graphics, renderer, alertArrays, storeLis, i) => {

  if (alertArrays.order.length !== 0) {
    const outOrder = await taxaRequestWrapper(g, graphics, renderer, storeLis,
      i, alertArrays.order, "order")

    storeLis = outOrder[0]
    i = outOrder[1]
  }

  if (alertArrays.family.length !== 0) {
    const outFamily = await taxaRequestWrapper(g, graphics, renderer, storeLis,
      i, alertArrays.family, "family")

    storeLis = outFamily[0]
    i = outFamily[1]
  }

  if (alertArrays.genus.length !== 0) {
    const outGenera = await taxaRequestWrapper(g, graphics, renderer, storeLis,
      i, alertArrays.genus, "genus")

    storeLis = outGenera[0]
    i = outGenera[1]
  }

  if (alertArrays.species.length !== 0) {

    const outSpecies = await taxaRequestWrapper(g, graphics, renderer, storeLis,
      i, alertArrays.species, "species")

    storeLis = outSpecies[0]
    i = outSpecies[1]
  }

  await renderAfterTaxaRequests(storeLis)
}