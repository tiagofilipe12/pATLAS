// Final bit: most likely graph will take more space than available
// screen. Let's zoom out to fit it into the view:

const defaultZooming = (layout,renderer) => {
  var graphRect = layout.getGraphRect()
  var graphSize = Math.min(graphRect.x2 - graphRect.x1, graphRect.y2 - graphRect.y1)
  var screenSize = Math.min(document.body.clientWidth, document.body.clientHeight)
  var desiredScale = screenSize / graphSize

  const zoomOut = (desiredScale, currentScale) => {
    // zoom API in vivagraph 0.5.x is silly. There is no way to pass transform
    // directly. Maybe it will be fixed in future, for now this is the best I could do:
    if (desiredScale < currentScale) {
      currentScale = renderer.zoomOut()
      setTimeout( () => {
        zoomOut(desiredScale, currentScale)
      }, 16)
    }
  }

  zoomOut(desiredScale, 1)
}