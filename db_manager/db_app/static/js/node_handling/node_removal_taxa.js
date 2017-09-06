// re adds nodes after cleaning the entire graph
const reAddNode = (g, jsonObj, newList, storeMasterNode, counter) => {
  const sequence = jsonObj.plasmidAccession
  let length = jsonObj.plasmidLenght
  const linksArray = jsonObj.significantLinks

  // checks if sequence is within the queried accessions (newList)
  if (newList.indexOf(sequence) < 0) {
    //console.log("sequence", sequence)
    g.addNode(sequence, {
      sequence: "<font color='#468499'>Accession:" +
      " </font><a" +
      " href='https://www.ncbi.nlm.nih.gov/nuccore/" + sequence.split("_").slice(0, 2).join("_") + "' target='_blank'>" + sequence + "</a>",
      //species:"<font color='#468499'>Species:
      // </font>" + species,
      seq_length: "<font color='#468499'>Sequence length: </font>" + (length !== "N/A") ? length : "N/A",
      log_length: (length !== "N/A") ? Math.log(parseInt(length)) : Math.log(2000)
    })
    newList.push(sequence)
  }

  // loops between all arrays of array pairing sequence and distances
  if (linksArray !== "N/A") {
    for (let i = 0; i < linksArray.length; i++) {
      // TODO make requests to get metadata to render the node
      if (newList.indexOf(linksArray[i]) < 0) {
        g.addNode(linksArray[i], {
          sequence: "<font color='#468499'>Accession:" +
          " </font><a" +
          " href='https://www.ncbi.nlm.nih.gov/nuccore/" + linksArray[i].split("_").slice(0, 2).join("_") + "' target='_blank'>" + linksArray[i] + "</a>",
          //species:"<font color='#468499'>Species:
          // </font>" + species,
          seq_length: "<font" +
          " color='#468499'>Sequence length:" +
          " </font>" + length,
          log_length: Math.log(parseInt(length))    //for now a fixed length will work
        })
        newList.push(linksArray[i])
      }
      // adds links for each node
      g.addLink(sequence, linksArray[i])
    }
  }
  storeMasterNode = storeRecenterDom(storeMasterNode, linksArray,
    sequence, counter)
  return storeMasterNode
}

// function to call requests on db

const requesterDB = (g, listGiFilter, counter, storeMasterNode, precompute, renderGraph) => {
  let newList = []
  let promises = []   //an array to store all the requests as promises
  // loops every Accession stored in listGiFilter on re_run button
  for (let i = 0; i < listGiFilter.length; i++) {
    promises.push(
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
        //console.log(data.json_entry.significantLinks.replace(/['u\[\] ]/g,'').split(','))

        // if accession is not present in the database because singletons
        // are not stored in database
        if (data.json_entry.significantLinks === null)
        {
          console.log("debug", listGiFilter[i])
          const jsonObj = {
            "plasmidAccession": listGiFilter[i],
            "plasmidLenght": "N/A",
            "speciesName": "N/A",
            "plasmidName": "N/A",
            "significantLinks": "N/A"
          }
          //add node
          counter++
          storeMasterNode = reAddNode(g, jsonObj, newList, storeMasterNode, counter) //callback function
        } else {  // add node for every accession that has links and that is
          // present in plasmid_db
          const jsonObj = {
            "plasmidAccession": data.plasmid_id,
            "plasmidLenght": data.json_entry.length,
            "speciesName": speciesName,
            "plasmidName": plasmidName,
            "significantLinks": data.json_entry.significantLinks.replace(/['u\[\] ]/g, '').split(',') //this is a
            // string ... not ideal
            // TODO this is sketchy and should be fixed with JSON parsing
            // from db
          }
          //add node
          counter++
          storeMasterNode = reAddNode(g, jsonObj, newList, storeMasterNode, counter) //callback function
        }
      })
    )
  }
  // promise that waits for all the requests and nodes to be added to
  // vivagraph.... and only then precompute the graph.
  Promise.all(promises)
    .then((results) => {
      //console.log("results", results, storeMasterNode)
      precompute(1000, renderGraph)
    })
    .catch((error) => {
      console.log("Error! No query was made. Error message: ", error)
    })

}

// function that actually removes the nodes
const actual_removal = (onload) => {
  // removes all nodes from g using the same layout
  //console.log(listGiFilter)
  firstInstace = false

  // change play button in order to be properly set to pause
  $('#couve-flor').empty()
  // TODO check if this can be cleaner... removing vivagraph canvas?
  $('#couve-flor').append('        <!--hidden div for color legend-->\n' +
    '        <div class="panel-group colorpicker-component" id="colorLegend" style="display: none">\n' +
    '          <div class="panel panel-default" >\n' +
    '            <div class="panel-heading">Color legend</div>\n' +
    '            <div class="panel-body">\n' +
    '              <!--Populated by visualization_functions.js-->\n' +
    '              <label id="taxa_label" style="display: none">Taxa filters</label>\n' +
    '              <ul class="legend" id="colorLegendBox"></ul>\n' +
    '              <!--Populated by visualization_functions.js-->\n' +
    '              <label id="distance_label" style="display: none">Distance filters</label>\n' +
    '              <div class="gradient" id="scaleLegend"></div>\n' +
    '              <!--Populated by visualization_functions.js-->\n' +
    '              <label id="read_label" style="display: none">Read filters</label>\n' +
    '              <div class="gradient" id="readLegend"></div>\n' +
    '            </div>\n' +
    '          </div>\n' +
    '        </div>\n' +
    '\n' +
    '        <div id="buttonStuff">\n' +
    '          <div class="btn-group">\n' +
    '\n' +
    '            <!-- Buttons that overlay the graph and interact with it -->\n' +
    '            <button id="playpauseButton" data-toggle="tooltip" \n' +
    '                    title="Play/Pause" type="button" \n' +
    '                    class="btn btn-success">\n' +
    '              <span class="glyphicon glyphicon-play"></span>\n' +
    '            </button>\n' +
    '\n' +
    '            <button id="refreshButton" data-toggle="tooltip" \n' +
    '                    title="Reset clicked nodes color (legacy)" type="button" \n' +
    '                    class="btn btn-primary">\n' +
    '              <span class="glyphicon glyphicon-refresh"></span>\n' +
    '            </button>\n' +
    '          </div>\n' +
    '          <!--zoom buttons-->\n' +
    '          <div class="btn-group">\n' +
    '            <button id="zoom_in" class="zoom in btn btn-default"\n' +
    '                    data-toggle="tooltip" title="Zoom in" \n' +
    '                    type="button">\n' +
    '              <span class="glyphicon glyphicon-zoom-in"></span>\n' +
    '            </button>\n' +
    '            <button id="zoom_out" class="zoom out btn btn-default"\n' +
    '                    data-toggle="tooltip" title="Zoom out" \n' +
    '                    type="button">\n' +
    '              <span class="glyphicon glyphicon-zoom-out"></span>\n' +
    '            </button>\n' +
    '          </div> \n' +
    '      \n' +
    '          <!-- End buttons -->\n' +
    '        </div>\n' +
    '        <div id="popup_description" style="display: none"></div>')

  onload()
  // TODO maybe add some nicer loading screen
}

// a function to display the loader mask
const show_div = (callback) => {
  $('#loading').show()
  //console.log('showing loader')
  // if callback exist execute it
  callback && callback()
}

// function to reset node colors
const node_color_reset = (graphics, g, nodeColor, renderer) => {
  document.getElementById('taxa_label').style.display = 'none' // hide label
  g.forEachNode( (node) => {
    const nodeUI = graphics.getNodeUI(node.id)
    // reset all nodes before changing colors because of the second instance of filters
    if (nodeUI.color !== nodeColor) {
      nodeUI.color = nodeColor
      nodeUI.backupColor = nodeUI.color
    }
  })
  renderer.rerender()
}

