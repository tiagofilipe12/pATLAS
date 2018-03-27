/*globals makeHash */

// function used to download file from json object
/**
 * Function used to download file to json object from masterJSON object that
 * contains a more organized structure to the JSON initially set to load on
 * devel session. This masterJSON has stored positions of x and y for each
 * node and their links.
 * @param {String} text - the JSON object stringified to be dumped into the file
 * @param {String} name - The name of the file in which the JSON object will
 * be saved
 * @param {String} type - the type of the file to be created
 */
const downloadJSON = (text, name, type) => {

  const a = document.createElement("a")
  const file = new Blob([text], {type})
  a.href = URL.createObjectURL(file)
  a.download = name
  a.click()

}

/**
 * Function to get all node positions and write then to a file. It also
 * calculates the ratio between the two linked nodes and adds it to last
 * element for link { distance, nodeRatio }
 * @param {Object} g - graph related functions that iterate through nodes
 * and links.
 * @param {Object} layout - object that stores vivagraph layout with all the
 * defined options
 */
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
      "length": node.data.seqLength.split(">").slice(-1).toString(),
      position,
    })

  })
  // this doesn't filter for duplicated links
  g.forEachLink( (link) => {

    const currentHash = makeHash(link.fromId, link.toId)
      // gets size of fromId and toId nodes and calculates the ratio between
      // them
    const fromSize = parseFloat(g.getNode(link.fromId).data.seqLength.split("</span>").slice(-1)[0])
    const toSize = parseFloat(g.getNode(link.toId).data.seqLength.split("</span>").slice(-1)[0])
    const sizeRatio = Math.min(fromSize, toSize) / Math.max(fromSize, toSize)

    if (hashStore.indexOf(currentHash) < 0) {
      masterJSON.links.push({
        "parentId": link.fromId,
        "childId": link.toId,
        "distNSizes": { "distance": link.data.distance, sizeRatio }
      })
      hashStore.push(currentHash)
    }

  })

  return masterJSON
}

//*********************//
//    DEVEL SESSION    //
//*********************//

// devel session to get positions of each node
/**
 * This function is used during devel session, so when devel is = true that
 * triggers getPositions function which will in fact run get the positions
 * of all nodes and links and save it to a file
 * @param {Object} g - graph related functions that iterate through nodes
 * and links.
 * @param {Object} layout - object that stores vivagraph layout with all the
 * defined options
 * @param {Boolean} devel - variable that controls if downloadJSON will be
 * executed or not... this is only allowed during devel sessions and users
 * must not be able to use this.
 */
const initCallback = async (g, layout, devel) => {

  if (devel === true && layout !== false) {
  // if (layout !== false) {
    const masterJSON = await getPositions(g, layout)
    await downloadJSON(JSON.stringify(masterJSON), "filtered.json", "text/plain")
  }

}
