/*globals makeHash, reloadAccessionList, assembly, listGiFilter,
 colorNodes, readColoring, removeImportInfo, selectedFilter, getLinkedNodes */

// function that adds links, avoiding duplication below on reAddNode function
/**
 * A function that adds links, avoiding duplication below on reAddNode
 * function. This function avoids that duplicated links are added to the
 * visualization, reducing to the minimum the amount of information
 * displayed in the graph.
 * @param {Object} g - object that stores vivagraph graph associated functions
 * @param {Array} newListHashes - an array with a list of hashes, each one
 * coding for an already added link.
 * @param {String} sequence - the accession number of the node being added
 * @param {String} linkAccession - the accession number of the linked node
 * @param {String} linkDistance - the distance between the sequence and the
 * linkAccession nodes
 * @returns {Array} newListHashes - returns an array with a list of hashes
 * updated that will be stored until all nodes and links have been added.
 * This is used to avoid link duplication.
 */
const addLinks = (g, newListHashes, sequence, linkAccession, linkDistance, sizeRatio) => {

  const currentHash = makeHash(sequence, linkAccession)

  if (newListHashes.indexOf(currentHash) < 0) {
    g.addLink(sequence, linkAccession, { distance: linkDistance, sizeRatio })
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
 * @param {Array} newList - an array with all the accession numbers that will
 * plotted.
 * @param {Array} newListHashes - an array with a list of hashes, each one
 * coding for an already added link.
 * @param {Array} listGiFilter - The list of accession numbers that are
 * currently selected.
 * @returns {Array} returns an array with the updated newList which will
 * contain all added nodes and another array with the list of hashes already
 * added that is used to avoid the duplication of links in the graph (user
 * by reAddLinks function
 */
const reAddNode = (g, jsonObj, newList, newListHashes, listGiFilter) => {

  const sequence = jsonObj.plasmidAccession
  let length = jsonObj.plasmidLenght
  const linksArray = jsonObj.significantLinks

  // checks if sequence is within the queried accessions (newList)
  if (newList.indexOf(sequence) < 0) {
    g.addNode(sequence, {
      sequence: "<span style='color:#468499'>Accession:" +
      " </span><a" +
      " href='https://www.ncbi.nlm.nih.gov/nuccore/" + sequence.split("_").slice(0, 2).join("_") + "' target='_blank'>" + sequence + "</a>",
      seqLength: "<span style='color:#468499'>Sequence length: </span>" + ((length !== "N/A") ? length : "N/A"),
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

      /**
       * builds an array of each entry in significant links which contains
       * accession number as 0, distance as 1, percentage of shared hashes as 2,
       * and size of the plasmid as 3 (indexes respectively)
       * type {Array}
       */
      const entry = eachArray[i].replace(/[{}'u\[\] ]/g, "").split(",").slice(0).sort()

      const linkDistance = entry[1].split(":")[1]
      const linkLength = entry[3].split(":")[1]
      const linkAccession = entry[0].split(":")[1]
      const sizeRatio = Math.min(length, linkLength) / Math.max(length, linkLength)

      if (getLinkedNodes === true) {
        if (newList.indexOf(linkAccession) < 0) {
          g.addNode(linkAccession, {
            sequence: "<span style='color:#468499'>Accession:" +
            " </span><a" +
            " href='https://www.ncbi.nlm.nih.gov/nuccore/" + linkAccession.split("_").slice(0, 2).join("_") + "' target='_blank'>" + linkAccession + "</a>",
            seqLength: "<span" +
            " style='color:#468499'>Sequence length:" +
            " </span>" + linkLength,
            logLength: Math.log(parseInt(linkLength))
          })
          newList.push(linkAccession) //adds to list every time a node is
          // added here
          newListHashes = addLinks(g, newListHashes, sequence, linkAccession,
            linkDistance, sizeRatio)
        } else {
          // if node exist, links still need to be added
          newListHashes = addLinks(g, newListHashes, sequence, linkAccession,
            linkDistance, sizeRatio)
        }
      } else {
        if (newList.indexOf(linkAccession) < 0 && listGiFilter.indexOf(linkAccession) > -1) {
          g.addNode(linkAccession, {
            sequence: "<span style='color:#468499'>Accession:" +
            " </span><a" +
            " href='https://www.ncbi.nlm.nih.gov/nuccore/" + linkAccession.split("_").slice(0, 2).join("_") + "' target='_blank'>" + linkAccession + "</a>",
            seqLength: "<span" +
            " style='color:#468499'>Sequence length:" +
            " </span>" + linkLength,
            logLength: Math.log(parseInt(linkLength))
          })
          newList.push(linkAccession) //adds to list every time a node is
          // added here
          newListHashes = addLinks(g, newListHashes, sequence, linkAccession,
            linkDistance, sizeRatio)
        }
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
 * @param {Array} listGiFilter - The list of accession numbers that are
 * currently selected.
 * @param {Number} counter -
 * @param {Function} renderGraph - function used to render the graph
 * @param {Object} graphics - vivagraph functions related with node and link
 * data
 * @param {Array} reloadAccessionList - A list of the accession number used
 * to reload. This include all linked accessions to the ones present in
 * listGiFilter
 * @param {Function} renderer - Function that forces the graph to be updated
 * @param {Array} listGi - The list of all accessions present in pATLAS,
 * when loading for the first time
 * @param {String} readString - A string with the json objects to be parsed
 * into this function
 * @param {Object} assemblyJson - The object that contains the associations
 * of the new nodes to the plasmids present in pATLAS. This object may
 * suffer updates in future implementations, since this is an experimental
 * feature.
 * @returns {*[]} - returns an array containing two arrays that control the
 * the displayed accessions, both in listGiFilter and in realodAccessionList.
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

          // present in plasmid_db
          const jsonObj = {
            "plasmidAccession": data.plasmid_id,
            "plasmidLenght": data.json_entry.length,
            speciesName,
            plasmidName,
            // this splits the string into an array with each entry
            "significantLinks": (data.json_entry.significantLinks) ?
              data.json_entry.significantLinks : "N/A"
          }

          //add node
          reAddNodeList = reAddNode(g, jsonObj, reloadAccessionList,
            newListHashes, listGiFilter)

          reloadAccessionList = reAddNodeList[0]
          newListHashes = reAddNodeList[1]
        }
      })
      .then( () => {
        renderGraph(graphics)

        if (readString !== false ) {

          readColoring(g, listGi, graphics, renderer, readString)

        } else if (assemblyJson !== false) {

          const assemblyString = JSON.parse(Object.values(assemblyJson)[0])
          readColoring(g, listGi, graphics, renderer, assemblyString)

        } else if (selectedFilter === "res") {

          $("#resSubmit").click()

        } else if (selectedFilter === "pf") {

          $("#pfSubmit").click()

        } else if (selectedFilter === "taxa") {

          // simulates the click of the button
          // which checks the divs that contain the species, color the as if
          // the button was clicked and makes the legends
          $("#taxaModalSubmit").click()

        } else if (selectedFilter === "vir") {

          $("#virSubmit").click()

        } else if (selectedFilter === "intersect") {

          $("#intersectionsModalSubmit").click()

        } else if (selectedFilter === "union") {

          $("#unionModalSubmit").click()

        } else {

          colorNodes(g, graphics, renderer, listGiFilter,
            "0x" + "#fa5e00".replace("#", ""))
          // color for area selection
        }

      })

  }
  return [listGiFilter, reloadAccessionList]
}

/**
 * Function that should be exeuted when listGiFilter is empty, this is
 * mainly used to parse area selections.
 * @param {Object} g - graph related functions that iterate through nodes
 * and links
 * @param {Object} graphics - vivagraph functions related with node and link
 * data
 * @returns {Array} tempListAccessions - an array that contains the
 * accessions that are selected with area selection option.
 */
const reGetListGi = (g, graphics) => {
  let tempListAccessions = []
  g.forEachNode( (node) => {
    const currentNodeUI = graphics.getNodeUI(node.id)
    if (currentNodeUI.color === "0x" + "#fa5e00".replace("#", "")) {
      tempListAccessions.push(node.id)
    }
  })
  return tempListAccessions
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
  // checks for area selection
  if (forgetListGiFilter === false) {
    listGiFilter = (listGiFilter.length === 0) ?
      reGetListGi(g, graphics) : listGiFilter
  }
  // otherwise doesn't care for listGiFilter because is just a page reload
  if (listGiFilter.length > 0 && forgetListGiFilter === false) {
    // this is executed when re_run button is pressed and area selection or
    // selections via menu are made
    // removes all nodes from g using the same layout
    // change play button in order to be properly set to pause
    $("#couve-flor").empty()
    onload()
  } else if (forgetListGiFilter === true) {
    // this statement is executed if go_back button is pressed
    // removes all nodes from g using the same layout
    // change play button in order to be properly set to pause
    $("#couve-flor").empty()
    onload()
  } else {
    // this is executed when re_run button is pressed but no selections are made
    $("#loading").hide()
    $("#alertNoSelection").show()
  }
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

    // remove import divs for all nodes
    removeImportInfo(node)

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

