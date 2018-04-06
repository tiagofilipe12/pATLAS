/*globals Viva */

/**
 * Function to create overlay that permits startMultiSelect to change color
 * of nodes
 * @param {HTMLElement} overlayDom - html element graph-overlay which has
 * the overlay itself
 * @param {HTMLElement} underElement - html element couve-flor where
 * vivagraph is represented.
 * @returns {Object} returns an object with functions related with overlay
 */
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

/**
 * Function that allows the nodes inside area selection to be colored and in
 * fact selected
 * @param {Object} layout - object that contains vivagraph associated
 * functions or layout
 * @param {String} nodeId - a string with the accession number of the nodes
 * being checked to be inside the area selection
 * @param {Object} topLeft - an object with the x and y coordinates of
 * top left corner of area selection
 * @param {Object} bottomRight - an object with the x and y coordinates of
 * bottom right corner of area selectio
 * @returns {boolean} - true if inside the area selection; otherwise it will
 * return false
 */
const isInside = (layout, nodeId, topLeft, bottomRight) => {
  const nodePos = layout.getNodePosition(nodeId)
  return (topLeft.x < nodePos.x && nodePos.x < bottomRight.x &&
    topLeft.y < nodePos.y && nodePos.y < bottomRight.y)
}

/**
 * Function to start multiple selections on graph
 * @param {Object} graph
 * @param {Object} renderer
 * @param {Object} layout
 * @returns {Object} returns overlay in order to prevent drag and drop
 * from bottom to top to be properly executed otherwise it will become
 * increasingly slow
 */
const startMultiSelect = (graph, renderer, layout) => {
  const graphics = renderer.getGraphics()
  const overlay = createOverlay(document.querySelector(".graph-overlay"), document.getElementById("couve-flor"))
  overlay.onAreaSelected( (area) => {

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

    const higlightIfInside = (node) => {

      const nodeUI = graphics.getNodeUI(node.id)
      if (nodeUI) {
        if (isInside(layout, node.id, topLeft, bottomRight)) {
          nodeUI.backupColor = nodeUI.color
          nodeUI.color = "0x" + "#fa5e00".replace("#", "")
        } else {
          nodeUI.color = 0x666370 // default grey
        }
      }
    }

    graph.forEachNode(higlightIfInside)
    renderer.rerender()

    return

  })
  return overlay
}