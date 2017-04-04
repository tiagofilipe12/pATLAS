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
  setTimeout(function(){
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
    // slow down the spreading of nodes
    // the more removed nodes --> less selected nodes --> slower spread
    layout.simulator.dragCoeff(0.1 + (listNodesRm.length*0.000001)); 
    renderer.moveTo(0,0)
    renderer.resume();
  }, 1000);
}

// a function to display the loader mask
function show_div(callback){
  $("#loading").show();
  console.log("showing loader")
  // if callback exist execute it
  callback && callback();
}

// helper function to color according with family and order
function node_coloring_taxa(tempArray, g, graphics, store_lis, currentSelection){
  currentColor = color[i].replace('#', '0x');
  style_color = "background-color:" + color[i];
  store_lis = store_lis + '<li class="centeredList"><button class="jscolor btn btn-default" style=' + style_color + '></button>&nbsp;' + currentSelection[i] + '</li>';
  for (gen in tempArray){
    //cycles nodes
    g.forEachNode(function (node) {
      var nodeUI = graphics.getNodeUI(node.id);
      var species = node.data.species.split(">").slice(-1).toString();
      var genus = species.split(" ")[0];
      
      //checks if genus is in selection
      if (tempArray[gen] == genus){
        nodeUI.color = currentColor;
        nodeUI.backupColor = nodeUI.color;
        changed_nodes.push(node.id);
      }
    });
  }
  return store_lis
}       

// function to reset node colors
function node_color_reset(graphics, g, nodeColor, renderer){
  document.getElementById('taxa_label').style.display = "none"; //hide label
  g.forEachNode(function (node) {
    var nodeUI = graphics.getNodeUI(node.id);
    //reset all nodes before changing colors because of the second instance of filters
    if (nodeUI.color != nodeColor){
      nodeUI.color = nodeColor;
      nodeUI.backupColor = nodeUI.color;
    }
  });
  renderer.rerender();
}