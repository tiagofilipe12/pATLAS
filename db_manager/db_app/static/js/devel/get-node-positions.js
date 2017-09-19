const downloadJSON = (text, name, type) => {
  const a = document.createElement("a")
  const file = new Blob([text], {type})
  a.href = URL.createObjectURL(file)
  a.download = name
  a.click()
}


// function to get all node positions and write then to a file
const getPositions = (g, layout) => {
  let masterJSON = {
    "nodes": [],
    "links": []
  }
  g.forEachNode( (node) => {
    const position = layout.getNodePosition(node.id)
    masterJSON.nodes.push({
      "id": node.id,
      "length": node.data.seq_length.split(">").slice(-1).toString(),
      position,
    })
    // this doesn't filter for duplicated links
    node.links.forEach( (link) => {
      //console.log(link)
      masterJSON.links.push({
        "parentId": node.id,
        "child": (node.id === link.fromId) ? link.toId : link.fromId,
        "distance": link.data
      })
    })
  })
  // Get masterJSON to a new windows were it can be saved to filesystem by
  // right clicking it
  downloadJSON(JSON.stringify(masterJSON), "test.txt", "text/plain")
}

//*********************//
//    DEVEL SESSION    //
//*********************//

// devel session to get positions of each node
const initCallback = (g, layout, devel) => {
  if (devel === true && layout !== false) {
    //console.log("devel on")
    getPositions(g, layout)
  } //else {
    //console.log("devel off")
  //}
}
