/////////// IMPORTANT ///////////
// piece of code that should be used to match species name with
// dropdown selection
function taxaRequest(graphics, renderer, taxa, currentColor, changed_nodes) {
  taxaDb = taxa.split(" ").join("_")
  $.get('api/getaccession/', {'name': taxaDb}, function (data, status) {
    var listData = []
    for (object in data) {
      //console.log(data[object].plasmid_id)
      listData.push(data[object].plasmid_id)
    }
    //console.log(listData)
    colorNodes(graphics, listData, currentColor, changed_nodes)
    renderer.rerender()
  })
}

// cycles nodes
function colorNodes(graphics, accessionRequested, currentColor, changed_nodes) {
  g.forEachNode(function (node) {
    var nodeUI = graphics.getNodeUI(node.id)

    if (accessionRequested.indexOf(node.id) > -1) {
      nodeUI.color = currentColor
      nodeUI.backupColor = nodeUI.color
      changed_nodes.push(node.id)
    }
  })
}