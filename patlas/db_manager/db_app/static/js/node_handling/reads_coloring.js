// convertes a given range to valies between c and 1
const rangeConverter = (x, oldMin, oldMax, newMin, newMax) => {
  // initial range is between 0 and 1
  // newMax should be 1
  // newMin should be the one that may change on user input and default
  // behavior should be 0.6--> this is done by cutoffParser()
  const y = (x - oldMin) * (newMax - newMin) / (oldMax - oldMin) + newMin
  return y
}

// TODO this three functions could be merged
// function to get value from cutoffValue
const cutoffParser = () => {
  return ($("#cutoffValue").val() !== "") ? parseFloat($("#cutoffValue").val()) : 0.6
}

// function to get value from cutoffValue
const cutoffParserMash = () => {
  return ($("#cutoffValueMash").val() !== "") ? parseFloat($("#cutoffValueMash").val()) : 0.9
}

const copyNumberCutoff = () => {
  return ($("#copyNumberValue").val() !== "") ? parseFloat($("#copyNumberValue").val()) : 2
}

// function to iterate through nodes
const node_iter = (g, readColor, gi, graphics, perc, copyNumber) => {
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

// get pallete
const palette = (scale, x, readMode) => { // x is the number of colors
// to the
// gradient
  showLegend = document.getElementById("colorLegend") // global variable to
  // be reset by the button reset-filters
  showLegend.style.display = "block"
  const tmpArray = new Array(x)// create an empty array with length x
  const style_width = 100 / x
  // enters this statement for coloring the links and not the nodes
  if (readMode !== true) {
    $("#scaleLegend").empty()
    $("#scaleString").empty()
    // this loop should be reversed since the higher values will have a lighter color
    for (let i = tmpArray.length - 1; i >= 0; i--) {
      const color_element = scale(i / x).hex()
      $("#scaleLegend").append("<span class='grad-step'" +
        " style='background-color:" + color_element + "; width:" +
        style_width + "%'></span>")
    }
    $("#scaleString").append("<div class='min'>0.1</div>")
    $("#scaleString").append("<div class='med'>0.05</div>")
    $("#scaleString").append("<div class='max'>0</div>")
    document.getElementById("distance_label").style.display = "block" // show label
  } else { // here enters for coloring the reads
    $("#readLegend").empty()
    $("#readString").empty()
    for (let i = 0; i < tmpArray.length; i++) {
      const color_element = scale(i / x).hex()
      $("#readLegend").append("<span class='grad-step' style='background-color:"
         + color_element + "; width:" + style_width + "%'></span>")
    }
  }
}

// single read displayer
// This function colors each node present in input read json file

const readColoring = (g, listGi, graphics, renderer, readString) => {
  const readMode = true
  let listGiFilter = []
  let meanValue, minValue
  let counter = 0
  for (let string in readString) {
    counter += 1
    const gi = string
    const perc = readString[string]

    // adds node if it doesn't have links
    // TODO singletons were removed in order to avoid misleading users
    // if (list_gi.indexOf(gi) <= -1) {
    //   g.addNode(gi, {
    //     sequence: "<span style='color:#468499'>Accession: </span><a " +
    //     "href='https://www.ncbi.nlm.nih.gov/nuccore/" + gi.split("_").slice(0, 2).join("_") + "' target='_blank'>" + gi + "</a>",
    //     log_length: 10
    //     // percentage: "<font color='#468499'>percentage: </font>" + perc
    //   })
    //   list_gi.push(gi)
    // }
    // checks if it is an array --> enabling mash mode
    if (perc.constructor === Array) {
      const identity = parseFloat(perc[0])
      const copyNumber = perc[1]
      // TODO removed previous implementation of comparison between mash
      // samples
      // if (document.getElementsByClassName("check_file_mash").checked) {
      //   if (identity >= 0.5) {
      //     // perc values had to be normalized to the percentage value between 0
      //     // and 1
      //     const readColor = chroma.mix("#eacc00", "maroon", (identity - 0.5) * 2).hex()
      //       .replace("#", "0x")
      //     node_iter(g, readColor, gi, graphics, identity, copyNumber)
      //     listGiFilter.push(gi)
      //   } else {
      //     const readColor = chroma.mix("blue", "#eacc00", identity * 2).hex()
      //       .replace("#", "0x")
      //     node_iter(g, readColor, gi, graphics, identity, copyNumber)
      //     listGiFilter.push(gi)
      //   }
      //   const scale = chroma.scale(["blue", "#eacc00", "maroon"])
      //   palette(scale, 10, readMode)
      // } else {
        if (identity >= cutoffParserMash() && copyNumber >= copyNumberCutoff()) {
          const newPerc = rangeConverter(identity, cutoffParserMash(), 1, 0, 1)
          const readColor = chroma.mix("lightsalmon", "maroon", newPerc).hex().replace("#", "0x")
          const scale = chroma.scale(["lightsalmon", "maroon"])
          palette(scale, 10, readMode)
          node_iter(g, readColor, gi, graphics, identity, copyNumber)
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
          node_iter(g, readColor, gi, graphics, perc)
          if (listGi.includes(gi)) {
            listGiFilter.push(gi)
          }
        } else {
          const readColor = chroma.mix("blue", "#eacc00", perc * 2).hex()
            .replace("#", "0x")
          node_iter(g, readColor, gi, graphics, perc)
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
          node_iter(g, readColor, gi, graphics, perc)
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
  $("#readString").append("<div class='min'>" +
    minValue.toString() + "</div>")
  $("#readString").append("<div class='med'>" +
    meanValue.toFixed(2).toString() + "</div>")
  $("#readString").append("<div class='max'>1</div>")
  document.getElementById("read_label").style.display = "block" // show label
  // control all related divs
  // TODO this code is duplicated, should be fixed
  let showRerun = document.getElementById("Re_run")
  let showGoback = document.getElementById("go_back")
  let showDownload = document.getElementById("download_ds")
  let showTable = document.getElementById("tableShow")
  let plotButton = document.getElementById("plotButton")
  showRerun.style.display = "block"
  showGoback.style.display = "block"
  showDownload.style.display = "block"
  showTable.style.display = "block"
  plotButton.style.display = "block"
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
    const linkUI = (link !== undefined) ? graphics.getLinkUI(link.id) : null
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
const reset_link_color = (g, graphics, renderer) => {
  g.forEachLink(function (link) {
    const linkUI = graphics.getLinkUI(link.id)
    linkUI.color = 0xb3b3b3ff
  })
  renderer.rerender()
  // $("#loading").hide()
}

// *** color scale legend *** //
// for distances

const color_legend = (readMode) => {
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

const resetAllNodes = (graphics, g, nodeColor, renderer, idsArrays) => {
  // first iters nodes to get nodeColor (default color)
  node_color_reset(graphics, g, nodeColor, renderer)
  // then deals with legend, and buttons associated with filters
  if (typeof showLegend !== "undefined" && $("#scaleLegend").html() === "") {
    showLegend.style.display = "none"
    // showRerun.style.display = "none"
    // showGoback.style.display = "none"
    //document.getElementById("go_back").className += " disabled"
    // showDownload.style.display = "none"
    // showTable.style.display = "none"
    document.getElementById("read_label").style.display = "none" // hide label
    $("#readLegend").empty()
  } else {
    $("#colorLegend").hide()
    $("#colorLegendBox").empty()
    document.getElementById("taxa_label").style.display = "none" // hide label
    // showRerun.style.display = "none"
    // showGoback.style.display = "none"
    //document.getElementById("go_back").className += " disabled"
    // showDownload.style.display = "none"
    // showTable.style.display = "none"
    document.getElementById("read_label").style.display = "none" // hide label
    $("#readLegend").empty()
  }
  resetDisplayTaxaBox(idsArrays)
  // hide and empty assembly related legend
  $("#assemblyLabel").hide()
  $("#assemblyLegend").empty()
  // empty and hide legend for taxa
  $("#taxa_label").hide()
  $("#colorLegendBox").empty()
  // empty and hide legend for resistances
  $("#res_label").hide()
  $("#colorLegendBoxRes").empty()
  // empty and hide legend for plasmid families
  $("#pf_label").hide()
  $("#colorLegendBoxPf").empty()
  // empty and hide distances legend
  // $("#distance_label").hide()
  // $("#scaleLegend").empty()
  // empty and hide read legend
  $("#read_label").hide()
  $("#readLegend").empty()

  // resets dropdown selections
  $("#orderList").selectpicker("deselectAll")
  $("#familyList").selectpicker("deselectAll")
  $("#genusList").selectpicker("deselectAll")
  $("#speciesList").selectpicker("deselectAll")
  forceSelectorFullRemoval("speciesList")
  forceSelectorFullRemoval("genusList")
  forceSelectorFullRemoval("familyList")
  forceSelectorFullRemoval("orderList")

  // reset plasmid families and resistance associated divs
  // this needs an array for reusability purposes
  resetDisplayTaxaBox(["p_Plasmidfinder"])
  forceSelectorFullRemoval("plasmidFamiliesList")
  // resets dropdown selections
  $("#plasmidFamiliesList").selectpicker("deselectAll")

  resetDisplayTaxaBox(["p_Resfinder", "p_Card"])
  // resets dropdown selections
  $("#cardList").selectpicker("deselectAll")
  $("#resList").selectpicker("deselectAll")
  forceSelectorFullRemoval("cardList")
  forceSelectorFullRemoval("resList")
}
