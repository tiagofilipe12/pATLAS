/**
 * function to use renderer.zoomOut() function
 * @param {float} desiredScale
 * @param {float} currentScale
 * @param {Object} renderer - stores a series of functions related with
 * vivagraph renderer
 */
const zoomOut = (desiredScale, currentScale, renderer) => {
  if (desiredScale < currentScale) {
    currentScale = renderer.zoomOut()
    setTimeout( () => {
      zoomOut(desiredScale, currentScale, renderer)
    }, 16)
  }
}

/**
 * Function to zoom out in order to fit all nodes on the graph in the screen
 * @param {Object} layout - stores a series of functions related with
 * vivagraph layout
 * @param {Object} renderer - stores a series of functions related with
 * vivagraph renderer
 */
const defaultZooming = (layout, renderer) => {
  const graphRect = layout.getGraphRect()
  const graphSize = Math.min(graphRect.x2 - graphRect.x1, graphRect.y2 - graphRect.y1)
  const screenSize = Math.min(document.body.clientWidth, document.body.clientHeight)
  const desiredScale = screenSize / graphSize
  zoomOut(desiredScale, 1, renderer)
}