// single read displayer
function read_coloring(g, graphics, renderer){
  var readColorArray=[];
  console.log(read_json)
  var readString=read_json.replace(/[{}"]/g,'').split(",");
  for (string in readString){
    gi = readString[string].split(":")[0].replace(" ","");
    perc = parseFloat(readString[string].split(":")[1].replace(" ",""));
    read_color = chroma.mix('lightsalmon', 'maroon', perc).hex().replace('#', '0x');
    node_iter(read_color,gi,g,graphics);
  };
  // control all related divs
  showRerun = document.getElementById('Re_run'); 
  showGoback = document.getElementById('go_back'); 
  showDownload = document.getElementById('download_ds'); 
  showRerun.style.display = "block";
  showGoback.style.display = "block";
  showDownload.style.display = "block";
  renderer.rerender();
  $("#loading").hide();
};

//function to get new interval and its function
function range_conversion(perc,perc2,c,d){
  
  //x is the difference between the two values that can range between -1 and 1 ([a,b])
  //c,d represent the new interval between [c,d]
  // these two are constant since the range of the differences will allways be between -1 and 1
  a=-1;
  b=1;

  var x=(perc-perc2);

  var y=(x-a)*((d-c)/(b-a))+c

  return y
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
            x=perc-perc2
            diff = range_conversion(perc,perc2,0.25,1); // must be changed
            //diff = ((perc-perc2)+1)/2; //old value
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
        diff = 0.25;
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
      read_color = chroma.mix('yellow', 'maroon', parseFloat(list_common_gi[gi])).hex().replace('#', '0x');
      node_iter(read_color,gi,g,graphics);

    }
    renderer.rerender();
    $("#loading").hide();
  },1000);  
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
}

