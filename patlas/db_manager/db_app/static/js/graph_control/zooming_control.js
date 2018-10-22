/**
 * function to use renderer.zoomOut() function
 * @param {float} desiredScale
 * @param {float} currentScale
 * @param {Object} renderer - stores a series of functions related with
 * vivagraph renderer
 */
const zoomOutPatlas = (desiredScale, currentScale, renderer) => {
  if (desiredScale < currentScale) {
    currentScale = renderer.zoomOut()
    setTimeout( () => {
      zoomOutPatlas(desiredScale, currentScale, renderer)
    }, 16)
  }
}

/**
 * Function to zoom out in order to fit all nodes on the graph in the screen
 * @param {Object} layout - stores a series of functions related with
 * vivagraph layout
 * @param {Object} graphics - stores methods for graphics in vivagraph
 */
const defaultZooming = (layout, graphics) => {
  const graphRect = layout.getGraphRect()
  // the size of the graph that is rendered
  const graphSize = Math.min(graphRect.x2 - graphRect.x1, graphRect.y2 - graphRect.y1)
  // the screen size
  const screenSize = Math.min(document.body.clientWidth, document.body.clientHeight)
  // coordinates t the center of the graph
  const scrollPoint = {
    x: document.body.clientWidth / 2,
    y: document.body.clientHeight / 2
  }
  // the desired scale for the final zoom
  const desiredScale = screenSize / graphSize
  graphics.scale(desiredScale, scrollPoint)
  // legacy function
  // zoomOutPatlas(desiredScale, 1, renderer)
}
