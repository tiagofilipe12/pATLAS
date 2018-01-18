/*globals makeHash, reloadAccessionList, assembly, listGiFilter,
 colorNodes, readColoring */

// function that adds links, avoiding duplication below on reAddNode function
const addLinks = (g, newListHashes, sequence, linkAccession, linkDistance) => {
  const currentHash = makeHash(sequence, linkAccession)
  if (newListHashes.indexOf(currentHash) < 0) {
    g.addLink(sequence, linkAccession, { distance: linkDistance })
    newListHashes.push(currentHash)
  }
  return newListHashes
}

/**
 * function that re-adds nodes after cleaning the entire graph by querying
 * the database before
 * @param {Object} g - object that stores vivagraph graph associated functions
 * @param {Object} jsonObj - an object that stores information to be added
 * to nodes and that was obtained from a db request
 * @param {Array} newList - an array with all the accession numbers that will bplottedloted
 * @param {Array} newListHashes - an array with a list of hashes, each one
 * coding for an already added link.
 * @returns {Array} returns an array with the updated newList which will
 * contain all added nodes and another array with the list of hashes already
 * added that is used to avoid the duplication of links in the graph (user
 * by reAddLinks function
 */
const reAddNode = (g, jsonObj, newList, newListHashes) => {
  const sequence = jsonObj.plasmidAccession
  let length = jsonObj.plasmidLenght
  const linksArray = jsonObj.significantLinks
  // checks if sequence is within the queried accessions (newList)
  if (newList.indexOf(sequence) < 0) {
    g.addNode(sequence, {
      sequence: "<span style='color:#468499'>Accession:" +
      " </span><a" +
      " href='https://www.ncbi.nlm.nih.gov/nuccore/" + sequence.split("_").slice(0, 2).join("_") + "' target='_blank'>" + sequence + "</a>",
      seq_length: "<span style='color:#468499'>Sequence length: </span>" + ((length !== "N/A") ? length : "N/A"),
      logLength: (length !== "N/A") ? Math.log(parseInt(length)) : Math.log(2000)
    })
    newList.push(sequence)  //adds to list every time a new node is added here
  }

  // loops between all arrays of array pairing sequence and distances
  if (linksArray !== "N/A") {
    const eachArray = linksArray.split("},")
    for (let i = 0; i < eachArray.length; i++) {
      // this constructs a sorted array
      // TODO try to make this array ordered in the database using MASHix.py
      const entry = eachArray[i].replace(/[{}'u\[\] ]/g,"").split(",").slice(0).sort()
      const linkDistance = entry[1].split(":")[1]
      const linkLength = entry[2].split(":")[1]
      const linkAccession = entry[0].split(":")[1]

      if (newList.indexOf(linkAccession) < 0) {
        g.addNode(linkAccession, {
          sequence: "<span style='color:#468499'>Accession:" +
          " </span><a" +
          " href='https://www.ncbi.nlm.nih.gov/nuccore/" + linkAccession.split("_").slice(0, 2).join("_") + "' target='_blank'>" + linkAccession + "</a>",
          seq_length: "<span" +
          " style='color:#468499'>Sequence length:" +
          " </span>" + linkLength,
          logLength: Math.log(parseInt(linkLength))
        })
        newList.push(linkAccession) //adds to list every time a node is
        // added here
        newListHashes = addLinks(g, newListHashes, sequence, linkAccession, linkDistance)
      } else {
        // if node exist, links still need to be added
        newListHashes = addLinks(g, newListHashes, sequence, linkAccession, linkDistance)
      }
    }
  }
  //storeMasterNode = storeRecenterDom(storeMasterNode, linksArray,
  //  sequence, counter)
  return [newList, newListHashes]
}

/**
 * Function to call the request on the db when executing Re_run
 * @param {Object} g - graph related functions that iterate through nodes
 * and links
 * @param {Array} listGiFilter -
 * @param counter
 * @param {Function} renderGraph -
 * @param {Object} graphics - vivagraph functions related with node and link
 * data
 * @param {Array} reloadAccessionList -
 * @param {Function} renderer -
 * @param {Array} listGi -
 * @param readString
 * @param assemblyJson
 * @returns {*[]}
 */
const requesterDB = (g, listGiFilter, counter, renderGraph, graphics,
                     reloadAccessionList, renderer, listGi, readString,
                     assemblyJson) => {
  if (listGiFilter.length > 0) {
    let newListHashes = [] // similar to listHashes from first instance
    $.post("api/getspecies/", { "accession": JSON.stringify(listGiFilter)} ) //,
    // promise that waits for all the requests and nodes to be added to
    // vivagraph.... and only then precompute the graph.
      .then( (results) => {
        let plasmidName, speciesName, reAddNodeList
        for (const data of results) {
          // if request rtaeturn no speciesName or plasmidName
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
          // if accession is not present in the database because singletons
          // are not stored in database
          if (data.json_entry.significantLinks === null) {
            const jsonObj = {
              "plasmidAccession": data.plasmid_id,
              "plasmidLenght": "N/A",
              "speciesName": "N/A",
              "plasmidName": "N/A",
              "significantLinks": "N/A"
            }
            //add node
            reAddNodeList = reAddNode(g, jsonObj, reloadAccessionList, newListHashes)
            reloadAccessionList = reAddNodeList[0]
            newListHashes = reAddNodeList[1]

          } else {  // add node for every accession that has links and that is
            // present in plasmid_db
            const jsonObj = {
              "plasmidAccession": data.plasmid_id,
              "plasmidLenght": data.json_entry.length,
              speciesName,
              plasmidName,
              // this splits the string into an array with each entry
              "significantLinks": data.json_entry.significantLinks//.split("],")
            }
            //add node
            reAddNodeList = reAddNode(g, jsonObj, reloadAccessionList, newListHashes)
            reloadAccessionList = reAddNodeList[0]
            newListHashes = reAddNodeList[1]
          }
        }
      })
      .then( () => {
        renderGraph(graphics)
        if (readString !== false) {
          readColoring(g, listGi, graphics, renderer, readString)
        } else if (assemblyJson !== false) {
          let masterReadArray = [] //needs to reset this array for the assembly
          // function to be successful
          listGiFilter = assembly(listGi, assemblyJson, g, graphics, masterReadArray, listGiFilter)
        } else if ($("#p_Card").html() !== "Card:" ||
          $("#p_Resfinder").html() !== "Resfinder:") {
          $("#resSubmit").click()
        } else if ($("#p_Plasmidfinder").html() !== "Plasmidfinder:") {
          $("#pfSubmit").click()
        } else if ($("#p_Species").html() !== "Species:" ||
          $("#p_Genus").html() !== "Genus:" ||
          $("#p_Family").html() !== "Family:" ||
          $("#p_Order").html() !== "Order:") {
          // simulates the click of the button
          // which checks the divs that contain the species, color the as if
          // the button was clicked and makes the legends
          $("#taxaModalSubmit").click()
        } else if ($("#p_Virulence").html() !== "Virulence:") {
          $("#virSubmit").click()
        } else {
          colorNodes(g, graphics, renderer, listGiFilter, 0x23A900) //green
          // color for area selection
        }
      })
      // .catch( (error) => {
      //   console.log("Error! No query was made. Error message: ", error)
      // })
    //}
  }
  return [listGiFilter, reloadAccessionList]
}

// function that actually removes the nodes
/**
 * Function that actually removes the nodes when re_run button is clicked
 * @param {Object} g - graph related functions that iterate through nodes
 * and links
 * @param {Object} graphics - vivagraph functions related with node and link
 * data
 * @param {Function} onload - a function that is used as a callback to
 * trigger the reload of the page with a new dataset
 * @param {boolean} forgetListGiFilter - this variable is set to false if
 * re_run is triggered and true if go_back is triggered
 */
const actualRemoval = (g, graphics, onload, forgetListGiFilter) => {
  // removes all nodes from g using the same layout
  // firstInstace = false
  // change play button in order to be properly set to pause
  $("#couve-flor").empty()
    .append(
      "<!--hidden div for color legend-->\n" +
      "<div class='panel-group colorpicker-component' id='colorLegend' style='display: none'>\n" +
      "<div class='panel panel-default' >\n" +
      "<div class='panel-heading'>Color legend</div>\n" +
      "<div class='panel-body'>\n" +
      "<!--Populated by visualization_functions.js-->\n" +
      "<label id='taxa_label' style='display: none'>Taxa filters</label>\n" +
      "<ul class='legend' id='colorLegendBox'></ul>\n" +
      "<label id='res_label' style='display: none'>Resistances</label>" +
      "<ul class='legend' id='colorLegendBoxRes'></ul>" +
      "<label id='pf_label' style='display: none'>Plasmid Families</label>" +
      "<ul class='legend' id='colorLegendBoxPf'></ul>" +
      "<label id='vir_label' style='display: none'>Virulence factors</label>" +
      "<ul class='legend' id='colorLegendBoxVir'></ul>" +
      "<!--Populated by visualization_functions.js-->\n" +
      "<label id='distance_label' style='display: none'>Distance filters</label>\n" +
      "<div class='gradient' id='scaleLegend'></div>\n" +
      "<div id='scaleString'></div>" +
      "<!--Populated by visualization_functions.js-->\n" +
      "<label id='read_label' style='display: none'>Read filters</label>\n" +
      "<div class='gradient' id='readLegend'></div>\n" +
      "<div id='readString'></div>" +
      "<label id='assemblyLabel' style='display: none'>Assembly</label>" +
      "<div class='legend' id='assemblyLegend'></div>" +
      "</div>\n" +
      "</div>\n" +
      "</div>\n" +
      "\n" +
      "<div id='buttonStuff'>\n" +
      "<div class='btn-group'>\n" +
      "\n" +
      "<!-- Buttons that overlay the graph and interact with it -->\n" +
      "<button id='playpauseButton' data-toggle='tooltip'" +
      " title='Play/Pause' type='button' class='btn btn-default'>" +
      "<span class='glyphicon glyphicon-play'></span></button>" +
      "<button class='btn btn-default' data-toggle='tooltip'" +
      " title='Trigger area selection (uses shift key)'" +
      " type='button' id='refreshButton'>" +
      "<span class='glyphicon glyphicon-screenshot'></span></button>" +
      "</div>\n" +
      "<!--zoom buttons-->\n" +
      "<div class='btn-group'>\n" +
      "<button id='zoom_in' class='zoom in btn btn-default'\n" +
      "        data-toggle='tooltip' title='Zoom in' \n" +
      "        type='button'>\n" +
      "<span class='glyphicon glyphicon-zoom-in'></span>\n" +
      "</button>\n" +
      "<button id='zoom_out' class='zoom out btn btn-default'\n" +
      "        data-toggle='tooltip' title='Zoom out' \n" +
      "        type='button'>\n" +
      "<span class='glyphicon glyphicon-zoom-out'></span>\n" +
      "</button>\n" +
      "</div> \n" +
      "<div class='btn-group'>" +
      "<button id='slideLeft' class='zoom in btn btn-default' data-toggle='tooltip'" +
      " title='Change file' type='button' disabled>" +
      "<span class='glyphicon glyphicon-chevron-left'></span>" +
      "</button><button id='slideRight' class='zoom out btn btn-default'" +
      " data-toggle='tooltip' title='Change file'" +
      " type='button' disabled>" +
      "<span class='glyphicon glyphicon-chevron-right'></span></button>" +
      "</div>" +
      "<div id='fileNameDiv'></div>" +
      "</div>\n" +
      "<div id='popup_description' style='display: none'>" +
      "<button id='closePop' class='close' type='button'>&times;</button>" +
      "<button class='btn btn-default' id='downloadCsv'" +
      " type='button' data-toogle='tooptip'" +
      " title='Export as csv'>" +
      "<span class='glyphicon glyphicon-save-file'></span>" +
      "</button>" +
      "<div class=\"popupHeaders\">General sequence info</div>" +
      "<div style='border-top: 3px solid #4588ba; position: relative;" +
      "top: 10px; margin-bottom: 10px;'>" +
      "</div>" +
      "<div id='accessionPop'></div>" +
      "<div id='speciesNamePop'><span style='color: #468499'>Species:</span>" +
      "<span id='speciesNamePopSpan'></span>" +
      "</div>" +
      "<div id='lengthPop'></div>" +
      "<div id='plasmidNamePop'>" +
      "<span style='color: #468499'>Plasmid: </span>" +
      "<span id='plasmidNamePopSpan'></span>" +
      "</div>" +
      "<div id='percentagePop'><span style='color: #468499'>Percentage:</span>" +
      "<span id='percentagePopSpan'></span>" +
      "</div>" +
      "<div id='copyNumberPop'><span style='color: #468499'>Relative copy" +
      " number:</span>" +
      "<span id='copyNumberPopSpan'></span>" +
      "</div>" +
      "<br />" +
      // "</div>" +
      "<ul class='nav nav-tabs' style=\"display: flex; justify-content: center;\">" +
      "<li id='resButton'>" +
      "<a data-toggle='tab' href='#resTab'>Resistances</a>" +
      "</li>" +
      "<li id='plasmidButton'>" +
      "<a data-toggle='tab' href='#pfTab'>Plasmid finder</a>" +
      "</li>" +
      "<li id='virButton'>" +
      "<a data-toggle='tab' href='#virTab'>Virulence</a>" +
      "</li>" +
      "</ul>" +
      "<div class='tab-content' id='popupTabs'>" +
      "<div id='pfTab' class='tab-pane fade'>" +
      "<div id='pfPop' class=\"popupHeaders\">PlasmidFinder database</div>" +
      "<div style='border-top: 3px solid #4588ba; position: relative;" +
      "top: 10px; margin-bottom: 10px;'>" +
      "</div>" +
      "<div id='pfGenePop'>" +
      "<span style='color: #468499'>Gene name: </span>" +
      "<span id='pfGenePopSpan'></span>" +
      "</div>" +
      "<div id='pfGenbankPop'>" +
      "<span style='color: #468499'>Genbank Accession: </span>" +
      "<span id='pfGenbankPopSpan'></span>" +
      "</div>" +
      "<div>Matching genes information</div>" +
      "<div id='pfCoveragePop'>" +
      "<span style='color: #468499'>Coverage: </span>" +
      "<span id='pfCoveragePopSpan'></span>" +
      "</div>" +
      "<div id='pfIdentityPop'>" +
      "<span style='color: #468499'>Identity: </span>" +
      "<span id='pfIdentityPopSpan'></span>" +
      "</div>" +
      "<div id='pfRangePop'>" +
      "<span style='color: #468499'>Range in plasmid: </span>" +
      "<span id='pfRangePopSpan'></span>" +
      "</div>" +
      "</div>" +
      "<div id='resTab' class='tab-pane fade'>" +
      "<div id='cardPop' class=\"popupHeaders\">CARD database</div>" +
      "<div style='border-top: 3px solid #4588ba; position: relative;" +
      "top: 10px; margin-bottom: 10px;'>" +
      "</div>" +
      "<div id='cardGenePop'>" +
      "<span style='color: #468499'>Gene name: </span>" +
      "<span id='cardGenePopSpan'></span>" +
      "</div>" +
      "<div id='cardGenbankPop'>" +
      "<span style='color: #468499'>Genbank accession: </span>" +
      "<span id='cardGenbankPopSpan'></span>" +
      "</div>" +
      "<div id='cardAroPop'>" +
      "<span style='color: #468499'>ARO accessions: </span>" +
      "<span id='cardAroPopSpan'></span>" +
      "</div>" +
      "<div>Matching genes information</div>" +
      "<div id='cardCoveragePop'>" +
      "<span style='color: #468499'>Coverage: </span>" +
      "<span id='cardCoveragePopSpan'></span>" +
      "</div>" +
      "<div id='cardIdPop'>" +
      "<span style='color: #468499'>Identity: </span>" +
      "<span id='cardIdPopSpan'></span>" +
      "</div>" +
      "<div id='cardRangePop'>" +
      "<span style='color: #468499'>Range in plasmid: </span>" +
      "<span id='cardRangePopSpan'></span>" +
      "</div>" +
      "<div id='resfinderPop' class=\"popupHeaders\">ResFinder database" +
      "<div style='border-top: 3px solid #4588ba; position: relative;" +
      "top: 10px; margin-bottom: 10px;'>" +
      "</div>" +
      "</div>" +
      "<div id='resfinderGenePop'>" +
      "<span style='color: #468499'>Gene name: </span>" +
      "<span id='resfinderGenePopSpan'></span>" +
      "</div>" +
      "<div id='resfinderGenbankPop'>" +
      "<span style='color: #468499'>Genbank accession: </span>" +
      "<span id='resfinderGenbankPopSpan'></span>" +
      "</div>" +
      "<div>Matching genes information</div>" +
      "<div id='resfinderCoveragePop'>" +
      "<span style='color: #468499'>Coverage: </span>" +
      "<span id='resfinderCoveragePopSpan'></span>" +
      "</div>" +
      "<div id='resfinderIdPop'>" +
      "<span style='color: #468499'>Identity: </span>" +
      "<span id='resfinderIdPopSpan'></span>" +
      "</div>" +
      "<div id='resfinderRangePop'>" +
      "<span style='color: #468499'>Range in plasmid: </span>" +
      "<span id='resfinderRangePopSpan'></span>" +
      "</div></div>" +
      "<div id='virTab' class='tab-pane fade'>" +
      "<div id='virPop' class='popupHeaders'>Virulence database</div>" +
      "<div style='border-top: 3px solid #4588ba; position: relative;" +
      "top: 10px; margin-bottom: 10px;'>" +
      "</div>" +
      "<div id='virGenePop'>" +
      "<span style='color: #468499'>Gene name: </span><span" +
      " id='virGenePopSpan'></span>" +
      "</div>" +
      "<div id='virGenbankPop'>" +
      "<span style='color: #468499'>Genbank Accession: </span>" +
      "<span id='virGenbankPopSpan'></span>" +
      "</div>" +
      "<div>Matching genes information</div>" +
      "<div id='virCoveragePop'>" +
      "<span style='color: #468499'>Coverage: </span>" +
      "<span id='virCoveragePopSpan'></span>" +
      "</div>" +
      "<div id='virIdentityPop'>" +
      "<span style='color: #468499'>Identity: </span>" +
      "<span id='virIdentityPopSpan'></span>" +
      "</div>" +
      "<div id='virRangePop'>" +
      "<span style='color: #468499'>Range in plasmid: </span>" +
      "<span id='virRangePopSpan'></span>" +
      "</div>" +
      "</div>" +
      "</div></div></div>"
    )

  // should be executed when listGiFilter is empty ... mainly for area selection
  const reGetListGi = (g, graphics) => {
    let tempListAccessions = []
    g.forEachNode( (node) => {
      const currentNodeUI = graphics.getNodeUI(node.id)
      if (currentNodeUI.color === 0x23A900) { tempListAccessions.push(node.id) }
    })
    return tempListAccessions
  }
  if (forgetListGiFilter === false) {
    listGiFilter = (listGiFilter.length === 0) ? reGetListGi(g, graphics) : listGiFilter
  }

  // otherwise doesn't care for listGiFilter because is just a page reload
  onload()
}

/**
 * Function to display the loader mask
 * @returns {Promise} Returns a promise that resolves by triggering the
 * loader div
 */
const showDiv = () => {
  return new Promise( (resolve) => {
    // disables this button group
    $("#toolButtonGroup button").attr("disabled", "disabled")
    resolve($("#loading").show())
  })
}

// function to reset node colors
/**
 * Function that resets node colors
 * @param {Object} graphics - vivagraph functions related with node and link
 * data.
 * @param {Object} g - graph related functions that iterate through nodes
 * and links.
 * @param {Float} nodeColor - the color value for vivagraph (e.g. 0x<hexcode>)
 * @param {Object} renderer - vivagraph object to render the graph.
 */
const nodeColorReset = (graphics, g, nodeColor, renderer) => {
  document.getElementById("taxa_label").style.display = "none" // hide label
  g.forEachNode( (node) => {
    const nodeUI = graphics.getNodeUI(node.id)
    // reset all nodes before changing colors because of the second instance of filters
    if (nodeUI.color !== nodeColor) {
      nodeUI.backupColor = nodeUI.color
      nodeUI.color = nodeColor
      // it also needs to remove data from percentage and copy number
      node.data.percentage = ""
      node.data.copyNumber = ""
    }
  })
  renderer.rerender()
}

