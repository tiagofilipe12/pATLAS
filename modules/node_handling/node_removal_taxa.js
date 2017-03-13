// function to remove all nodes that have no default color
function node_removal_taxa(g, graphics, nodeColor){
  console.log("executing re run...")
  var unchanged_nodes = [];
  g.forEachNode(function (node) {
    console.log(node.links.length)
    //console.log(node.links)
    var nodeUI = graphics.getNodeUI(node.id);
    // first check if nodeUI has default color
    if (nodeUI.color == nodeColor){   // checks if color is equal do default
      unchanged_nodes.push(node.id)
      g.forEachLinkedNode(node.id, function(linkedNode, link){
        var linked_nodeUI = graphics.getNodeUI(linkedNode.id);
        //console.log(String(link.id))
        if (linked_nodeUI.color == nodeColor && nodeUI.color == nodeColor){ //if equal to default and linked nodes are equal to default
          console.log("removing links")          
          g.removeLink(link); 
        }
      });   
    }
    // checks if node.links are empty
    
    if (jQuery.isEmptyObject(node.links[0])){
      console.log("removing all nodes without any links")
      g.removeNode(node.id)
    };
  });
}

