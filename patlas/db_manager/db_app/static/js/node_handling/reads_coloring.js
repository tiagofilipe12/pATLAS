/*globals listGiFilter, resetDisplayTaxaBox, chroma, showLegend, nodeColorReset */

/**
 * Function that convert a given range of values between oldMin and oldMax
 * to newMin and newMax
 * @param {number} x - the value to be converted
 * @param {number} oldMin - the old min value set for the interval range
 * where x was present
 * @param {number} oldMax - the old max value set for the interval range
 * where x was present
 * @param {number} newMin - The new min value to change x to
 * @param {number} newMax - The new max value to change x to
 * @returns {number} - the changed x value within the new range
 */
const rangeConverter = (x, oldMin, oldMax, newMin, newMax) => {
  // initial range is between 0 and 1
  // newMax should be 1
  // newMin should be the one that may change on user input and default
  // behavior should be 0.6--> this is done by cutoffParser()
  return (x - oldMin) * (newMax - newMin) / (oldMax - oldMin) + newMin
}

/**
 * Function to check if the user set a cutoff value for mapping results
 * coverage percentage and if none is provided a default will be set here.
 * @returns {number}
 */
const cutoffParser = () => {
  const cutoff = $("#cutoffValue").val()
  return (cutoff !== "") ? parseFloat(cutoff.val()) : 0.6
}

/**
 * Function to check if the user set a cutoff value for mash screen results
 * percentage and if none is defined set a default value
 * @returns {number} - The cutoff percentage cutoff value for mash import
 */
const cutoffParserMash = () => {
  const cutoffMash = $("#cutoffValueMash").val()
  return (cutoffMash !== "") ? parseFloat(cutoffMash) : 0.9
}

/**
 * Function to check if the user set a new copy number cutoff and if none is
 * provided set a default value
 * @returns {number} - The copy number cutoff value
 */
const copyNumberCutoff = () => {
  const cutoffCopy =$("#copyNumberValue").val()
  return (cutoffCopy !== "") ? parseFloat(cutoffCopy) : 1
}

// function to iterate through nodes
/**
 * Function to iterate through all nodes and add percentages and copy number
 * of a single plasmid to pATLAS
 * @param {Object} g - graph related functions that iterate through nodes
 * and links.
 * @param {number} readColor - The actual color to be added to the plasmid
 * being queried.
 * @param {String} gi - The accession number to be queried and for which the
 * color should change
 * @param {Object} graphics - vivagraph functions related with node and link
 * data.
 * @param {number} perc - the percentage value that is associated with this
 * plasmid
 * @param {number} copyNumber - The copy number value associated with this
 * plasmid that came from mash screen results. Other modules will not have
 * copy number for now
 */
const nodeIter = (g, readColor, gi, graphics, perc, copyNumber) => {
  g.forEachNode( (node) => {
    // when filter removes all nodes and then adds them again. Looks like g
    // was somehow affected.
    // if statement added for parsing singletons into the graph visualization
    // if (node.id.indexOf("singleton") > -1) {
    //   nodeGI = node.id.split("_").slice(1, 4).join("_")
    // } else {
    const nodeGI = node.id.split("_").slice(0, 3).join("_")
    // }
    const nodeUI = graphics.getNodeUI(node.id)

    if (gi === nodeGI) {
      nodeUI.backupColor = nodeUI.color
      nodeUI.color = readColor
      perc = parseFloat(perc)
      node.data["percentage"] =  perc.toFixed(2).toString()
      if (copyNumber) {
        node.data["copyNumber"] = copyNumber.toString()
      }
    }
  })
}

/**
 * Function that allows pATLAs to select the proper color palette for the
 * desired mode
 * @param {Function} scale - the function that defines the scale generated
 * by the module chroma
 * @param {number} x - the number of ticks that will be displayed in legend,
 * which will result in the actual number of colors present in the gradient
 * @param {boolean} readMode - boolean used to control if we are dealing
 * with imports from files or with distance or size ratio modes
 */
const palette = (scale, x, readMode) => {
//   showLegend = document.getElementById("colorLegend") // global variable to
  // be reset by the button reset-filters
  showLegend.style.display = "block"
  const tmpArray = new Array(x)// create an empty array with length x
  const styleWidth = 100 / x
  // enters this statement for coloring the links and not the nodes
  if (readMode !== true) {
    $("#scaleLegend").empty()
    $("#scaleString").empty()
    // this loop should be reversed since the higher values will have a lighter color
    for (let i = tmpArray.length - 1; i >= 0; i--) {
      const colorElement = scale(i / x).hex()
      $("#scaleLegend").append("<span class='grad-step'" +
        " style='background-color:" + colorElement + "; width:" +
        styleWidth + "%'></span>")
    }
    $("#scaleString").append("<div class='min'>0.1</div>")
      .append("<div class='med'>0.05</div>")
      .append("<div class='max'>0</div>")
    document.getElementById("distance_label").style.display = "block" // show label
  } else { // here enters for coloring the reads
    $("#readLegend").empty()
    $("#readString").empty()
    for (let i = 0; i < tmpArray.length; i++) {
      const colorElement = scale(i / x).hex()
      $("#readLegend").append("<span class='grad-step' style='background-color:"
         + colorElement + "; width:" + styleWidth + "%'></span>")
    }
  }
}

/**
 * A function to color each node present in input json files, either they
 * are from mapping, mash screen or even sequence import features. Note that
 * this function only reads one file at a time
 * @param {Object} g - graph related functions that iterate through nodes
 * and links.
 * @param {Array} listGi - array that stores all accession numbers of the
 * nodes present in default vivagraph instance
 * @param {Object} graphics - vivagraph functions related with node and link
 * data.
 * @param {Object} renderer - vivagraph object to render the graph.
 * @param {String} readString - a string with the accession number for the
 * current read file
 * @returns {*[]} [listGi, listGiFilter]- returns the updated listGi which may
 * become legacy in
 * future implementation given that singletons are no longer absent from the
 * initial network. It also returns listGiFilter, the list of accession
 * numbers that is used by many other features throughout pATLAS.
 */
const readColoring = (g, listGi, graphics, renderer, readString) => {
  const readMode = true
  let listGiFilter = []
  let meanValue, minValue
  let counter = 0
  for (let string in readString) {
    if ({}.hasOwnProperty.call(readString, string)) {
      counter += 1
      const gi = string
      const perc = readString[string]

      // adds node if it doesn't have links

      if (perc.constructor === Array) {
        const identity = parseFloat(perc[0])
        const copyNumber = perc[1]

        if (identity >= cutoffParserMash() && copyNumber >= copyNumberCutoff()) {
          const newPerc = rangeConverter(identity, cutoffParserMash(), 1, 0, 1)
          const readColor = chroma.mix("lightsalmon", "maroon", newPerc).hex().replace("#", "0x")
          const scale = chroma.scale(["lightsalmon", "maroon"])
          palette(scale, 10, readMode)
          nodeIter(g, readColor, gi, graphics, identity, copyNumber)
          if (listGi.includes(gi)) {
            listGiFilter.push(gi)
          }
        }
        if (Object.keys(readString).length === counter) {
          // min value is the one fetched from the input form or by default 0.6
          // values are fixed to two decimal
          minValue = parseFloat(
            ($("#cutoffValueMash").val() !== "") ? $("#cutoffValueMash").val() : "0.90"
          ).toFixed(2)
          // mean value is the sum of the min value plus the range between the min
          // and max values divided by two
          meanValue = parseFloat(minValue) + ((1 - parseFloat(minValue)) / 2)
        }
        // }
        // otherwise just runs read mode
      } else {
        if (document.getElementsByClassName("check_file").checked) {
          if (perc >= 0.5) {
            // perc values had to be normalized to the percentage value between 0
            // and 1
            const readColor = chroma.mix("#eacc00", "maroon", (perc - 0.5) * 2).hex()
              .replace("#", "0x")
            nodeIter(g, readColor, gi, graphics, perc)
            if (listGi.includes(gi)) {
              listGiFilter.push(gi)
            }
          } else {
            const readColor = chroma.mix("blue", "#eacc00", perc * 2).hex()
              .replace("#", "0x")
            nodeIter(g, readColor, gi, graphics, perc)
            if (listGi.includes(gi)) {
              listGiFilter.push(gi)
            }
          }
          const scale = chroma.scale(["blue", "#eacc00", "maroon"])
          palette(scale, 10, readMode)
        } else {
          if (perc >= cutoffParser()) {
            const newPerc = rangeConverter(perc, cutoffParser(), 1, 0, 1)
            const readColor = chroma.mix("lightsalmon", "maroon", newPerc).hex().replace("#", "0x")
            const scale = chroma.scale(["lightsalmon", "maroon"])
            palette(scale, 10, readMode)
            nodeIter(g, readColor, gi, graphics, perc)
            if (listGi.includes(gi)) {
              listGiFilter.push(gi)
            }
          }
        }
        if (Object.keys(readString).length === counter) {
          // min value is the one fetched from the input form or by default 0.6
          // values are fixed to two decimal
          minValue = parseFloat(
            ($("#cutoffValue").val() !== "") ? $("#cutoffValue").val() : "0.60"
          ).toFixed(2)
          // mean value is the sum of the min value plus the range between the min
          // and max values divided by two
          meanValue = parseFloat(minValue) + ((1 - parseFloat(minValue)) / 2)
        }
      }
    }
  }
  $("#readString").append("<div class='min'>" +
    minValue.toString() + "</div>")
    .append("<div class='med'>" +
      meanValue.toFixed(2).toString() + "</div>")
    .append("<div class='max'>1</div>")
  $("#read_label").show()
  // control all related divs
  $("#Re_run, #go_back, #download_ds, #tableShow, #heatmapButtonTab," +
    " #plotButton, #colorLegend").show()
  renderer.rerender()
  $("#loading").hide()
  return [listGi, listGiFilter]
}


///////////////////
// link coloring //
///////////////////
/**
 * Function to control the coloring of links either in distance filters or
 * in size ratio filters.
 * @param {Object} g - graph related functions that iterate through nodes
 * and links.
 * @param {Object} graphics - vivagraph functions related with node and link
 * data.
 * @param {Object} renderer - vivagraph object to render the graph.
 * @param {String} mode - This string controls the mode that in which the
 * links will be colored. It may have two options: "distance" and "size".
 * @param {boolean} toggle - This render true or false depending if it
 * removes the links or not, respectively
 */
const linkColoring = (g, graphics, renderer, mode, toggle) => {
  const promises = []
  const storeLinks = []
  g.forEachLink( (link) => {
    const linkUI = (typeof link !== "undefined") ? graphics.getLinkUI(link.id) : null
    let linkColor
    // the lower the value the more intense the color is
    if (mode === "distance") {
      const dist = link.data.distance * 10
      if (document.getElementById("colorForm").value === "Green color scheme" || document.getElementById("colorForm").value === "") {
        linkColor = chroma.mix("#65B661", "#CAE368", dist).hex().replace("#", "0x") + "FF"
      } else if (document.getElementById("colorForm").value === "Blue color" +
        " scheme") {
        linkColor = chroma.mix("#025D8C", "#73C2FF", dist).hex().replace("#", "0x") + "FF"
      } else if (document.getElementById("colorForm").value === "Red color" +
        " scheme") {
        linkColor = chroma.mix("#4D0E1C", "#E87833", dist).hex().replace("#", "0x") + "FF"
      }
      // since linkUI seems to use alpha in its color definition we had to set alpha to 100%
      // opacity by adding "FF" at the end of color string
      linkUI.color = linkColor
    } else {
      // used for "size" mode
      // checks if link has size ratio inside the specified value
      if (100 - parseFloat($("#formRatio").val()) >= link.data.sizeRatio * 100) {
        if (toggle === true) {
          // stores nodes in array to remove after this loop
          storeLinks.push(link)
          promises.push(link)
        } else {
          // just colors the links within the selection
          linkColor = $("#cp4Form").val().replace("#", "0x") + "FF"
          linkUI.color = linkColor
          promises.push(link)
        }
      }
    }
  })
  Promise.all(promises).then( () => {
    for (let l of storeLinks) {
      g.removeLink(l)
    }
    $("#loading").hide()
    renderer.rerender()
  })
}

// option to return links to their default color
/**
 * A function to reset the color of all links to default color scheme.
 * @param {Object} g - graph related functions that iterate through nodes
 * and links.
 * @param {Object} graphics - vivagraph functions related with node and link
 * data.
 * @param {Object} renderer - vivagraph object to render the graph.
 */
const resetLinkColor = (g, graphics, renderer) => {
  g.forEachLink(function (link) {
    const linkUI = graphics.getLinkUI(link.id)
    linkUI.color = 0xb3b3b3ff
  })
  renderer.rerender()
  // $("#loading").hide()
}

// *** color scale legend *** //
// for distances

/**
 * Function to define color legend scale depending on the color scheme
 * selected for link distances,
 * @param {boolean} readMode - here it is set to false in order to provide
 * it to child palette function, which will use it to selct a different
 * color scheme for this link coloring mode.
 */
const colorLegendFunction = (readMode) => {
  const scale = (document.getElementById("colorForm").value === "Green" +
    " color scheme") ? chroma.scale(["#65B661", "#CAE368"]) :
    (document.getElementById("colorForm").value === "") ?
    chroma.scale(["#65B661", "#CAE368"]) :
    (document.getElementById("colorForm").value === "Blue color scheme") ?
      chroma.scale(["#025D8C", "#73C2FF"]) :
      chroma.scale(["#4D0E1C", "#E87833"])
  palette(scale, 10, readMode)
}

const forceSelectorFullRemoval = (selector) => {
  $(`#${selector}`).val("").trigger("change")
}

// Clear nodes function for reset-sliders button
/**
 * Function to clear all nodes to default state, storing previous color in
 * backupColor
 * @param {Object} graphics - vivagraph functions related with node and link
 * data.
 * @param {Object} g - graph related functions that iterate through nodes
 * and links.
 * @param {number} nodeColor - a variable that stores the hex code in
 * vivagraph readable style: 0xrrggbb.
 * @param {Object} renderer - vivagraph object to render the graph.
 * @param {Array} idsArrays - array that store ids names for taxa related labels
 */
const resetAllNodes = (graphics, g, nodeColor, renderer, idsArrays) => {
  // first iters nodes to get nodeColor (default color)
  nodeColorReset(graphics, g, nodeColor, renderer)
  // then deals with legend, and buttons associated with filters
  if (typeof showLegend !== "undefined" && $("#scaleLegend").html() === "") {
    $("#colorLegend, #read_label").hide()
    $("#readLegend").empty()
  } else {
    $("#colorLegend, #taxa_label, #read_label").hide()
    $("#colorLegendBox, #readLegend").empty()
  }
  // reset text boxes in modals
  resetDisplayTaxaBox(idsArrays)
  resetDisplayTaxaBox(["p_Resfinder", "p_Card", "p_Plasmidfinder", "p_Virulence"])
  // hide and empty divs
  $("#assemblyLabel, #taxa_label, #res_label, #pf_label, #vir_label, #read_label").hide()
  $("#assemblyLegend, #colorLegendBox, #colorLegendBoxRes," +
    " #colorLegendBoxPf, #colorLegendBoxVir, #readLegend").empty()

  // resets dropdown selections
  $("#orderList, #familyList, #genusList, #speciesList, #cardList, #resList," +
    " #plasmidFamiliesList, #virList").selectpicker("deselectAll")

  // function that forces the full removal of selectors
  forceSelectorFullRemoval("speciesList")
  forceSelectorFullRemoval("genusList")
  forceSelectorFullRemoval("familyList")
  forceSelectorFullRemoval("orderList")
  forceSelectorFullRemoval("plasmidFamiliesList")
  forceSelectorFullRemoval("cardList")
  forceSelectorFullRemoval("resList")
  forceSelectorFullRemoval("virList")
}
/**
 * Function to push value to masterReadArray
 * @param {Object} readFilejson - the object that contains the files to be
 * loaded and their respective jsons as values.
 * @returns {Array} returnArray - returns an array with all the accession
 * numbers that match the defined criteria
 */
const pushToMasterReadArray = (readFilejson) => {
  const returnArray = []
  // iterate for all files and save to masterReadArray to use in heatmap
  for (const i in readFilejson) {
    if (readFilejson.hasOwnProperty(i)) {
      const fileEntries = JSON.parse(readFilejson[i])
      // iterate each accession number
      for (const i2 in fileEntries) {
        if (fileEntries.hasOwnProperty(i2)) {
          // if not in masterReadArray then add it
          const percValue = (typeof(fileEntries[i2]) === "number") ?
            fileEntries[i2] : parseFloat(fileEntries[i2][0])
          if (fileEntries[i2].constructor !== Array) {
            if (returnArray.indexOf(i2) < 0 && percValue >= cutoffParser()) {
              returnArray.push(i2)
            }
          } else {
            const copyNumber = parseFloat(fileEntries[i2][1])
            if (returnArray.indexOf(i2) < 0 && percValue >= cutoffParserMash() && copyNumber >= copyNumberCutoff()) {
              returnArray.push(i2)
            }
          }
        }
      }
    }
  }
  return returnArray
}