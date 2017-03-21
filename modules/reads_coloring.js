// load reads JSON file
function getArray_read(){
  return $.getJSON('all_plasmidEfae66296_t2.json');   // change the input file name
} 

function read_coloring(g, graphics, renderer){
  readColorArray=[];
  getArray_read().done(function(json){
    $.each(json, function(gi,perc){
      //console.log("1")
      read_color = chroma.mix('blue', 'red', perc).hex().replace('#', '0x');;
      g.forEachNode(function (node) {
      	//console.log("2")
      	//console.log(gi)
      	nodeGI=node.id.split("_").slice(0,2).join("_");
      	var nodeUI = graphics.getNodeUI(node.id);
      	if (gi == nodeGI){
      	  //console.log(read_color)
      	  nodeUI.color = read_color;
      	  nodeUI.backupColor = nodeUI.color;
      	}
      });
    });
  });
  renderer.rerender();
  showRerun = document.getElementById('Re_run'); 
  showGoback = document.getElementById('go_back'); 
  showDownload = document.getElementById('download_ds'); 
  showRerun.style.display = "block";
  showGoback.style.display = "block";
  showDownload.style.display = "block";
}

//function node_coloring_read()