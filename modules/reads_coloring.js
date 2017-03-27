// single read displayer
function read_coloring(g, graphics, renderer){
  var readColorArray=[];
  //console.log(read_json)
  var readString=read_json.replace(/[{}"]/g,'').split(",");
  for (string in readString){
    gi = readString[string].split(":")[0].replace(" ","");
    perc = parseFloat(readString[string].split(":")[1].replace(" ",""));
    if (document.getElementById('check_file').checked){
      read_color = chroma.mix('yellow', 'maroon', perc).hex().replace('#', '0x');
    }
    else{
      read_color = chroma.mix('lightsalmon', 'maroon', perc).hex().replace('#', '0x');
    }
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

///////////////////
// link coloring //
///////////////////

function link_coloring(g, graphics, renderer){
  console.log(document.getElementById("colorForm").value);
  g.forEachLink(function(link){
    var dist = link.data*10
    var linkUI = graphics.getLinkUI(link.id)
    if (document.getElementById("colorForm").value == "Green color scheme" || document.getElementById("colorForm").value == ""){
      link_color = chroma.mix('#CAE368', '#65B661', dist).hex().replace('#', '0x') + "FF";
    }
    else if (document.getElementById("colorForm").value == "Blue color scheme"){
      link_color = chroma.mix('#73C2FF', '#025D8C', dist).hex().replace('#', '0x') + "FF";
    }
    else if (document.getElementById("colorForm").value == "Red color scheme"){
      link_color = chroma.mix('#E87833', '#4D0E1C', dist).hex().replace('#', '0x') + "FF";
    }   
    
    // since linkUI seems to use alpha in its color definition we had to set alpha to 100% 
    //opacity by adding "FF" at the end of color string
    linkUI.color = link_color
  });
  renderer.rerender();
  $("#loading").hide();
}

// option to return links to their default color
function reset_link_color(g,graphics,renderer){
  g.forEachLink(function(link){
    var linkUI = graphics.getLinkUI(link.id)
    linkUI.color = 0xb3b3b3ff
  });
  renderer.rerender();
  $("#loading").hide();
}