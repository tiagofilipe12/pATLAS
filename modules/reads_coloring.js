// load reads JSON file with reads of interest
function getArray_read(){
  return $.getJSON('all_plasmidVRSA66296_55x.json');   // change the input file name
} 

// load reads JSON file with reads to be compared with
function getArray_read_2(){
  return $.getJSON('all_plasmidEfae66296_t2.json');   // change the input file name
} 

// single read displayer
function read_coloring(g, graphics, renderer){
  readColorArray=[];
  getArray_read().done(function(json){
    $.each(json, function(gi,perc){
      read_color = chroma.mix('lightsalmon', 'maroon', perc).hex().replace('#', '0x');
      node_iter(read_color,gi,g,graphics);
    });
  });
  //chroma.scale(['lightsalmon', 'maroon'])
  showRerun = document.getElementById('Re_run'); 
  showGoback = document.getElementById('go_back'); 
  showDownload = document.getElementById('download_ds'); 
  showRerun.style.display = "block";
  showGoback.style.display = "block";
  showDownload.style.display = "block";
}

// pairwise comparison of multiple reads
function pairwise_comparison(g,graphics,renderer, callback){
  $("#loading").show();
  var list_common_gi = {}; //create a dictionary
  getArray_read().done(function(json){
    $.each(json, function(gi,perc){
      var existGi = false;
      getArray_read_2().done(function(json2){
        $.each(json2, function(gi2,perc2){
          if (gi == gi2){            
            // difference between the reads of interest and the reads to be compared with
            // y=(x-1)d-c/b-a + c
            if (!existGi){
              existGi = true;              
              list_common_gi[gi] =[];              
            }
            diff = ((perc-perc2)+1)/2;
            list_common_gi[gi].push(diff);

          }
          else {
            
            if (!existGi){
              list_common_gi[gi] =[];              
            }
            diff = 1;
            list_common_gi[gi].push(diff);

          }
        });
      });
    });
  });
  // used to seach for the gi2 that are not contained in the first js
  getArray_read_2().done(function(json2){
    $.each(json2, function(gi2,perc2){
      if (!(gi2 in list_common_gi)){
        //perc = 0;
        diff = 0;
        list_common_gi[gi2] =[];
        list_common_gi[gi2].push(diff)
      }
    });
  });
  callback && callback();
  return list_common_gi
}

//differences converted into node color
function diff_to_node_color(g,graphics,renderer){
  list_common_gi=pairwise_comparison(g,graphics,renderer);
  setTimeout(function () {
    for (gi in list_common_gi){
      read_color = chroma.mix('blue', 'red', parseFloat(list_common_gi[gi])).hex().replace('#', '0x');
      node_iter(read_color,gi,g,graphics);

    }
    renderer.rerender();
    $("#loading").hide();
  },1000);  
  //chroma.scale(['blue', 'yellow'])
}

// function to iterate through nodes
function node_iter(read_color,gi,g,graphics){
  g.forEachNode(function (node) {
    nodeGI=node.id.split("_").slice(0,2).join("_");
    var nodeUI = graphics.getNodeUI(node.id);
    if (gi == nodeGI){
      nodeUI.color = read_color;
      nodeUI.backupColor = nodeUI.color;
    }
  });
  //renderer.rerender();
}

// remove from here in future
// function to load file
function readSingleFile(e) {
  var file = e.target.files[0];
  if (!file) {
    return;
  }
  var reader = new FileReader();
  reader.onload = function(e) {
    var contents = e.target.result;
    displayContents(contents);
  };
  reader.readAsText(file);
}
