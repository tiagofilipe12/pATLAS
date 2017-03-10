// function to remove all nodes that have no default color
function node_removal_taxa(g, nodeColor){
  g.forEachLinkedNode(node.id, function(linkedNode, link){
  	var nodeUI = graphics.getNodeUI(node.id);
    if (nodeUI.color != nodeColor){
    g.removeNode(node.id);
    g.forEachLinkedNode(node.id, function(linkedNode, link){
      g.removeLink(link); 
    });    
    }
  });
  // funções para precompute durante um bocado e fazer desaparecer o gráfico momentaneamente com aquele loading again
}