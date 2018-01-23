/*globals Viva, recenterDOM, resetAllNodes, storeRecenterDom,
 buildCircleNodeShader, requestPlasmidTable, WebglCircle, selector,
  hideAllOtherPlots, toggleManager, repetitivePlotFunction,
   resRepetitivePlotFunction, pfRepetitivePlotFunction,
    virRepetitivePlotFunction, statsParser, nodeColorReset,
     resetDisplayTaxaBox, showDiv, pfSubmitFunction, layoutGet,
      centerToggleQuery, toggleOnSearch, singleDropdownPopulate,
       filterDisplayer, slider, resSubmitFunction, virSubmitFunction,
        defaultZooming, removeFirstCharFromArray, colorList, resetLinkColor,
         readColoring, assembly, handleFileSelect, downloadSeqByColor,
          downloadSeq, setupPopupDisplay, multiDownload, heatmapMaker,
           colorNodes, abortRead, makeTable, arrayToCsv, resGetter,
            plasmidFamilyGetter, virulenceGetter, linkColoring,
             slideToRight, slideToLeft, Mousetrap, initCallback,
              taxaRequest, pushToMasterReadArray, getArrayMapping,
               getArrayMash, colorLegendFunction, noUiSlider, actualRemoval,
                getArrayAssembly, startMultiSelect, requesterDB*/

/**
* A bunch of global functions to be used throughout patlas
*/

// if this is a developer session please enable the below line of code
const devel = false

// boolean that controls the prerender function if rerun
// is activated
let rerun = false

// helps set menu to close status
let firstClickMenu = true

// checks if vivagraph should load first initial dataset or the filters
let firstInstace = true
// variable to check if page was reloaded
let pageReload = false
// variable to check if page was rerun for pffamilies and resistance
// filtering to work properly
let pageReRun = false

// starts a global instance for checking if button was clicked before
let clickedPopupButtonRes = false
let clickedPopupButtonCard = false
let clickedPopupButtonFamily = false
let clickedPopupButtonVir = false

// variable to control stats displayer
let areaSelection = false
// variable to freeze shift
let freezeShift = true

const getArray = (devel === true) ? $.getJSON("/test") : $.getJSON("/fullDS")
// an array to store bootstrap table related list for downloads and coloring
// nodes on submit
let bootstrapTableList = []
// dictionary to store all the connections between species and other taxa
// level available. This needs to be stored here because there is no reason
// to execute the getArrayTaxa twice.
const dictGenera = {}
// buttonSubmit current node
let currentQueryNode = false

let masterReadArray = []

let readFilejson = false
let mashJson = false
let assemblyJson = false

let readIndex = -1

let clickedHighchart

let graphSize

let toggleRatioStatus = false

let totalNumberOfLinks

let multiSelectOverlayObj

let legendInst

// object that lets collect plot data and that enable to click on bars and
// retrieve selected nodes in vivagraph
let associativeObj = {}

// globals to control plot instances
let clickerButton, listPlots

let requestDBList

/**
 * load JSON file with taxa dictionary
 * @returns {Object} - return is an object that perform matches between taxa
 * levels species, genera, families and orders.
 */
const getArrayTaxa = () => {
  return $.getJSON("/taxa")
}

/**
 * load JSON file with resistance dictionary
 * @returns {Object} - returns an object that allows resistance menus to be
 * populated
 */
const getArrayRes = () => {
  return $.getJSON("/resistance")
}

/**
 * load JSON file with plasmidfinder dictionary
 * @returns {Object} - returns an object that allows plasmidfinder menus
 * to be populated
 */
const getArrayPf = () => {
  return $.getJSON("/plasmidfinder")
}

/**
 * load JSON file with virulence dictionary
 * @returns {Object} - returns an object that allows virulence menus
 * to be populated
 */
const getArrayVir = () => {
  return $.getJSON("/virulence")
}

// list used to store for re-run button (apply filters)
let listGiFilter = []
let reloadAccessionList = []

// variable to store previous list of accessions that iterate through table
// is the same or not
let previousTableList = []

let sliderMinMax = [] // initiates an array for min and max slider entries
// and stores it for reloading instances of onload()
let listGi = []
// define render on the scope of onload in order to be used by buttons
// outside renderGraph
let renderer

// buttons that are able to hide
let showRerun = document.getElementById("Re_run"),
  showGoback = document.getElementById("go_back"),
  showDownload = document.getElementById("download_ds"),
  showLegend = document.getElementById("colorLegend"),
  showTable = document.getElementById("tableShow"),
  heatMap = document.getElementById("heatmapButtonTab"),
  plotButton = document.getElementById("plotButton")


// variable used to control if div is shown or not
let multiSelectOverlay = false
// store the node with more links
let storeMasterNode = []    //cleared every instance of onload
// start array that controls taxa filters
const idsArrays = ["p_Order", "p_Family", "p_Genus", "p_Species"]

let counter = -1 //sets a counter for the loop between the inputs nodes
// Sets parameters to be passed to WebglCircle in order to change
// node shape, setting color and size.
const nodeColor = 0x666370 // hex rrggbb
const minNodeSize = 4 // a value that assures that the node is
// displayed without increasing the size of big nodes too much

let list = []   // list to store references already ploted as nodes
// links between accession numbers
let listLengths = [] // list to store the lengths of all nodes

// bunch of variables that are required for vivagraph
// initiate vivagraph instance
const g = Viva.Graph.graph()

// initiate the layout
const layout = Viva.Graph.Layout.forceDirected(g, {
  springLength: 100,
  springCoeff: 0.0001,
  dragCoeff: 0.001, // sets how fast nodes will separate from origin,
  // the higher the value the slower
  gravity: -10,
  theta: 1,
  // This is the main part of this example. We are telling force directed
  // layout, that we want to change length of each physical spring
  // by overriding `springTransform` method:
  springTransform(link, spring) {
    spring.length = 100 * Math.log10(1 - link.data.distance) + 100
  }
})

// initiates webgl graphics
const graphics = Viva.Graph.View.webglGraphics()

/**
 * Function to initiate the loading of the initial file or the actual
 * rendering of vivagraph instance
 */
const init = () => {
  if (firstInstace === true) {
    // the next if statement is only executed on development session, it
    // is way less efficient than the non development session.
    if (devel === true) {
      getArray.done(function (json) {
        $.each(json, function (sequenceInfo, dictDist) {
          counter++
          // next we need to retrieve each information type independently
          const sequence = sequenceInfo.split("_").slice(0, 3).join("_")

          // and continues
          const seqLength = sequenceInfo.split("_").slice(-1).join("")
          const logLength = Math.log(parseInt(seqLength)) //ln seq length
          listLengths.push(seqLength) // appends all lengths to this list
          listGi.push(sequence)
          //checks if sequence is not in list to prevent adding multiple nodes for each sequence
          if (list.indexOf(sequence) < 0) {
            g.addNode(sequence, {
              sequence: "<span style='color:#468499'>Accession:" +
              " </span><a" +
              " href='https://www.ncbi.nlm.nih.gov/nuccore/" + sequence.split("_").slice(0, 2).join("_") + "' target='_blank'>" + sequence + "</a>",
              //species:"<font color='#468499'>Species:
              // </font>" + species,
              seqLength: "<span" +
              " style='color:#468499'>Sequence length:" +
              " </span>" + seqLength,
              logLength
            })
            list.push(sequence)

            if (dictDist !== null) {
              // loops between all arrays of array pairing sequence and distances
              for (let i = 0; i < dictDist.length; i++) {
                const reference = Object.keys(dictDist[i])[0]  // stores
                // references in a unique variable
                const distance = Object.values(dictDist[i])[0].distance   // stores distances in a unique variable
                g.addLink(sequence, reference, { distance })
              }
            } else {
              dictDist = []
            }
          }
          // centers on node with more links
          storeMasterNode = storeRecenterDom(storeMasterNode, dictDist, sequence, counter)
        })
        // precompute before rendering
        renderGraph(graphics)
      }) //new getArray end
    } else {
      // this renders the graph when not in development session
      // this is a more efficient implementation which takes a different
      // file for loading the graph.
      getArray.done(function (json) {
        graphSize = json.nodes.length
        const addAllNodes = (json) => {
          return new Promise((resolve, reject) => {
            for (const i in json) {
              if (json.hasOwnProperty(i)) {
                const array = json[i]
                counter++
                const sequence = array.id
                const seqLength = array.length
                const logLength = Math.log(parseInt(seqLength))
                listLengths.push(seqLength)
                listGi.push(sequence)

                if (list.indexOf(sequence) < 0) {
                  g.addNode(sequence, {
                    sequence: "<span style='color:#468499'>Accession:" +
                    " </span><a" +
                    " href='https://www.ncbi.nlm.nih.gov/nuccore/" + sequence.split("_").slice(0, 2).join("_") + "' target='_blank'>" + sequence + "</a>",
                    seqLength: "<span" +
                    " style='color:#468499'>Sequence length:" +
                    " </span>" + seqLength,
                    logLength
                  })
                  list.push(sequence)
                  layout.setNodePosition(sequence, array.position.x, array.position.y)
                } else {
                  reject(`node wasn't added: ${sequence}`)
                }
                if (i + 1 === json.length) {
                  resolve("sucessfully added all nodes")
                }
              }
            }
          })
        }

        const addAllLinks = (json) => {
          totalNumberOfLinks = json.length
          return new Promise( (resolve, reject) => {
            for (const i in json) {
              if (json.hasOwnProperty(i)) {
                const array = json[i]
                const sequence = array.parentId   // stores sequences
                const reference = array.childId  // stores references
                const distNSizes = array.distNSizes   // stores distances
                // and sizeRatios
                if (reference !== "") {
                  // here it adds only unique links because filtered.json file
                  // just stores unique links
                  g.addLink(sequence, reference, distNSizes)
                } else {
                  // if there is no reference associated with sequence then
                  // there are no links
                  reject(new Error(`link wasn't added: ${array.childId} -> ${sequence}`))
                }
                if (i + 1 === json.lenght) {
                  resolve("sucessefully added all links")
                }
              }
            }
          })
        }
        addAllNodes(json.nodes)
          .then(addAllLinks(json.links))
          .then(renderGraph(graphics))
      })
    }
  } else {
    // storeMasterNode is empty in here
    if (readFilejson !== false) {
      const readReload = JSON.parse(Object.values(readFilejson)[readIndex])
      $("#fileNameDiv").html(Object.keys(readFilejson)[readIndex])
        .show()
      requestDBList = requesterDB(g, listGiFilter, counter, renderGraph,
        graphics, reloadAccessionList, renderer, listGi, readReload,
        assemblyJson)
    } else {
      // sets pageReRun to true
      pageReRun = true
      $("#fileNameDiv").html(Object.keys(assemblyJson)[readIndex])
        .show()
      // used when no reads are used to filter
      requestDBList = requesterDB(g, listGiFilter, counter, renderGraph,
        graphics, reloadAccessionList, renderer, listGi, false,
        assemblyJson)
    }
    listGiFilter = requestDBList[0] // list with the nodes used to filter
    reloadAccessionList = requestDBList[1] //list stores all nodes present
    // this listGi isn't the same as the initial but has information on
    // all the nodes that were used in filters
    // wait a while before showing the colors
    setTimeout( () => {
      renderer.rerender()
    }, 100)
  }
}

/**
 * forces welcomeModal to be the first thing the user sees when the page
 * is loaded.
 * @param {function} callback - uses onLoad function as callback in order to
 * allow for welcomeModal to be displayer before rendering everything else with
 * a delay of 1 sec.
 */
const onLoadWelcome = (callback) => {
  // forces welcomeModal to be the first thing the user sees when the page
  // is loaded
  $("#welcomeModal").modal("show")
  //then onLoad is run as a callback
  // for modal to show before page potential page freeze I made it wait half
  // a second before starting the load
  setTimeout( () => {
    callback()
  }, 1000)
}

/**
 * initiates vivagraph main functions
 * onLoad consists of mainly three functions: init, precompute and renderGraph
 * This function is executed after onLoadWelcome function
 */
const onLoad = () => {

  //* ***********************************************//
  // control the infile input and related functions //
  //* ***********************************************//

  handleFileSelect("infile", "#file_text", (newReadJson) => {
    readFilejson = newReadJson
    // $("#infile").val("")
  })

  handleFileSelect("mashInfile", "#file_text_mash", function (newMashJson) {
    mashJson = newMashJson
    // $("#mashInfile").val("")
  })

  handleFileSelect("assemblyfile", "#assembly_text", function (newAssemblyJson) {
    assemblyJson = newAssemblyJson
    // $("#assemblyfile").val("")
  })

  //* ****************************** *//
  //      Menu Button controls       //
  //* ****************************** *//

  $("#menu-toggle").on("click", function() {
    if (firstClickMenu === true) {
      $("#menu-toggle").css( {"color": "#fff"} )
      firstClickMenu = false
    } else {
      $("#menu-toggle").css( {"color": "#999999"} )
      firstClickMenu = true
    }
  })

  // download button //
  $("#download_ds").unbind("click").bind("click", () => {
    // for now this is just taking what have been changed by taxa coloring
    if (areaSelection === true) {
      // downloads if area selection is triggered
      downloadSeqByColor(g, graphics)
    } else {
      // downloads when listGiFilter is defined, namely in taxa filters,
      // mapping results
      downloadSeq(listGiFilter, g)
    }
  })

  //*********//
  //* TABLE *//
  //*********//
  // function to add accession to bootstrapTableList in order to use in
  // downloadTable function or in submitTable button
  $("#metadataTable").on("check.bs.table", (e, row) => {
    if (bootstrapTableList.indexOf(row.id) < 0) {
      bootstrapTableList.push(row.id)
    }
  })
  // function to remove accession from bootstrapTableList in order to use in
  // downloadTable function or in submitTable button
    .on("uncheck.bs.table", (e, row) => {
      for (const value in bootstrapTableList) {
        if (bootstrapTableList[value] === row.id) {
          bootstrapTableList.splice(value, 1)
        }
      }
    })
    // function to handle when all are selected
    .on("check-all.bs.table", (e, rows) => {
      for (const row of rows) {
        if (bootstrapTableList.indexOf(row) < 0) {
          bootstrapTableList.push(row.id)
        }
      }
    })
    // function to remove when all are selected
    .on("uncheck-all.bs.table", () => {
      bootstrapTableList = []
    })

  // function to control cell click
    .on("dbl-click-cell.bs.table", (field, value, row, element) => {
      recenterDOM(renderer, layout, [element.id, false])
      requestPlasmidTable(g.getNode(element.id), setupPopupDisplay)
      currentQueryNode = element.id
    })

  // function to download dataset selected in table
  $("#downloadTable").unbind("click").bind("click", () => {
    // transform internal accession numbers to ncbi acceptable accesions
    const acc = bootstrapTableList.map((uniqueAcc) => {
      return uniqueAcc.split("_").splice(0,2).join("_")
    })
    multiDownload(acc, "nuccore", "fasta")
  })

  // function to display heatmap dataset selected in table
  $("#heatmapButtonTab").unbind("click").bind("click", () => {
    $("#heatmapModal").modal()
    // transform internal accession numbers to ncbi acceptable accesions
    if (readFilejson !== false) {
      heatmapMaker(masterReadArray, readFilejson)
      mashJson = false
      assemblyJson = false
    } else if (assemblyJson !== false) {
      heatmapMaker(masterReadArray, assemblyJson)
      readFilejson = false
      mashJson = false
    }
  })
  // button to color selected nodes by check boxes
  $("#tableSubmit").unbind("click").bind("click", () => {
    $("#reset-sliders").click()
    $("#colorLegend").hide()
    // if bootstraTableList contains only one accession then showPopup
    if (bootstrapTableList.length === 1) {
      recenterDOM(renderer, layout, [bootstrapTableList[0], false])
      requestPlasmidTable(g.getNode(bootstrapTableList[0]), setupPopupDisplay)
    }
    showDiv().then( () => {
      colorNodes(g, graphics, renderer, bootstrapTableList, "0xFF7000")

      // handles hidden buttons
      showRerun.style.display = "block"
      showGoback.style.display = "block"
      showDownload.style.display = "block"
      showTable.style.display = "block"
      heatMap.style.display = "block"
      plotButton.style.display = "block"
      // sets listGiFilter to the selected nodes
      listGiFilter = bootstrapTableList
      bootstrapTableList = []
      // enables button group again
      $("#toolButtonGroup button").removeAttr("disabled")
      $("#loading").hide()
      renderer.rerender()
    })
  })

  // function to create table
  $("#tableShow").unbind("click").bind("click", () => {
    $("#tableModal").modal()
    showDiv()
      .then( () => {
        previousTableList = makeTable(areaSelection, listGiFilter,
          previousTableList, g, graphics, graphSize)
        // enables button group again
        $("#toolButtonGroup button").removeAttr("disabled")
      })
  })

  // function to close table
  $("#cancelTable").unbind("click").bind("click", () => {
    $("#tableModal").modal("toggle")
  })

  // popup button for download csv
  // this only does single entry exports, for more exports table should be used
  $("#downloadCsv").unbind("click").bind("click", () => {
  // $(document).on("click", "#downloadCsv", () => {

    const quickFixString = (divNameList) => {
      let returnArray = []
      for (const divName of divNameList) {
        returnArray.push($(divName).text().replace(":", ",").trim())
      }
      return returnArray
    }
    // execute the same replacement function for all this divs
    const targetArray = quickFixString([
      "#accessionPop",
      "#speciesNamePop",
      "#lengthPop",
      "#plasmidNamePop",
      "#percentagePop",
      "#copyNumberPop",
      "#cardPop",
      "#cardGenePop",
      "#cardGenbankPop",
      "#cardAroPop",
      "#cardCoveragePop",
      "#cardIdPop",
      "#cardRangePop",
      "#resfinderPop",
      "#resfinderGenePop",
      "#resfinderGenbankPop",
      "#resfinderCoveragePop",
      "#resfinderIdPop",
      "#resfinderRangePop",
      "#pfPop",
      "#pfGenePop",
      "#pfGenbankPop",
      "#pfCoveragePop",
      "#pfIdentityPop",
      "#pfRangePop",
      "#clusterIdPop"
    ])
    // then convert the resulting array to a csv file
    arrayToCsv(targetArray)
  })

  const emptyFiles = () => {
    $("#infile").val("")
    $("#mashInfile").val("")
    $("#assemblyfile").val("")
    readFilejson = false
    mashJson = false
    assemblyJson = false
  }

  $("#uploadFile").unbind("click").bind("click", () => {
    emptyFiles()
  })
  $("#uploadFileMash").unbind("click").bind("click", () => {
    emptyFiles()
  })
  $("#uploadFileAssembly").unbind("click").bind("click", () => {
    emptyFiles()
  })

  // resistance button control //
  $("#resButton").unbind("click").bind("click", () => {
    clickedPopupButtonCard = resGetter(currentQueryNode)
  })

  // plasmid finder button control
  $("#plasmidButton").unbind("click").bind("click", () => {
    clickedPopupButtonFamily = plasmidFamilyGetter(currentQueryNode)
  })

  // plasmid finder button control
  $("#virButton").unbind("click").bind("click", () => {
    clickedPopupButtonVir = virulenceGetter(currentQueryNode)
  })

  // control the alertClose button
  $("#alertClose").unbind("click").bind("click", () => {
    $("#alertId").hide()  // hide this div
  })

  $("#alertClose_search").unbind("click").bind("click", () => {
    $("#alertId_search").hide()  // hide this div
  })

  $("#alertCloseNCBI").unbind("click").bind("click", () => {
    $("#alertNCBI").hide()  // hide this div
  })
  $("#alertCloseAssembly").unbind("click").bind("click", () => {
    $("#alertAssembly").hide()  // hide this div
  })

  // sets toggle for size ratio and handles status of this toggle
  // this is used in "ratioSubmit" button
  $("#toggleRatio").change(function () {   // jquery seems not to support es6
    toggleRatioStatus = $(this).prop("checked")
  })

  // function that submits the selection made in the modal
  $("#ratioSubmit").unbind("click").bind("click", () => {
    event.preventDefault()
    // clears all links before doing this
    $("#reset-links").click()
    // $("#reset-links").click()
    // $("#loading").show()
    $("#scaleLegend").empty()
    showDiv().then(
      setTimeout( () => {
        linkColoring(g, graphics, renderer, "size", toggleRatioStatus, totalNumberOfLinks)
        // enables button group again
        $("#toolButtonGroup button").removeAttr("disabled")
      }, 100)
    )
    // const readMode = false
    // color_legend(readMode)
  })

  /**
  * control the visualization of multiple files for read mode
  * The default idea is that the first file in this readFilejson object is the
  * one to be loaded when uploading then everything else should use cycler
  */
  $("#slideRight").unbind("click").bind("click", () => {
    resetAllNodes(graphics, g, nodeColor, renderer, idsArrays)
    previousTableList = []
    // transform selector object that handles plots and hide their
    // respective divs
    Object.keys(selector).map( (el) => { selector[el].state = false })
    hideAllOtherPlots()
    areaSelection = false
    const outArray = slideToRight(readFilejson, readIndex, g, listGi, graphics, renderer)
    readIndex = outArray[0]
    listGiFilter = outArray[1][1]
    listGi = outArray[1][0]
  })

  $("#slideLeft").unbind("click").bind("click", () => {
    resetAllNodes(graphics, g, nodeColor, renderer, idsArrays)
    previousTableList = []
    // transform selector object that handles plots and hide their
    // respective divs
    Object.keys(selector).map( (el) => { selector[el].state = false })
    hideAllOtherPlots()
    areaSelection = false
    const outArray = slideToLeft(readFilejson, readIndex, g, listGi, graphics, renderer)
    readIndex = outArray[0]
    listGiFilter = outArray[1][1]
    listGi = outArray[1][0]
  })

  // changes the behavior of tooltip to show only on click
  $("#questionPlots").popover()
  $("#questionTable").popover()
  $("#questionHeatmap").popover()
  $("#questionMap").popover()
  $("#questionRatio").popover()

  $("#infoMap").popover( { container: "body" } )
  $("#infoMash").popover( { container: "body" } )
  $("#infoAssembly").popover( { container: "body" } )

  /**
   * function to avoid shift key to be triggered when any modal is open
   */
  $(".modal").on("shown.bs.modal", () => {
    multiSelectOverlay = "disable"
  })

  /**
  * function to allow shift key to select nodes again, on modal close
  */
    .on("hidden.bs.modal", () => {
      multiSelectOverlay = false
      // this force question buttons to close if tableModal and modalPlot are
      // closed
      $("#questionTable").popover("hide")
      $("#questionHeatmap").popover("hide")
      $("#questionPlots").popover("hide")
      $("#questionMap").popover("hide")
      $("#questionRatio").popover("hide")
      $("#infoMap").popover("hide")
      $("#infoMash").popover("hide")
      $("#infoAssembly").popover("hide")
    })

  // this forces the entire script to run
  init() //forces main json or the filtered objects to run before
  // rendering the graph

}
