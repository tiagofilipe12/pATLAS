// function to search all nodes that have no default color and are linked to nodes with no default color
function node_removal_taxa(g, graphics, nodeColor, renderer, layout){
  console.log("executing re run...")

  listNodesRm = [];
  listNodesnoRm = [];

  g.forEachNode(function (node) {

    var nodeUI = graphics.getNodeUI(node.id);
    
    // first check if nodeUI has default color
    if (nodeUI.color == nodeColor){   //checks if color is equal do default

      g.forEachLinkedNode(node.id, function(linkedNode, link){
        var linked_nodeUI = graphics.getNodeUI(linkedNode.id);

        //if equal to default and linked nodes are equal to default
        if (linked_nodeUI.color == nodeColor && listNodesRm.indexOf(node.id) < 0){
          listNodesRm.push(node.id); 
        }
        // if different from default color but node has default color, then don't rm
        else if (linked_nodeUI.color != nodeColor && listNodesnoRm.indexOf(node.id) < 0){
          listNodesnoRm.push(node.id);
          // returns all nodes that are linked to nodes with changed color to center
          layout.setNodePosition(node.id, 0, 0);
        }
      });
    }
    // returns nodes with changed color to central position
    else{
      layout.setNodePosition(node.id, 0, 0);
    }
  });

  // filter nodes that should not be removed from removal list
  myArray = listNodesRm.filter( function( el ) {
    return !listNodesnoRm.includes( el );
  });
  return myArray
  
}

// function that actually removes the nodes
function actual_removal(g, graphics, nodeColor, renderer, layout){
  listNodesRm=node_removal_taxa(g, graphics, nodeColor, renderer, layout);
  for (id in listNodesRm){
    nodeId = listNodesRm[id]
    g.removeNode(nodeId)
  }

  // change play button in order to be properly set to pause
  $('#playpauseButton').empty();
  $('#playpauseButton').append('<span class="glyphicon glyphicon-pause"></span>');
  paused = false;
  // resumes actual selection and hides loading screen
  $("#loading").hide();
  renderer.resume();
  

}

// still usuless functions


// a function to display the loader mask
function show_div(callback){
  $("#loading").show();
  console.log("showing loader")
  // if callback exist execute it
  callback && callback();
}
