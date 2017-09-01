// this function repositions the graph to center on the desired node

const recenterDOM = (renderer, layout, storeMasterNode) => {
  //console.log(storeMasterNode)
  const pos = layout.getNodePosition(storeMasterNode[0])
  renderer.moveTo(pos.x, pos.y)
}

// this function stores the node with more links

const storeRecenterDom = (storeMasterNode, dict_dist, sequence, counter) => {
  //console.log(counter)
  //let previousDictDist = storeMasterNode[1]
  //let storedNode = storeMasterNode[0]
  // checks if the node is the one with most links and stores it in storedNode
  if (counter > 0) {
    if (storeMasterNode[1] < dict_dist.length) {
      storedNode = sequence
      previousDictDist = dict_dist.length
    }
  } else if (counter === 0) {
    // this is used to check if counter is the first instance of the loop
    storedNode = sequence
    previousDictDist = dict_dist.length

  }
  return [storedNode, previousDictDist]
}