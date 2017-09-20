// function used to download file from json object
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

  let hashStore = []

  g.forEachNode( (node) => {
    const position = layout.getNodePosition(node.id)
    masterJSON.nodes.push({
      "id": node.id,
      "length": node.data.seq_length.split(">").slice(-1).toString(),
      position,
    })
  })
  // this doesn't filter for duplicated links
  g.forEachLink( (link) => {
    console.log(link)
    const currentHash = makeHash(link.fromId, link.toId)
    if (hashStore.indexOf(currentHash) < 0) {
      masterJSON.links.push({
        "parentId": link.fromId,
        "childId": link.toId,
        "distance": link.data
      })
      hashStore.push(currentHash)
    }
  })

  // somehow, and I don't know how, this is executed sync, i.e., after
  // forEach loops
  downloadJSON(JSON.stringify(masterJSON), "filtered.json", "text/plain")
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
