/////////// IMPORTANT ///////////
// piece of code that should be used to match species name with
// dropdown selection
function taxaRequest(g, graphics, renderer, taxa, currentColor) {
  taxaDb = taxa.split(" ").join("_")
  $.get('api/getaccession/', {'name': taxaDb}, function (data, status) {
    var listData = []
    //console.log(data)
    for (object in data) {
      //console.log(data[object].plasmid_id)
      listData.push(data[object].plasmid_id)
    }
    //console.log(listData)
    colorNodes(g, graphics, listData, currentColor)
    renderer.rerender()
  })
}

// cycles nodes
function colorNodes(g, graphics, accessionRequested, currentColor) {
  g.forEachNode(function (node) {
    var nodeUI = graphics.getNodeUI(node.id)

    if (accessionRequested.indexOf(node.id) > -1) {
      nodeUI.color = currentColor
      nodeUI.backupColor = nodeUI.color
      changed_nodes.push(node.id)
    }
  })
}