/////////// IMPORTANT ///////////
// piece of code that should be used to match species name with
// dropdown selection
const taxaRequest = (g, graphics, renderer, taxa, currentColor, changed_nodes) => {
  taxaDb = taxa.split(" ").join("_")
  // return a promise for each query
  return $.get('api/getaccession/', {'name': taxaDb}, (data, status) => {
    let listData = []
    for (object in data) {
      listData.push(data[object].plasmid_id)
    }
    colorNodes(g, graphics, listData, currentColor, changed_nodes)
    //return listData
    renderer.rerender()
  })

}

// cycles nodes
const colorNodes = (g, graphics, accessionRequested, currentColor, changed_nodes) => {
  g.forEachNode( (node) => {
    const nodeUI = graphics.getNodeUI(node.id)

    if (accessionRequested.indexOf(node.id) > -1) {
      nodeUI.color = currentColor
      nodeUI.backupColor = nodeUI.color
      changed_nodes.push(node.id)
    }
  })
}
