const createOverlay = (overlayDom, underElement) => {
  let notify = []
  const dragndrop = Viva.Graph.Utils.dragndrop(overlayDom)
  let selectedArea = {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  }
  let startX = 0,
    startY = 0

  const notifyAreaSelected = () => {
    notify.forEach( (cb) => {
      cb(selectedArea)
    })
  }

  const selectionIndicator = document.createElement("div")
  selectionIndicator.className = "graph-selection-indicator"
  overlayDom.appendChild(selectionIndicator)

  const recalculateSelectedArea = (e) => {
    selectedArea.width = Math.abs(e.clientX - startX)
    selectedArea.height = Math.abs(e.clientY - startY)
    selectedArea.x = Math.min(e.clientX, startX)
    selectedArea.y = Math.min(e.clientY, startY)
  }

  const updateSelectedAreaIndicator = () => {
    selectionIndicator.style.left = selectedArea.x + "px"
    selectionIndicator.style.top = selectedArea.y + "px"
    selectionIndicator.style.width = selectedArea.width + "px"
    selectionIndicator.style.height = selectedArea.height + "px"
  }

  dragndrop.onStart( (e) => {
    startX = selectedArea.x = e.clientX
    startY = selectedArea.y = e.clientY
    selectedArea.width = selectedArea.height = 0

    updateSelectedAreaIndicator()
    selectionIndicator.style.display = "block"
  })

  dragndrop.onDrag( (e) => {
    recalculateSelectedArea(e)
    updateSelectedAreaIndicator()
    notifyAreaSelected()
  })

  dragndrop.onStop( (e) => {
    selectionIndicator.style.display = "none"
  })

  dragndrop.onScroll( (e) => {
    // instead of eating this event, let's propagate it to the renderer
    const dispatched = new WheelEvent(e.type, e)
    underElement.dispatchEvent(dispatched)
  })
  return {
    onAreaSelected: (cb) => {
      notify.push(cb)
    },
    destroy: () => {
      overlayDom.style.display = "none"
      selectionIndicator.style.display = "none"
      dragndrop.release()
    }//,
    // selectedArea: () => {
    //  return selectedArea
    // }
  }
}

const startMultiSelect = (graph, renderer, layout) => {
  const graphics = renderer.getGraphics()
  const overlay = createOverlay(document.querySelector(".graph-overlay"), document.getElementById("couve-flor"))
  overlay.onAreaSelected( (area) => {

    const isInside = (nodeId, topLeft, bottomRight) => {
      const nodePos = layout.getNodePosition(nodeId)
      return (topLeft.x < nodePos.x && nodePos.x < bottomRight.x &&
        topLeft.y < nodePos.y && nodePos.y < bottomRight.y)
    }

    const higlightIfInside = (node) => {
      const nodeUI = graphics.getNodeUI(node.id)
      if (nodeUI) {
        if (isInside(node.id, topLeft, bottomRight)) {
          nodeUI.backupColor = nodeUI.color
          nodeUI.color = 0x23A900 // green
        } else {
          nodeUI.color = 0x666370 // default grey
        }
      }
    }

    // For the sake of this demo we are using silly O(n) implementation.
    // Could be improved with spatial indexing if required.
    const topLeft = graphics.transformClientToGraphCoordinates({
      x: area.x,
      y: area.y
    })

    const bottomRight = graphics.transformClientToGraphCoordinates({
      x: area.x + area.width,
      y: area.y + area.height
    })

    graph.forEachNode(higlightIfInside)
    renderer.rerender()

    return

  })
  return overlay    // returns overlay in order to prevent drag and drop
  // from bottom to top to be properly executed
  // otherwise it will become increasingly slow
}