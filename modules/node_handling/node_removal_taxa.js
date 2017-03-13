// function to remove all nodes that have no default color
function node_removal_taxa(g, graphics, nodeColor){
  g.forEachNode(function (node) {
    //console.log(node.id)
  	var nodeUI = graphics.getNodeUI(node.id);
    console.log(nodeUI.color)
    if (nodeUI.color == nodeColor){   // apparently this is the default assumed at this stage.
      console.log(node.id)
      g.removeNode(node.id);
      g.forEachLinkedNode(node.id, function(linkedNode, link){
        g.removeLink(link); 
      });    
    }
  });
  // funções para precompute durante um bocado e fazer desaparecer o gráfico momentaneamente com aquele loading again
}

