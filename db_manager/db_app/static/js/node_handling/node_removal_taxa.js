// function to call requests on db

function requesterDB (listGiFilter) {
  var newList = []
  //var jsonQueries = [] // this isn't passing to inside the query on db
  for (var i = 0; i < listGiFilter.length; i++) {
    $.get('api/getspecies/', {'accession': listGiFilter[i]}, function (data, status) {
      // this request uses nested json object to access json entries
      // available in the database

      // if request return no speciesName or plasmidName
      // sometimes plasmids have no descriptor for one of these or both
      if (data.json_entry.name === null) {
        speciesName = "N/A"
      } else {
        speciesName = data.json_entry.name.split("_").join(" ")
      }
      if (data.json_entry.plasmid_name === null) {
        plasmidName = "N/A"
      } else {
        plasmidName = data.json_entry.plasmid_name
      }
      // may be it would be better to output this with something like oboe.js?

      //console.log(data.json_entry.significantLinks.replace(/['u\[\] ]/g,'').split(','))

      // if request finds no matching plasmid it has no connections to other db
      if (data.plasmid_id !== null) {
        var jsonObj = {
          'plasmidAccession': data.plasmid_id,
          'plasmidLenght': data.json_entry.length,
          'speciesName': speciesName,
          'plasmidName': plasmidName,
          'significantLinks': data.json_entry.significantLinks.replace(/['u\[\] ]/g,'').split(',') //this is a
          // string ... not ideal
          // TODO this is very sketchy and should be fixed with JSON parsing
          // from db
        }
      } else {  //this statement should not happen in future implementation,
        // singletions must be passed to the database
        var jsonObj = {
          'plasmidAccession': 'non_linked_accession', //this should pass
          // the listGiFilter[accession] but it can't be obtained here.
          'plasmidLenght': 'N/A',
          'speciesName': 'N/A',
          'plasmidName': 'N/A',
          'significantLinks': 'N/A'
        }
      }
      //add node
      reAddNode(jsonObj, newList) //callback function
    })
  }
}

// re adds nodes after cleaning the entire graph
function reAddNode (jsonObj, newList) {
  var sequence = jsonObj.plasmidAccession
  var length = jsonObj.plasmidLenght
  var linksArray = jsonObj.significantLinks

  if (length === 'N/A') {
    length = 1
  }
  if (newList.indexOf(sequence) < 0) {
    g.addNode(sequence, {
      sequence: "<font color='#468499'>Accession:" +
      " </font><a" +
      " href='https://www.ncbi.nlm.nih.gov/nuccore/" + sequence.split("_").slice(0, 2).join("_") + "' target='_blank'>" + sequence + "</a>",
      //species:"<font color='#468499'>Species:
      // </font>" + species,
      seq_length: "<font" +
      " color='#468499'>Sequence length:" +
      " </font>" + length,
      log_length: Math.log(parseInt(length))
    })
    newList.push(sequence)
  }

  // loops between all arrays of array pairing sequence and distances
  if (linksArray !== 'N/A') {
    for (var i = 0; i < linksArray.length; i++) {
      // TODO make requests to get metadata to render the node
      if (newList.indexOf(linksArray[i]) < 0) {
        g.addNode(linksArray[i], {
          sequence: "<font color='#468499'>Accession:" +
          " </font><a" +
          " href='https://www.ncbi.nlm.nih.gov/nuccore/" + sequence.split("_").slice(0, 2).join("_") + "' target='_blank'>" + linksArray[i] + "</a>",
          //species:"<font color='#468499'>Species:
          // </font>" + species,
          seq_length: "<font" +
          " color='#468499'>Sequence length:" +
          " </font>" + 1,
          log_length: 10    //for now a fixed length will work
        })
        newList.push(linksArray[i])
      }

      g.addLink(sequence, linksArray[i])
      // TODO significant links must have a distance... but still not in database!
    }
  }
  return newList
}

// function that actually removes the nodes
function actual_removal (renderer, listGiFilter) {
  // removes all nodes from g using the same layout
  //g.clear()   // this in fact just do forEachNode --> so too slow
  //g.addNode(1, {'foo': 'bar'}) //this is a test input for node
  requesterDB(listGiFilter)

  // TODO after this it should render a new page with the new json object
  setTimeout(function () {
    // change play button in order to be properly set to pause
    $('#playpauseButton').empty()
    $('#playpauseButton').append('<span class="glyphicon glyphicon-pause"></span>')
    paused = false
    // resumes actual selection and hides loading screen
    $('#loading').hide()
    // slow down the spreading of nodes
    // the more removed nodes --> less selected nodes --> slower spread
    //layout.simulator.dragCoeff(0.1 + (listNodesRm.length * 0.000001))
    // there is no need to move to origin since nodes start at origin in new
    // instance
    //renderer.moveTo(0, 0)
    renderer.resume()
  }, 1000)
}

// a function to display the loader mask
function show_div (callback) {
  $('#loading').show()
  //console.log('showing loader')
  // if callback exist execute it
  callback && callback()
}

// helper function to color according with family and order
function node_coloring_taxa (tempArray, g, graphics, store_lis, currentSelection) {
  currentColor = color[i].replace('#', '0x')
  style_color = 'background-color:' + color[i]
  store_lis = store_lis + '<li class="centeredList"><button class="jscolor btn btn-default" style=' + style_color + '></button>&nbsp;' + currentSelection[i] + '</li>'
  for (gen in tempArray) {
    // cycles nodes
    g.forEachNode(function (node) {
      var nodeUI = graphics.getNodeUI(node.id)
      var species = node.data.species.split('>').slice(-1).toString()
      var genus = species.split(' ')[0]

      // checks if genus is in selection
      if (tempArray[gen] == genus) {
        nodeUI.color = currentColor
        nodeUI.backupColor = nodeUI.color
        changed_nodes.push(node.id)
      }
    })
  }
  return store_lis
}

// function to reset node colors
function node_color_reset (graphics, g, nodeColor, renderer) {
  document.getElementById('taxa_label').style.display = 'none' // hide label
  g.forEachNode(function (node) {
    var nodeUI = graphics.getNodeUI(node.id)
    // reset all nodes before changing colors because of the second instance of filters
    if (nodeUI.color != nodeColor) {
      nodeUI.color = nodeColor
      nodeUI.backupColor = nodeUI.color
    }
  })
  renderer.rerender()
}
