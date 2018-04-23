/*globals colorNodes, areaSelection, previousTableList, Highcharts,
 arraysEqual, clickedHighchart, arraytByValue, associativeObj */

//********//
// PLOTS  //
//********//

// object that controls colors and divs for contained depending on the
// selected clickerButton
const selector = {
  species: {
    color: "#058DC7",
    div: "chartContainerSpecies",
    state: false,
    alertString: false
  },
  genera: {
    color: "#50B432",
    div: "chartContainerGenus",
    state: false,
    alertString: false
  },
  families: {
    color: "#ED561B",
    div: "chartContainerFamily",
    state: false,
    alertString: false
  },
  orders: {
    color: "#DDDF00",
    div: "chartContainerOrder",
    state: false,
    alertString: false
  },
  clusters: {
    color: "#DF565F",
    div: "chartContainerCluster",
    state: false,
    alertString: false
  },
  resistances: {
    color:"#24CBE5",
    div: "chartContainerResistance",
    state: false,
    alertString: false
  },
  plasmidfamilies: {
    color: "#64E572",
    div: "chartContainerPlasmidFamilies",
    state: false,
    alertString: false
  },
  length: {
    color: "#A9B3CE",
    div: "chartContainerLength",
    state: false,
    alertString: false
  },
  virulence: {
    color: "#8773ff",
    div: "chartContainerVirulence",
    state: false,
    alertString: false
  }
}

/**
 * Function that prepeares array to be ready for highcharts histograms
 * @param {Array} array - an array with all the entries to be parsed to the
 * histogram
 * @returns {Array} [exportArray, categories] - two arrays that contain the
 * categories array for the X axis and the exportArray that contains the
 * counts each one of these categories.
 */
const arraytoHighcharts = (array) => {
  const report = {}
  const exportArray = []
  const categories = []
  // puts every unique entry in array into a unique key in object report
  array.forEach( (el) => {
    report[el] = report[el] + 1 || 1
  })
  for (const entry in report) {
    if ({}.hasOwnProperty.call(report, entry)) {
      exportArray.push({
        name: entry,
        y: report[entry]
      })
      categories.push(entry)
    }
  }
  // returns two arrays: exportArray with the data array and categories
  // array for x labels
  return [exportArray, categories]
}

/**
 * Function to highlight axis
 * @param {Object} that - axis object
 * @param {number} index - index of the axis to be highlighted
 * @param {String} color - color to be applied
 * @param {String} font - type of font to be applied (normal/bold)
 */
const axisHighlight = (that, index, color, font) => {
  const newAxis = {
    title: {
      style: {
        fontWeight: font,
        color,
      }
    }
  }

  that.chart.update({
    yAxis: (index === 1) ? [{}, newAxis] : [newAxis, {}],
    xAxis: (index === 1) ? [{}, newAxis] : [newAxis, {}]
  })
}

/**
 * Function to highlight scatter plot points that correspond to a given bar
 * in the histogram
 * @param {Object} el - histogram bar that was clicked
 */
const highLightScatter = (el) => {

  const cat = [el.x, el.x2]
  const points = el.series.chart.series[1].data

  // Exit if the scatter data series is absent
  if ( points.length === 0 ) {
    return
  }

  // Check if each point is within range and modify style attributes
  // accordingly
  let modifiedPoints = []
  for (const p of points) {
    if ( cat[0] <= p.y && p.y < cat[1] ) {
      modifiedPoints.push({x: p.x, y: p.y, marker: {fillColor: "#EF626C", radius: 5, lineColor: "#F9D6EB", lineWidth: 1}})
    } else {
      modifiedPoints.push({x: p.x, y:p.y, marker: {fillColor: "#000501", radius: 3, lineWidth: 0}})
    }
  }

  // Update scatter with modified points
  el.series.chart.series[1].update({
    data: modifiedPoints
  })

  // Highlight currently selected bar
  let modifiedBar = []
  for (const b of el.series.chart.series[0].data) {
    if (b.index === el.index) {
      modifiedBar.push({"color": "#4A6EAD"})
    } else {
      modifiedBar.push({"color": selector.length.color})
    }
  }
  el.series.chart.series[0].update({
    data: modifiedBar
  })
}

/**
 * Function to highlight histogram on scatter point click event
 * @param {Object} el - scatter plot point
 */
const highlightHist = (el) => {

  const yval = el.y
  const bars = el.series.chart.series[0].data
  const points = el.series.chart.series[1].data

  if ( bars.length === 0 ){
    return
  }

  let modifiedBars = []
  for (const b of bars){
    if (b.x <= yval && yval < b.x2) {
      modifiedBars.push({"color": "#4A6EAD"})
    } else {
      modifiedBars.push({"color": selector.length.color})
    }
  }
  el.series.chart.series[0].update({data: modifiedBars})

  let modifiedPoints = []
  for (const p of points) {
    if (p.index === el.index) {
      modifiedPoints.push({x: p.x, y: p.y, marker: {fillColor: "#EF626C", radius: 5, lineColor: "#F9D6EB", lineWidth: 1}})
    } else {
      modifiedPoints.push({x: p.x, y:p.y, marker: {fillColor: "#000501", radius: 3, lineWidth: 0}})
    }
  }
  el.series.chart.series[1].update({
    data: modifiedPoints
  })

}

/**
 * function to handle the reset of the highlights made to chart
 * @param {Object} ch - chart object that handles the Clear highlights button
 */
const resetHighlight = (ch) => {

  let points = ch.series[1].data
  let bars = ch.series[0].data

  let resetPoints = []
  let resetBars = []

  for (const p of points) {
    resetPoints.push({x: p.x, y:p.y, marker: {fillColor: "#000501", radius: 3}})
  }

  for (let i = 0; i < bars.length; i++) {
    resetBars.push({"color": selector.length.color})
  }

  ch.series[1].update({data: resetPoints})
  ch.series[0].update({data: resetBars})

}

/**
 * Function to highlight a single bar on click for bar plots. If bar color
 * is already red then it will put it back to default color. If bar is not
 * red then it will put it red to show the selected bars that can be further
 * applied to the plasmid network.
 * @param {Object} bar - the bar that was clicked
 * @param {String} resetColor - hex code of the color to reset nodes bars.
 * This depends on the plot that is being executed, thus having different
 * default values for each plot
 * @param {Object} objectHighlights - The object that stores the accession
 * numbers associated with a given file. When the bar is removed the
 * property of that bar will be removed from this object in this function
 * @param {Array} associativeObjArray - This contains the array for the
 * clicked bar that as the accession numbers that should be associated with
 * that bar element
 */
const highlightBar = (bar, resetColor, objectHighlights, associativeObjArray) => {
  if (bar.color !== "#930200") {
    bar.color = "#930200"
    objectHighlights[bar.name] = associativeObjArray

  } else {
    bar.color = resetColor
    delete objectHighlights[bar.name]
  }
  bar.update()
}

/**
 * Function to reset all bars for all bar plots
 * @param {Object} chartElement - the element of the chart that contains all
 * the bars info
 * @param {String} defaultColor - hex code of the color to reset nodes bars.
 * This depends on the plot that is being executed, thus having different
 * default values for each plot
 */
const resetAllBars = (chartElement, defaultColor) => {
  const bars = chartElement.series[0].data
  const resetBars = []
  for (let i = 0; i < bars.length; i++) {
  // for (const i in bars) {
    resetBars.push({"color": defaultColor})
  }

  chartElement.series[0].update({data: resetBars})
}

/**
 * Funtion to highlight selection on vivagraph on click event on button
 * after clicking on the desired bar
 * @param g - graph related functions that iterate through nodes
 * and links.
 * @param {Object} graphics - vivagraph functions related with node and link
 * data.
 * @param {Object} renderer - vivagraph object to render the graph.
 * @param {Object} objectHighlight - The object that contains the accession
 * numbers to be highlighted in vivagraph. This will collect an array for
 * each property in this object and execute colorNodes function that will
 * color nodes in green as used in area selection.
 */
const highlightVivagraph = (g, graphics, renderer, objectHighlight) => {
  // highlights nodes in vivagraph
  // uses the same color as areaSelection
  const currentColor = "0x" + "#fa5e00".replace("#", "")
  // resets nodes before making the requests and changing the
  // color again
  $("#reset-sliders").click()
  // iterates through values in object to reset all selected colors
  Object.values(objectHighlight).map( (arr) => {
    colorNodes(g, graphics, renderer, arr, currentColor)
  })
  // after close modal
  $("#modalPlot").modal("toggle")
  // this is necessary to allow for the plot to be reset again
  areaSelection = true
  previousTableList = []
  Object.keys(selector).map( (el) => { selector[el].state = false })
}

/**
 * Function that actually parse list to a plot and that actually renders the
 * plot
 * @param g - graph related functions that iterate through nodes
 * and links.
 * @param {Object} graphics - vivagraph functions related with node and link
 * data.
 * @param {Object} renderer - vivagraph object to render the graph.
 * @param {Array} accessionResultsList - an Empty array to be used within
 * the scope of file generation. This array is then stored for other functions
 * @param {Array} masterObj - The array of elements to be counted for the plots
 * @param {Object} layout - The default layout, common to all plots
 * available here
 * @param {String} taxaType - a string with the type of plot to be ploted
 * that will be used to generate the plot title
 * @param {boolean} sortAlp - variable that controls if array is to be
 * sorted alphabetically and therefore render the graph in the same manner
 * @param {boolean} sortVal - variable that controls if array is to be
 * sorted in descending order.
 * @param {Object} associativeObj - An object that makes an association
 * between x labels and their matching accession numbers
 */
const statsParser = (g, graphics, renderer, accessionResultsList, masterObj,
                     layout, taxaType, sortAlp, sortVal, associativeObj,
                     lengthResultsObj) => {

  $("#loadingImgPlots").hide()
  $("#alertPlot").hide()

  // controls progress bar div
  $("#progressDiv").hide()

  let objectHighlights = {}

  // parse the final array
  // here it assures that sorts are made just once
  const finalArray = (sortAlp === true) ? masterObj.sort() :
    (sortVal === true) ? arraytByValue(masterObj) : masterObj

  const doubleArray = arraytoHighcharts(finalArray)

  // categories have to be added to the xAxis labels
  if (taxaType !== "length") {

    layout.xAxis = {categories: doubleArray[1]}

    // then add the series to the graph itself
    layout.series = [{
      type: "column",
      data: doubleArray[0],
      name: "No. of plasmids",
      cursor: "pointer",
      showInLegend: false,
      color: selector[taxaType.replace(" ", "")].color,
      point: {
        events: {
          click() {
            highlightBar(this, selector[taxaType.replace(" ", "")].color,
              objectHighlights, associativeObj[this.name])
          }
        }
      }
    }]

    // adds button to highlight nodes on vivagraph
    layout.exporting = {
      buttons: {
        highlight: {
          text: "Highlight on plasmid network",
          onclick() {
            highlightVivagraph(g, graphics, renderer, objectHighlights)
          },
          buttonSpacing: 8,
          theme: {
            stroke: "#313131"
          }
        },
        clearHighlight: {
          text: "Clear highlights",
          onclick() {
            resetAllBars(this, selector[taxaType.replace(" ", "")].color)
          },
          // all highlighted bars
          buttonSpacing: 8,
          theme: {
            stroke: "#313131"
          }
        }
      },
      filename: `pATLAS_plot_${taxaType}`
    }

    // this options allows column plots to show more than 10k plasmids
    layout.plotOptions = {
      column: {
        turboThreshold: 0
      }
    }

  } else {

    /**
     * Variable that converts all the values an object to floats and then sorts
     * them in ascending order.
     * @type {Array}
     */
    const histoArray = Object.values(lengthResultsObj).map( (e) => { return parseFloat(e) })
      .sort( (a, b) => {
        return a - b
      })

    /**
     * Variable that sorts the accession numbers by the order of the values.
     * It sorts the keys according with an increase order of values (which are
     * floats)
     * @type {Array}
     */
    const accessionArray = Object.keys(lengthResultsObj).sort( (a,b) => {
      return lengthResultsObj[a]-lengthResultsObj[b]
    })

    // returns true if all elements have the same size and thus make only a
    // scatter
    const allEqual = (histoArray) => histoArray.every( (v) => v === histoArray[0] )

    // some defaults comment to both graphs instances, when there are
    // several bins or just one

    const defaultXAxis = {
      labels: {enabled: false},
      categories: accessionArray,
      title: {text: null},
      opposite: true
    }

    const defaultYAxis = {
      title: {text: "Sequence size (scatter)"},
      opposite: true
    }

    const defaultSeries = {
      name: "Individual plasmids",
      type: "scatter",
      data: histoArray,
      color: "#000501",
      cursor: "pointer",
      marker: {
        radius: 3
      },
      events: {
        mouseOver() {
          axisHighlight(this, 0, "black", "bold")
        },
        mouseOut() {
          axisHighlight(this, 0, "#666666", "normal")
        },
      },
      point: {
        events: {
          click() {
            clickedHighchart = this.category
            $("#submitButton").click()
            highlightHist(this)
          }
        }
      }
    }

    layout.exporting = {
      buttons: {
        clearHighlight: {
          text: "Clear highlights",
          onclick() { resetHighlight(this) },
          buttonSpacing: 8,
          theme: {
            stroke: "#313131"
          }
        }
      },
      filename: `pATLAS_plot_${taxaType}`
    }

    // checks if all lengths in array are the same and if so... do not
    // do histogram
    if (allEqual(histoArray) === false) {
      layout.xAxis = [defaultXAxis, {
        title: {text: "Sequence size (histogram)"},
        // opposite: true
      }]
      layout.yAxis = [defaultYAxis, {
        title: {text: "Number of plasmids (histogram)"},
        // opposite: true
      }]
      // tooltip that enables different tooltips on each series
      // series.name is here used to return different tooltips for each
      layout.tooltip = {
        formatter() {
          if (this.series.name === "Individual plasmids") {
            return "<b>Accession no.: </b>" +
              this.x + "<br><b>Size (bp): </b>" + this.y
          } else {
            return "<b>No. of plasmids: </b>" + this.y + "<br><b>Range: </b>" +
              Math.floor(this.x + 1) + " - " + Math.floor(this.point.x2)
          }
        }
      }
      layout.series = [{
        type: "histogram",
        name: "Distribution by length",
        xAxis: 1,
        yAxis: 1,
        baseSeries: 1,
        color: selector[taxaType.replace(" ", "")].color,
        zIndex: -1,
        cursor: "pointer",
        events: {
          mouseOver() {
            axisHighlight(this, 1, "black", "bold")
          },
          mouseOut() {
            axisHighlight(this, 1, "#666666", "normal")
          }
        },
        point: {
          events: {
            click() {
              // highlights the scatter on bar click
              highLightScatter(this)
            }
          }
        }
      }, defaultSeries]
    } else {
      // instance for one bin only... no histogram will be shown
      $("#alertPlot").show()
      layout.xAxis = defaultXAxis
      layout.yAxis = defaultYAxis
      layout.tooltip = {
        formatter() {
          if (this.series.name === "Individual plasmids") {
            return "<b>Accession no.: </b>" +
              this.x + "<br><b>Size (bp): </b>" + this.y
          }
        }
      }
      layout.series = [defaultSeries]
    }
  }
  // Highcharts.chart(selector[taxaType.replace(" ", "").div], layout)
  Highcharts.chart(selector[taxaType.replace(" ", "")].div, layout)
  $(`#${selector[taxaType.replace(" ", "")].div}`).show()
  // state is set to true telling that the a graph is already present in
  // this container
  selector[taxaType.replace(" ", "")].state = true

  // stores listPlots so that it can be used by sort buttons
  selector[taxaType.replace(" ", "")]["listPlots"] = masterObj
}

/**
 * Function that forces all containers to hide before rendering the new
 * plot, avoiding that multiple plots are shown in the modalPlot
 */
const hideAllOtherPlots = () => {
  // first force every contained that is true to be removed from the modal
  Object.keys(selector).map( (el) => {
    $(`#${selector[el].div}`).hide()
  })
}

/**
 * Function to show a loading screen while the graph is being prepared
 */
const resetProgressBar = () => {
  // resets progressBar
  // first force every contained that is true to be removed from the modal
  hideAllOtherPlots()
  $("#progressDiv").show()
  // $(`#${chartDivId}`).hide()
}

// function to make layout
/**
 * Function to make a default layout that can be used to every plot made by
 * stats module
 * @param {String} taxaType - a string with the type of plot to be plotted
 * that will be used to generate the plot title
 * @returns {{chart: {zoomType: string, panKey: string, panning: boolean}, title: {text: string}, yAxis: {title: {text: string}}, exporting: {sourceWidth: number}}}
 */
const layoutGet = (taxaType) => {
  // this taxaType remains in this scope
  if (taxaType === "plasmidfamilies") { taxaType = "plasmid families" }

  return {
    chart: {
      zoomType: "x",
      panKey: "ctrl",   //key used to navigate the graph when zoomed
      panning: true     // allow panning of the graph when zoomed
    },
    title: {
      text: `${taxaType} plot`
    },
    yAxis: {
      title: {
        text: "Number of selected plasmids"
      }
    },
    exporting: {
      sourceWidth: 1000
    },
    credits: {
      enabled: false
    }
  }
}
/**
 * A function to create an object which associates plot x labels with
 * accession numbers
 * @param {Object} obj - the object to make the association between the
 * x labels and the accession numbers.
 * @param {String} queryAccession - the accession number being queried
 * @param {String} tagName - the taxa or genes to be the key of the object
 */
const associativeObjAssigner = (obj, queryAccession, tagName) => {
  // checks if property already exists and if query accession is already in
  // the array of that property
  if (obj.hasOwnProperty(tagName) && obj[tagName].indexOf(queryAccession) < 0) {
    obj[tagName].push(queryAccession)
  } else {
    // if property doesn't exist inject property and start array with that
    // accession
    obj[tagName] = [queryAccession]
  }
}

/**
 * This function is similar to getMetadata but uses 'database' psql table to
 * retrieve plasmid finder associated genes
 * @param g - graph related functions that iterate through nodes
 * and links.
 * @param {Object} graphics - vivagraph functions related with node and link
 * data.
 * @param {Object} renderer - vivagraph object to render the graph.
 * @param {Array} tempList - The array of accession numbers to be queried
 * @param {String} taxaType - A string that are defined on button click and
 * that defines which parsing is needed to plot
 * @param {boolean} sortAlp - variable that controls if array is to be
 * sorted alphabetically and therefore render the graph in the same manner
 * @param {boolean} sortVal - variable that controls if array is to be
 * sorted in descending order.
 * @returns {Array} virList - an array which contain the retrieved
 * values from the psql table for each of the queried accession number given
 * a taxaType.
 */
const getMetadataPF = (g, graphics, renderer, tempList, taxaType, sortAlp, sortVal) => {
  // resets progressBar
  resetProgressBar()
  let PFList = []

  $.post("api/getplasmidfinder/", { "accession": JSON.stringify(tempList) })
    .then( (results) => {
      results.map( (data) => {
        const pfName = (data.json_entry.gene === null) ?
          "unknown" : data.json_entry.gene.replace(/['u\[\] ]/g, "").split(",")
        //then if unknown can push directly to array
        if (pfName === "unknown") {
          PFList.push(pfName)
        } else {
          // otherwise needs to parse the array into an array
          for (const i in pfName) {
            if ({}.hasOwnProperty.call(pfName, i)) {
              PFList.push(pfName[i])
              associativeObjAssigner(associativeObj, data.plasmid_id, pfName[i])
              // counter += 1
            }
          }
        }

      })
      // show info on the nodes that are shown

      selector[taxaType].alertString = `Displaying results for ${results.length} of ${tempList.length} 
        (${((results.length/tempList.length) * 100).toFixed(1)}%) selected 
        plasmids. The remaining ${tempList.length - results.length} are unknown.`
      $("#spanEntries").html(selector[taxaType].alertString)
      $("#alertPlotEntries").show()

      const layout = layoutGet(taxaType)
      statsParser(g, graphics, renderer, false, PFList, layout, taxaType, sortAlp, sortVal, associativeObj)
    })
  return PFList
}

/**
 * This function is similar to getMetadata but uses 'card' psql table to
 * retrieve card and resfinder associated genes
 * @param g - graph related functions that iterate through nodes
 * and links.
 * @param {Object} graphics - vivagraph functions related with node and link
 * data.
 * @param {Object} renderer - vivagraph object to render the graph.
 * @param {Array} tempList - The array of accession numbers to be queried
 * @param {String} taxaType - A string that are defined on button click and
 * that defines which parsing is needed to plot
 * @param {boolean} sortAlp - variable that controls if array is to be
 * sorted alphabetically and therefore render the graph in the same manner
 * @param {boolean} sortVal - variable that controls if array is to be
 * sorted in descending order.
 * @returns {Array} resList - an array which contain the retrieved
 * values from the psql table for each of the queried accession number given
 * a taxaType.
 */
const getMetadataRes = (g, graphics, renderer, tempList, taxaType, sortAlp, sortVal) => {
  // TODO this should plot resfinder and card seperately
  // resets progressBar
  resetProgressBar()

  let resList = []
  $.post("api/getresistances/", { "accession": JSON.stringify(tempList) })
    .then( (results) => {
      results.map( (data) => {
        const pfName = (data.json_entry.gene === null) ?
          "unknown" : data.json_entry.gene.replace(/['u\[\] ]/g, "").split(",")
        //then if unknown can push directly to array
        if (pfName === "unknown") {
          resList.push(pfName)
        } else {
          // otherwise needs to parse the array into an array
          for (const i in pfName) {
            if ({}.hasOwnProperty.call(pfName, i)) {
              resList.push(pfName[i])
              associativeObjAssigner(associativeObj, data.plasmid_id, pfName[i])
            }
          }
        }
      })

      // show info on the nodes that are shown
      // TODO put this in a function that checks for 0 and 1 and corrects the sentence
      selector[taxaType].alertString = `Displaying results for ${results.length} of ${tempList.length} 
        (${((results.length/tempList.length) * 100).toFixed(1)}%) selected 
        plasmids. The remaining ${tempList.length - results.length} are unknown.`

      $("#spanEntries").html(selector[taxaType].alertString)
      $("#alertPlotEntries").show()

      const layout = layoutGet(taxaType)
      statsParser(g, graphics, renderer, false, resList, layout, taxaType, sortAlp, sortVal, associativeObj)
    })
  return resList
}

/**
 * This function is similar to getMetadata but uses 'positive' psql table to
 * retrieve virulence associated genes
 * @param g - graph related functions that iterate through nodes
 * and links.
 * @param {Object} graphics - vivagraph functions related with node and link
 * data.
 * @param {Object} renderer - vivagraph object to render the graph.
 * @param {Array} tempList - The array of accession numbers to be queried
 * @param {String} taxaType - A string that are defined on button click and
 * that defines which parsing is needed to plot
 * @param {boolean} sortAlp - variable that controls if array is to be
 * sorted alphabetically and therefore render the graph in the same manner
 * @param {boolean} sortVal - variable that controls if array is to be
 * sorted in descending order.
 * @returns {Array} virList - an array which contain the retrieved
 * values from the psql table for each of the queried accession number given
 * a taxaType.
 */
const getMetadataVir = (g, graphics, renderer, tempList, taxaType, sortAlp, sortVal) => {
  // resets progressBar
  resetProgressBar()
  // let associativeObj = {}

  let virList = []
  $.post("api/getvirulence/", { "accession": JSON.stringify(tempList) })
  // when all promises are gathered
    .then( (results) => {
      results.map( (data) => {
        const virName = (data.json_entry.gene === null) ?
          "unknown" : data.json_entry.gene.replace(/['u\[\] ]/g, "").split(",")
        //then if unknown can push directly to array
        if (virName === "unknown") {
          virList.push(virName)
        } else {
          // otherwise needs to parse the array into an array
          for (const i in virName) {
            if ({}.hasOwnProperty.call(virName, i)) {
              virList.push(virName[i])
              associativeObjAssigner(associativeObj, data.plasmid_id, virName[i])
            }
          }
        }

      })

      // show info on the nodes that are shown
      selector[taxaType].alertString = `Displaying results for ${results.length} of ${tempList.length} 
        (${((results.length/tempList.length) * 100).toFixed(1)}%) selected 
        plasmids. The remaining ${tempList.length - results.length} are unknown.`

      $("#spanEntries").html(selector[taxaType].alertString)
      $("#alertPlotEntries").show()

      // checks whether virList is empty meaning that there are no virulence
      // genes for this selection
      const layout = layoutGet(taxaType)
      statsParser(g, graphics, renderer, false, virList, layout, taxaType, sortAlp, sortVal, associativeObj)
    })

  return virList
}

/**
 * Case switch function for getMetadata for plots, instead of a combo else
 * if statement
 * @param {String} taxaType - The type of plot to be generated
 * @param {Object} result - The return object from a single query
 * @returns {String|number} - returns a string or a integer that is used to
 * construct the arrays for plots.
 */
const plotSwitcher = (taxaType, result) => ({
  "species": (result.json_entry.name === null) ? "unknown" : result.json_entry.name.split("_").join(" "),
  "genera": (result.json_entry.taxa === "unknown") ? "unknown" : result.json_entry.taxa.split(",")[0].replace(/['[]/g, ""),
  "families": (result.json_entry.taxa === "unknown") ? "unknown" : result.json_entry.taxa.split(",")[1].replace(/[']/g, ""),
  "orders": (result.json_entry.taxa === "unknown") ? "unknown" : result.json_entry.taxa.split(",")[2].replace(/['\]]/g, ""),
  "clusters": (result.json_entry.cluster === null) ? "singleton" : result.json_entry.cluster,
  "length": (result.json_entry.length === null) ? "unknown" : result.json_entry.length
})[taxaType]

/**
 * Function to query the database, starting with a list of accession
 * numbers. this queries the plasmids psql table and retrieves everything
 * that is associated with taxa and length.
 * @param g - graph related functions that iterate through nodes
 * and links.
 * @param {Object} graphics - vivagraph functions related with node and link
 * data.
 * @param {Object} renderer - vivagraph object to render the graph.
 * @param {Array} tempList - The array of accession numbers to be queried
 * @param {String} taxaType - A string that are defined on button click and
 * that defines which parsing is needed to plot
 * @param {boolean} sortAlp - variable that controls if array is to be
 * sorted alphabetically and therefore render the graph in the same manner
 * @param {boolean} sortVal - variable that controls if array is to be
 * sorted in descending order.
 * @returns {Array} speciesList - an array which contain the retrieved
 * values from the psql table for each of the queried accession number given
 * a taxaType.
 */
const getMetadata = (g, graphics, renderer, tempList, taxaType, sortAlp, sortVal) => {

  // resets progressBar
  resetProgressBar()
  let speciesList = []

  $.post("api/getspecies/", { "accession": JSON.stringify(tempList) })
    .then( (results) => {
      const accessionResultsList = []
      let lengthResultsObj = {}
      results.map( (result) => {
        // checks if plasmid is present in db
        if (result.plasmid_id !== null) {

          const speciesName = plotSwitcher(taxaType, result)
          speciesList.push(speciesName)
          accessionResultsList.push(result.plasmid_id)
          lengthResultsObj[result.plasmid_id] = result.json_entry.length
          associativeObjAssigner(associativeObj, result.plasmid_id, speciesName)

        }
      })

      // show info on the nodes that are shown
      selector[taxaType].alertString = `Displaying results for ${results.length} of ${tempList.length} 
        (${((results.length/tempList.length) * 100).toFixed(1)}%) selected 
        plasmids. The remaining ${tempList.length - results.length} are unknown.`

      $("#spanEntries").html(selector[taxaType].alertString)
      $("#alertPlotEntries").show()

      const layout = layoutGet(taxaType)

      statsParser(g, graphics, renderer, accessionResultsList, speciesList,
        layout, taxaType, sortAlp, sortVal, associativeObj, lengthResultsObj)
    })
    // .catch( (error) => {
    //   console.log("Error: ", error)
    // })
  return speciesList // this is returned async but there is no problem
}

/**
 * Function that searches for area selection highlighted nodes
 * @param g - graph related functions that iterate through nodes
 * and links.
 * @param {Object} graphics - vivagraph functions related with node and link
 * data.
 * @param {Object} renderer - vivagraph object to render the graph.
 * @param {String} mode - this variable sets the kind of stats to be queried
 * @param {boolean} sortAlp - variable that controls if array is to be
 * sorted alphabetically and therefore render the graph in the same manner
 * @param {boolean} sortVal - variable that controls if array is to be
 * sorted in descending order.
 * @returns {Array} - returns an array similar to listGiFilter that will be
 * used to construct the plot array
 */
const statsColor = (g, graphics, renderer, mode, sortAlp, sortVal) => {
  let tempListAccessions = []

  g.forEachNode( (node) => {
    const currentNodeUI = graphics.getNodeUI(node.id)
    if (currentNodeUI.color === "0x" + "#fa5e00".replace("#", "")) {
      tempListAccessions.push(node.id)
    }
  })
  // function to get the data from the accessions on the list
  return (mode === "plasmidfamilies") ? getMetadataPF(g, graphics, renderer, tempListAccessions, mode, sortAlp, sortVal) :
    (mode === "resistances") ? getMetadataRes(g, graphics, renderer, tempListAccessions, mode, sortAlp, sortVal) :
      (mode === "virulence") ? getMetadataVir(g, graphics, renderer, tempListAccessions, mode, sortAlp, sortVal) :
        getMetadata(g, graphics, renderer, tempListAccessions, mode, sortAlp, sortVal)
}

/**
 * Function that is used in several buttons that trigger the graph,
 * particularly for taxa and length associated plots
 * @param g - graph related functions that iterate through nodes
 * and links.
 * @param {Object} graphics - vivagraph functions related with node and link
 * data.
 * @param {Object} renderer - vivagraph object to render the graph.
 * @param {boolean} areaSelection
 * @param {Array} listGiFilter - The current list of accession numbers to be
 * filtered or in this case used to construt the plot
 * @param {String} clickerButton - the mode that will be executed. This
 * controls the type of plot to be made.
 * @param g - graph related functions that iterate through nodes
 * and links.
 * @param graphics - vivagraph functions related with node and link
 * data.
 * @returns {Array} - returns the list of plasmid to be plotted (accession
 * numbers at this strage)
 */
const repetitivePlotFunction = (g, graphics, renderer, areaSelection, listGiFilter, clickerButton) => {

  $("#loadingImgPlots").show()
  if (arraysEqual(listGiFilter, previousTableList) === false && selector[clickerButton].state === false
    || selector[clickerButton].state === false && arraysEqual(listGiFilter, previousTableList) === true) {
    // previousTableList = listGiFilter
    return (areaSelection === true) ? statsColor(g, graphics, renderer, clickerButton, false, false) :
      (clickerButton === "plasmidfamilies") ? getMetadataPF(g, graphics, renderer, listGiFilter, clickerButton, false, false) :
        (clickerButton === "resistances") ? getMetadataRes(g, graphics, renderer, listGiFilter, clickerButton, false, false) :
          (clickerButton === "virulence") ? getMetadataVir(g, graphics, renderer, listGiFilter, clickerButton, false, false) :
            getMetadata(g, graphics, renderer, listGiFilter, clickerButton, false, false)
  } else {
    // this code prevents plot from being queried again, since it is already
    // stored in a div it is just a matter of hidding all other and showing
    // this one
    hideAllOtherPlots()
    $(`#${selector[clickerButton.replace(" ", "")].div}`).show()
    $("#spanEntries").html(selector[clickerButton.replace(" ", "")].alertString)
    $("#alertPlotEntries").show()
    return
  }
}
