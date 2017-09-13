// function to get all node positions and write then to a file
const getPositions = (g, layout) => {
  let masterJSON = {
    "nodes": [],
  }
  g.forEachNode( (node) => {
    const position = layout.getNodePosition(node.id)
    // push an individual json object for each link
    //console.log(node.links)
    // this assumes that there are no duplicated links which should happen
    // given that makeHash function is making sure of that
    const links = node.links.map( (link) => {
      //console.log(node.id, link.fromId, link.toId)
      const linkData = (link.fromId === node.id) ? [link.toId, link.data] :
        (link.toId === node.id) ? [link.fromId, link.data] : null
      return linkData
    })
    masterJSON.nodes.push({
      "id": node.id,
      "length": node.data.seq_length.split(">").slice(-1).toString(),
      position,
      links
    })
  })
  console.log(masterJSON)
  //Get masterJSON to a new windows were it can be saved to filesystem by
  // right clicking it
  var url = "data:text/json;charset=utf8," +
    encodeURIComponent(JSON.stringify(masterJSON))
  window.open(url, "_blank")
  window.focus()
}

//*********************//
//    DEVEL SESSION    //
//*********************//

// devel session to get positions of each node
const initCallback = (g, layout, devel) => {
  if (devel === true && layout !== false) {
    console.log("devel on")
    getPositions(g, layout)
  } else {
    console.log("devel off")
  }
}