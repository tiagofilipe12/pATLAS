/*globals listGiFilter, i */
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
const taxaRequest = async (g, graphics, renderer, taxa, currentColor) => {
  // const listOfRequests = []
  const taxaDb = taxa.replace(" ", "_")
  // return a promise for each query
  const queryResults = await $.get("api/getaccession/", {"name": taxaDb}, (data, status) => {
    let listData = []
    for (let object in data) {
      if ({}.hasOwnProperty.call(data, object)) {
        listData.push(data[object].plasmid_id)
      }
    }
    colorNodes(g, graphics, renderer, listData, currentColor)
    //return listData
    // renderer.rerender() //TODO maybe remove?
  })
  queryResults.map( (request) => {
    listGiFilter.push(request.plasmid_id)
  })
  // return listOfRequests
}


const taxaRequestWrapper = (g, graphics, renderer, assocObj, storeLis,
                            promises) => {

  Object.entries(assocObj).forEach( ([key, value]) => {

    const currentColor = colorList[i].replace("#", "0x")
    const styleColor = "background-color:" + colorList[i]

    i += 1

    storeLis = storeLis + "<li" +
      " class='centeredList'><button class='jscolor btn" +
      " btn-default' style=" + styleColor +
      "></button>&nbsp;" + key + "</li>"

    // executes node function for family
    for (const sp of value) {

      promises.push(
        taxaRequest(g, graphics, renderer, sp, currentColor)
      )
    }

  })
  return storeLis
}
