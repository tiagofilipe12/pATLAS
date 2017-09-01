/////////// IMPORTANT ///////////
// piece of code that should be used to match species name with
// dropdown selection
const taxaRequest = (g, graphics, renderer, taxa, currentColor, changed_nodes) => {
  taxaDb = taxa.split(" ").join("_")
  $.get('api/getaccession/', {'name': taxaDb}, (data, status) => {
    let listData = []
    for (object in data) {
      //console.log(data[object].plasmid_id)
      listData.push(data[object].plasmid_id)
    }
    //console.log(listData)
    colorNodes(g, graphics, listData, currentColor, changed_nodes)
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

// get species when multiple taxa level filters are applied

const multiTaxaLevel = (g, graphics, renderer, currentColor, changed_nodes) => {

  g.forEachNode(function (node) {
    var nodeUI = graphics.getNodeUI(node.id)
    var species = node.data.species.split('>').slice(-1).toString()
    var genus = species.split(' ')[0]
    // checks if genus is in selection
    if (selectedGenus.indexOf(genus) >= 0) {
      nodeUI.color = 0xf71735
      nodeUI.backupColor = nodeUI.color
      changed_nodes.push(node.id)
    }
    // checks if species is in selection
    else if (selectedSpecies.indexOf(species) >= 0) {
      nodeUI.color = 0xf71735
      nodeUI.backupColor = nodeUI.color
      changed_nodes.push(node.id)
    }
  })
  store_lis = '<li class="centeredList"><button class="jscolor btn btn-default" style="background-color:#f71735"></button>&nbsp;multi-level selected taxa</li>'
  // displays alert
  // first check if filters are applied in order to avoid displaying when there are no filters
  for (i in alertArrays) {
    if (alertArrays[i][0] != 'No filters applied') {
      var divAlert = document.getElementById('alertId_multi')
      divAlert.style.display = 'block'
      // control the alertClose button
      $('#alertClose_multi').click(function () {
        $('#alertId_multi').hide()  // hide this div
      })
      // auto hide after 5 seconds without closing the div
      window.setTimeout(function () { $('#alertId_multi').hide() }, 5000)
    }
  }
  taxaRequest(g, graphics, renderer, tempArray[i], currentColor, changed_nodes)
}