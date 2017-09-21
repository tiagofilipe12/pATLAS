function startMultiSelect(graph, renderer, layout) {
  var graphics = renderer.getGraphics();
  var overlay = createOverlay(document.querySelector(".graph-overlay"), document.getElementById("couve-flor"));
  overlay.onAreaSelected(function(area) {
    // For the sake of this demo we are using silly O(n) implementation.
    // Could be improved with spatial indexing if required.
    var topLeft = graphics.transformClientToGraphCoordinates({
      x: area.x,
      y: area.y
    });

    var bottomRight = graphics.transformClientToGraphCoordinates({
      x: area.x + area.width,
      y: area.y + area.height
    });

    graph.forEachNode(higlightIfInside);
    renderer.rerender();

    return;

    function higlightIfInside(node) {
      var nodeUI = graphics.getNodeUI(node.id)
      if (isInside(node.id, topLeft, bottomRight)) {
        nodeUI.color = 0xFFA500ff;
        //nodeUI.size = 20;
      } else {
        nodeUI.color = 0x666370;
        //nodeUI.size = 10;
      }
    }

    function isInside(nodeId, topLeft, bottomRight) {
      var nodePos = layout.getNodePosition(nodeId);
      return (topLeft.x < nodePos.x && nodePos.x < bottomRight.x &&
        topLeft.y < nodePos.y && nodePos.y < bottomRight.y);
    }
  });
  return overlay
}

function createOverlay(overlayDom, underElement) {
  var selectionIndicator = document.createElement('div');
  selectionIndicator.className = 'graph-selection-indicator';
  overlayDom.appendChild(selectionIndicator);

  var notify = [];
  var dragndrop = Viva.Graph.Utils.dragndrop(overlayDom);
  var selectedArea = {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  };
  var startX = 0;
  startY = 0;

  dragndrop.onStart(function(e) {
    startX = selectedArea.x = e.clientX;
    startY = selectedArea.y = e.clientY;
    selectedArea.width = selectedArea.height = 0;

    updateSelectedAreaIndicator();
    selectionIndicator.style.display = 'block';
  });

  dragndrop.onDrag(function(e) {
    recalculateSelectedArea(e);
    updateSelectedAreaIndicator();
    notifyAreaSelected();
  });

  dragndrop.onStop(function(e) {
    selectionIndicator.style.display = 'none';
  });

  dragndrop.onScroll(function (e) {
    // instead of eating this event, let's propagate it to the renderer
    var dispatched = new WheelEvent(e.type, e);
    underElement.dispatchEvent(dispatched);
  });
  return {
    onAreaSelected: function(cb) {
      notify.push(cb);
    },
    destroy: function() {
      overlayDom.style.display = "none"
      dragndrop.release()
    },
    selectedArea: function() {
      return selectedArea
    }
  }

  function notifyAreaSelected() {
    notify.forEach(function(cb) {
      cb(selectedArea);
    });
  }

  function recalculateSelectedArea(e) {
    selectedArea.width = Math.abs(e.clientX - startX);
    selectedArea.height = Math.abs(e.clientY - startY);
    selectedArea.x = Math.min(e.clientX, startX);
    selectedArea.y = Math.min(e.clientY, startY);
  }

  function updateSelectedAreaIndicator() {
    selectionIndicator.style.left = selectedArea.x + 'px';
    selectionIndicator.style.top = selectedArea.y + 'px';
    selectionIndicator.style.width = selectedArea.width + 'px';
    selectionIndicator.style.height = selectedArea.height + 'px';
  }
}
