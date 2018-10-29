/*globals resetAllNodes, storeRecenterDom, buildCircleNodeShader,
requestPlasmidTable, selector, hideAllOtherPlots, toggleManager,
resRepetitivePlotFunction, pfRepetitivePlotFunction, virRepetitivePlotFunction,
statsParser, nodeColorReset, resetDisplayTaxaBox, showDiv, layoutGet,
singleDropdownPopulate, filterDisplayer, slider, removeFirstCharFromArray,
colorList, resetLinkColor, handleFileSelect, downloadSeqByColor, downloadSeq,
abortRead, arrayToCsv, linkColoring, Mousetrap, associativeObj, taxaRequest,
getArrayMapping, getArrayMash, colorLegendFunction, noUiSlider, actualRemoval,
getArrayAssembly, startMultiSelect, requesterDB, addAllNodes, addAllLinks,
quickFixString, fileChecks, initResize, controlFiltersSameLevel, fileDownloader,
importProject, setProjectView, readFilejson, mashJson, assemblyJson,
consensusJson, projectJson, listGiFilter, storeMasterNode, recenterDOM,
defaultZooming, freezeShift, renderer, downloadTypeHandler, colorNodes,
initCallback, multiSelectOverlay, multiSelectOverlayObj, areaSelection,
pageReRun, pfSubmitFunction, legendInst, resSubmitFunction,
virSubmitFunction, parseQueriesIntersection, iterateArrays, readColoring,
pushToMasterReadArray, repetitivePlotFunction, heatmapMaker, makeTable,
centerToggleQuery, toggleOnSearch, resGetter, plasmidFamilyGetter,
virulenceGetter, slideToRight, slideToLeft, minNodeSize, WebglCircle, devel,
Viva, sliderMinMax, listLengths, firstInstace, getArray, counter, listGi, list,
graphSize, readIndex, requestDBList, reloadAccessionList, firstClickMenu,
bootstrapTableList, setupPopupDisplay, legendIndex, legendSliderControler,
typeOfProject, previousTableList, nodeColor, clickedPopupButtonCard,
clickedPopupButtonRes, clickedPopupButtonFamily, selectedFilter, idsArrays,
masterReadArray, getLinkedNodes, pageReload, clickerButton, clickedHighchart,
clickedPopupButtonVir, listPlots, removeBasedOnHashes, hideDivsFileInputs,
xRangePlotList, loadFilesToObj, mappingHighlight, fileMode, version,
parseRequestResults, requestResults, currentQueryNode, centralNode,
getCentralNode, dropdownSample, currentSample, loadingMessage, lastPosition,
dragging, develGenerationGraph, unpinSelectedNodes, blockFilterModal,
clickedPopupButtonMetal*/


/**
 * Function to empty the divs with the files.
 */
const emptyFiles = () => {
  $("#infile").val("")
  $("#mashInfile").val("")
  $("#assemblyfile").val("")
  $("#consensusfile").val("")
  $("#projectFile").val("")
  readFilejson = false
  mashJson = false
  assemblyJson = false
  consensusJson = false
  projectJson = false
}


/**
 * initiates vivagraph main functions
 * onLoad consists of mainly two main functions: init and renderGraph
 * This function is executed after onLoadWelcome function and it is used on
 * actualRemoval function. This is why the events associated with all buttons
 * are inside this function, i.e., actualRemoval removes everything within the
 * couve-flor div and then everything needs to be re-added and all the events
 * also need to be re-added.
 */
const onLoad = () => {

  // $("#toolButtonGroup button").removeAttr("disabled")

  /**
   * group of variables that allow to fetch input forms min and max values to
   * live update the slider bar
   */
  const inputMin = document.getElementById("slider_input_min"),
    inputMax = document.getElementById("slider_input_max"),
    inputs = [inputMin, inputMax]

  // initiate vivagraph instance
  const g = Viva.Graph.graph()
  // define layout

  const layout = Viva.Graph.Layout.forceDirected(g, {
    springLength: 100,
    springCoeff: 0.0001,
    dragCoeff: 0.001, // sets how fast nodes will separate from origin,
    // the higher the value the slower
    gravity: -10,
    theta: 1,

    springTransform(link, spring) {
      // spring.length = link.data.distance
      spring.length = 100 * Math.log10(1 - link.data.distance) + 100
    }
  })

  /**
   * Variable that stores the webgl graphics object from vivagraph
   */
  const graphics = Viva.Graph.View.webglGraphics()

  /**
   * This function renders the vivagraph graph
   * @param {Object} graphics - Variable that stores the webgl graphics object
   * from vivagraph
   */
  const renderGraph = (graphics) => {

    //** block #1 for node customization **//
    // first, tell webgl graphics we want to use custom shader
    // to render nodes:
    const circleNode = buildCircleNodeShader()
    graphics.setNodeProgram(circleNode)
    // second, change the node ui model, which can be understood
    // by the custom shader:
    graphics.node((node) => {
      let nodeSize = minNodeSize * node.data.logLength
      return new WebglCircle(nodeSize, nodeColor)
    })

    // During devel session prerender will run 500 times the render, otherwise
    // it will use the log value of the size of listGiFilter (the number of
    // nodes being highlighted) * 50
    const prerender = (devel === true) ? 500 :
      parseInt(Math.log(listGiFilter.length)) * 50

    // starts the renderer object
    renderer = Viva.Graph.View.renderer(g, {
      layout,
      graphics,
      container: document.getElementById("couve-flor"),
      prerender,
      preserveDrawingBuffer: true
    })

    // this couve-flor div is in fact the div that will show the links and nodes
    // graph, which is being set to visible here!
    $("#couve-flor").css("visibility", "visible")

    // start the renderer
    renderer.run()

    // by default the animation on forces is paused since it may be
    // computational intensive for old computers
    renderer.pause()

    // forces default zooming
    defaultZooming(layout, graphics)

    // here loading screen has to be hidden
    setTimeout( () => {
      renderer.rerender()
      $("#loading").hide()
    },100)

    // used to center on the node with more links
    // this is used to skip if it is a re-run button execution
    if (storeMasterNode.length > 0) {
      recenterDOM(renderer, layout, storeMasterNode)
    }

    // sets the limits of buttons and slider
    // this is only triggered on first instance because we only want to get
    // the limits of all plasmids once
    if (sliderMinMax.length === 0) {
      sliderMinMax = [Math.log(Math.min.apply(null, listLengths)),
        Math.log(Math.max.apply(null, listLengths))]
      // generates and customizes slider itself
      slider = document.getElementById("slider")

      noUiSlider.create(slider, {
        start: sliderMinMax,  //this is an array
        behaviour: "snap",   // snaps the closest slider
        connect: true,
        range: {
          "min": sliderMinMax[0],
          "max": sliderMinMax[1]
        }
      })
    }

    /**
     * Event that will update the slider input boxes if one of the handlers is
     * dragged
     */
    slider.noUiSlider.on("update", (values, handle) => {
      inputs[handle].value = Math.trunc(Math.exp(values[handle]))
    })


    /**
     * event listener for the slider of lengths within
     * this modal. This will shade all the nodes that are outside the desired
     * range. Nodes inside the desired range will remain the same color.
     */
    slider.noUiSlider.on("set", () => {
      let sliderMax = Math.exp(slider.noUiSlider.get()[1]),
        sliderMin = Math.exp(slider.noUiSlider.get()[0])
      g.forEachNode( (node) => {
        // check if node is not a singleton
        // singletons for now do not have size set so they cannot be
        // filtered with this method
        // only changes nodes for nodes with seqLength data
        if (node.data.seqLength) {
          const nodeLength = node.data.seqLength.split(">").slice(-1).toString()
          let nodeUI = graphics.getNodeUI(node.id)
          if (parseInt(nodeLength) < parseInt(sliderMin) ||
            parseInt(nodeLength) > parseInt(sliderMax)) {
            nodeUI.color = 0xcdc8b1 // shades nodes
          } else if (parseInt(nodeLength) >= parseInt(sliderMin) ||
            parseInt(nodeLength) <= parseInt(sliderMax)) {
            nodeUI.color = nodeUI.backupColor // return nodes to original color
          }
        }
      })
      renderer.rerender()
    })

  } // closes renderGraph

  /**
   * Function that is responsible for the
   */
  const init = async () => {
    // if firstInstace it means that the graph is being generated for the fist
    // time and has no filtered datasets
    if (firstInstace === true) {
      // the next if statement is only executed on development session, it
      // is way less efficient than the non development session.
      if (devel === true) {

        const getArrayResponse = await (
          await fetch("/test")).json()

        await develGenerationGraph(g, getArrayResponse)

        // precompute before rendering
        await renderGraph(graphics)
        // }) //new getArray end
      } else {
        // this renders the graph when not in development session
        // this is a more efficient implementation which takes a different
        // file for loading the graph.
        const getArrayResponse = await (
          await fetch("/fullDS")).json()

        graphSize = getArrayResponse.nodes.length

        // sequential code that first loads nodes, then links and then renders
        // the graph
        await loadingMessage(
          "Loading plasmids...",
          addAllNodes(g, getArrayResponse.nodes, layout)
        )

        await loadingMessage(
          "Establishing the relationships between plasmids...",
          addAllLinks(g, getArrayResponse.links)
        )

        await loadingMessage(
          "Rendering the graph...",
          renderGraph(graphics)
        )

        await parseRequestResults(requestResults)
      }
    } else {
      // This else statement is executed each time a filter is applied in the
      // vivagraph visualization. storeMasterNode is empty in here.
      if (readFilejson !== false) {
        const readReload = readFilejson[currentSample]
        $("#fileNameDiv").html(`Current sample: ${currentSample}`)
          .show()
        requestDBList = await requesterDB(g, listGiFilter, counter, renderGraph,
          graphics, reloadAccessionList, renderer, listGi, readReload)
      } else {
        // sets pageReRun to true
        pageReRun = true
        // used when no reads are used to filter
        requestDBList = await requesterDB(g, listGiFilter, counter, renderGraph,
          graphics, reloadAccessionList, renderer, listGi, false)
      }

      listGiFilter = requestDBList[0] // list with the nodes used to filter
      reloadAccessionList = requestDBList[1] //list stores all nodes present
      // this listGi isn't the same as the initial but has information on
      // all the nodes that were used in filters

      // forces renderer after a while, because for some reason renderer doesn't
      // always occur after re_run
      setTimeout( () => {
        renderer.rerender()
      }, 1000)
    }
  }

  //* ***********************************************//
  // control the INFILE INPUT and related functions //
  //* ***********************************************//

  /**
   * Event listener for mapping files
   */
  handleFileSelect("infile", "#file_text", (newReadJson) => {
    readFilejson = newReadJson
  })

  /**
   * Event listener for mash screen files
   */
  handleFileSelect("mashInfile", "#file_text_mash", (newMashJson) => {
    mashJson = newMashJson
  })

  /**
   * Event listener for assembly files
   */
  handleFileSelect("assemblyfile", "#assembly_text", (newAssemblyJson) => {
    assemblyJson = newAssemblyJson
  })

  /**
   * Event listener for consensus files
   */
  handleFileSelect("consensusfile", "#consensus_text", (newConsensusJson) => {
    consensusJson = newConsensusJson
  })

  /**
   * Event listener for project files imports
   */
  handleFileSelect("projectFile", "#project_text", (newProjectJson) => {
    projectJson = newProjectJson
  })

  /**
   * Event that clears div with text of selected files when upload file buttons
   * are clicked.
   */
  $(".btn-file").unbind("click").bind("click", () => {
    $("#cancel_infile, #cancel_infile_mash, #cancel_assembly, " +
      "#cancel_consensus").click()
  })

  //***************//
  //* DRAG N DROP *//
  //***************//

  $(".custom-file-form")
    .on("drag dragstart dragend dragover dragenter dragleave drop", (e) => {
    e.preventDefault()
    e.stopPropagation()
  })
    .on("dragover dragenter", () => {
      $(".custom-file-form").addClass("is-dragover")
    })
    .on("dragleave dragend drop", () => {
      $(".custom-file-form").removeClass("is-dragover")
    })
    .on("drop", async (e) => {
      const files = e.originalEvent.dataTransfer.files
      const textId = e.originalEvent.target.id

      await emptyFiles()

      loadFilesToObj(files, `#${textId}`).then( (results) => {
        dropdownSample(results, `#${textId}`)
        // parses results to the right type of file import
        if (textId === "file_text") {readFilejson = results.arrayOfObj}
        else if (textId === "file_text_mash") {mashJson = results.arrayOfObj}
        else if (textId === "assembly_text") {assemblyJson = results.arrayOfObj}
        else if (textId === "consensus_text") {consensusJson = results.arrayOfObj}
        else if (textId === "project_text") {projectJson = results.arrayOfObj}
      })

    })

  //*********//
  //* TABLE *//
  //*********//

  /**
   * Function to add accession to bootstrapTableList in order to use in
   * downloadTable function or in submitTable button
   */
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


  /**
   * Button that downloads the sequences associated with the checked boxes in
   * the table.
   */
  $("#downloadTable").unbind("click").bind("click", (e) => {
    e.preventDefault()

    downloadTypeHandler(bootstrapTableList)
  })

  /**
   * Table button that colors the nodes that correspond to the checked boxes
   * in the table.
   */
  $("#tableSubmit").unbind("click").bind("click", () => {
    $("#reset-sliders").click()
    $("#colorLegend").hide()
    // if bootstraTableList contains only one accession then showPopup
    if (bootstrapTableList.length === 1) {
      recenterDOM(renderer, layout, [bootstrapTableList[0], false])
      requestPlasmidTable(g.getNode(bootstrapTableList[0]), setupPopupDisplay)
    }
    showDiv().then( () => {
      $("#loadingInfo").html("Coloring selected nodes...")
      colorNodes(g, graphics, renderer, bootstrapTableList, "0xFF7000")

      // handles hidden buttons
      $("#Re_run, #go_back, #download_ds, #tableShow, #heatmapButtonTab," +
        " #plotButton").show()

      // sets listGiFilter to the selected nodes
      listGiFilter = bootstrapTableList
      bootstrapTableList = []
      // enables button group again
      // $("#toolButtonGroup button").removeAttr("disabled")
      $("#loading").hide()
      renderer.rerender()
    })
  })

  /**
   * Function that closes the table modal
   */
  $("#cancelTable").unbind("click").bind("click", () => {
    $("#tableModal").modal("toggle")
  })

  /**
   * Button events that clear all uploaded files, avoiding that different type
   * of files are loaded at the same time.
   */
  $("#uploadFile, #uploadFileMash, #uploadFileAssembly, #uploadFileConsensus, " +
    "#uploadFileProject").unbind("click").bind("click", () => {
    emptyFiles()
  })

  //**********//
  //* ALERTS *//
  //**********//

  // a series of button events to close several bootstrap alerts
  $("#alertClose").unbind("click").bind("click", () => {
    $("#alertId").hide()  // hide this div
  })

  $("#alertNoSelectionClose").unbind("click").bind("click", () => {
    $("#alertNoSelection").hide()  // hide this div
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

  $("#alertClose_noFile").unbind("click").bind("click", () => {
    $("#alertId_noFiles").hide()  // hide this div
  })

  $("#alertClose_noResults").unbind("click").bind("click", () => {
    $("#alertId_noResults").hide()  // hide this div
  })

  $("#alertCloseJsonFile").unbind("click").bind("click", () => {
    $("#alertJsonFile").hide()  // hide this div
  })

  $("#alertClosenoSelectedview").unbind("click").bind("click", () => {
    $("#alertIdnoSelectedview").hide()  // hide this div
  })

  $("#alertCloseEmptySelectedview").unbind("click").bind("click", () => {
    $("#alertIdEmptySelectedview").hide()  // hide this div
  })

  $("#alertCloseNoProject").unbind("click").bind("click", () => {
    $("#alertIdNoProject").hide()  // hide this div
  })

  $("#alertClose_noProject").unbind("click").bind("click", () => {
    $("#alertId_noProject").hide()  // hide this div
  })

  $("#alertClose_Version").unbind("click").bind("click", () => {
    $("#alertId_Version").hide()  // hide this div
  })

  //**********//
  //* LEGEND *//
  //**********//

  /**
   * Allows legend to move between selections. In this case to the right
   * selection menu saved in legendSliderControler
   */
  $("#slideLegendRight").unbind("click").bind("click", () => {

    // iterates through the array of filters
    legendIndex = (legendIndex === 3) ? 0 : legendIndex +=1

    // triggers the event click that will make the requests to the db and
    // render the new legend
    $(`${legendSliderControler[legendIndex]}`).click()

  })


  /**
   * Allows legend to move between selections. In this case to the left
   * selection menu saved in legendSliderControler
   */
  $("#slideLegendLeft").unbind("click").bind("click", () => {

    // iterates through the array of filters
    legendIndex = (legendIndex === 0) ? 3 : legendIndex -= 1

    // triggers the event click that will make the requests to the db and
    // render the new legend
    $(`${legendSliderControler[legendIndex]}`).click()

  })


  /**
   * Event to handle the resizing of color legend
   */
  $("#resizeLegend").mousedown( (e) => {
    initResize()
  })

  //*****************//
  //**** POPOVERS ***//
  //*****************//

  // changes the behavior of tooltip to show only on click
  $("#questionPlots, #questionTable, #questionHeatmap, #questionMap, " +
    "#questionRatio, #exportProjectQuestion, #importProjectQuestion, " +
    "#questionCombined, #questionHash").popover()

  // sets the container for the popover
  $("#infoMap, #infoMash, #infoAssembly").popover( { container: "body" } )

  //************//
  //* PROJECTS *//
  //************//

  /**
   * Event that triggers the project save to a file
   */
  $("#projectSubmit").unbind("click").bind("click", () => {
    /**
     * Creates a copy of typeOfProject
     * @type {{} & Object}
     */
    const noVersionTypeOfProject = Object.assign({}, typeOfProject)

    // then delete the version
    delete noVersionTypeOfProject["version"]

    // check if any element is not false
    const checkFalse = (element) => {
      return element === false
    }

    const checkTypeOfProject = Object.values(noVersionTypeOfProject)
      .every(checkFalse)

    // if any selection is made then project may be exported
    if (!checkTypeOfProject) {
      const textToExport = JSON.stringify(typeOfProject)

      // checks if div is empty and if so gives a default name, otherwise
      // fetches user defined name
      const projectName = ($("#projectName").val() === "") ?
        "my-patlas-project" : $("#projectName").val()

      // downloads the file
      fileDownloader(`${projectName}.json`, "data:application/json;charset=utf-8",
        [textToExport])
    } else {
      // if checkTypeOfProject is true show alert
      $("#alertId_noProject").show()
    }
  })

  /**
   * Function that handles for the first time the projectJson file. It will
   * parse for the first time the dropdowns associated with the import from
   * project files. Therefore, in the first iteration it will parse the
   * projectJson to update the viewList and viewList2 dropdowns. However, it
   * will raise an error if that view doesn't exist and update the dropdowns
   * immediately.
   */
  $("#projectLoadSubmit").unbind("click").bind("click", () => {
    // first check if viewList has nothing selected
    if (!$("#viewList").val()) {
      $("#alertIdnoSelectedview").show()
    } else if ($("#project_text").val() === "") {
      $("#alertIdNoProject").show()
    } else {

      // makes value from div comparable with the projectJson object so that they
      // can be used as keys for that object
      const viewParsed = $("#viewList").val().toLowerCase().replace(" ", "")

      const projectInitialView = importProject(projectJson, viewParsed)

      // check if current selected view isn't false
      if (projectInitialView !== false) {

        // hides modal if successful
        $("#importProjectModal").modal("hide")

        // show project dropdown switcher and close button
        $("#viewWrapper").show()

        // sets the project in the current patlas view
        setProjectView(projectInitialView, viewParsed)

        const fileVersion = JSON.parse(Object.values(projectJson)[0]).version

        if (fileVersion !== version) {
          $("#alertVersionText").html(`Project file was generated in a different
           pATLAS version. Current version: ${version}. Your file was generated 
           in version: ${fileVersion}`)
          $("#alertId_Version").show()
        }

      } else {
        $("#alertIdEmptySelectedview").show()
      }
    }
  })


  /**
   * Dynamically updates each one of the dropdowns and if the click is on the
   * viewList2 dropdown it will fire the projectLoadSubmit click event.
   */
  $("#viewList, #viewList2").on("changed.bs.select", (e) => {

    $("#viewList, #viewList2").selectpicker("val", $(`#${e.target.id}`).val())

    // fires the click event if the selection is on viewList2
    if (e.target.id === "viewList2") {
      $("#projectLoadSubmit").click()
    }

  })


  /**
   * Function to close the current project and handle the respective selections
   * made throughout pATLAS.
   */
  $("#closeProject").unbind("click").bind("click", () => {
    // hide the div with the dropdown and close button itself
    $("#viewWrapper").hide()
    // clicks every clear button in each modal and reset-sliders
    $("#reset-sliders, #pfClear, #virClear, #resClear, #taxaModalClear, " +
      "#intersectionsModalClear, #metalClear").click()
    // hides fileNameDiv
    $("#fileNameDiv").hide()

    // re-allow any selection from the dropdown menus
    $("#viewList option").each( (idx, el) => {
      // fetch the classNames of each el (options)
      $(`.${el.className}`).prop("disabled", false)
      $("#viewList, #viewList2").selectpicker("refresh")
    })

    emptyFiles()
  })

  // event for shift key down
  // shows overlay div and exectures startMultiSelect
  $(document).unbind("keydown").bind("keydown", async (e) => {
    if (e.which === 16 && !multiSelectOverlay && !freezeShift && !dragging) { // shift key
      // should close popup open so it doesn't get into listGiFilter

      $("#closePop").click()
      $(".graph-overlay").show()

      // before selecting anything it should clear previous selections
      await resetAllNodes(graphics, g, nodeColor, renderer)
      listGiFilter = [] //if selection is made listGiFilter should be empty
      previousTableList = []

      multiSelectOverlay = true
      multiSelectOverlayObj = await startMultiSelect(g, renderer, layout)
      $("#Re_run, #go_back, #download_ds, #tableShow, #heatmapButtonTab," +
        " #plotButton").show()
      areaSelection = true

      // transform selector object that handles plots and hide their
      // respective divs
      Object.keys(selector).map( (el) => { selector[el].state = false })
      await hideAllOtherPlots()

      selectedFilter = false

    } else if (e.which === 88 && !dragging) {
      dragging = true
      multiSelectOverlay = false
      multiSelectOverlayObj.destroy()
    }
  })

  let mouseCounter = 0

  /**
   * Event for shift key up, which destroys the overlay div and transforms
   * multiSelectOverlay to false
   */
  $(document).unbind("keyup").bind("keyup", (e) => {
    if (e.which === 16 && multiSelectOverlay !== "disable") {
      $(".graph-overlay").hide()
      $("#colorLegend").hide()
      if (multiSelectOverlay !== false) {
        multiSelectOverlayObj.destroy()
      }
      multiSelectOverlay = false
    } else if (e.which === 88) {
      dragging = false
      mouseCounter = 0
      // unpin selected nodes
      unpinSelectedNodes(g, layout)
      renderer.rerender()

    }
  })

  /**
   * Event that is triggered to allow multiple nodes to be dragged at once
   */
  $(document).unbind("mousemove").bind("mousemove", async (e) => {
    // checks if drag mode is on
    if (dragging) {
      mouseCounter++
      // transform current mouse position to graph coordinates
      const currentPosition = graphics.transformClientToGraphCoordinates({
        x: e.pageX,
        y: e.pageY
      })
      // sets the positions to move
      const whatMoved = {
        x: currentPosition.x - lastPosition.x,
        y: currentPosition.y - lastPosition.y
      }
      listGiFilter = await reGetListGi(g, graphics)
      await dragMultipleNodes(g, graphics, layout, whatMoved)
      if (mouseCounter % 5 === 0) {
        await renderer.rerender()
      }
    }

    // sets last position of the mouse and transform coordinates to graph
    // position
    lastPosition = graphics.transformClientToGraphCoordinates({
      x: e.pageX,
      y: e.pageY
    })
  })

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
      $("#questionTable, #questionHeatmap, #questionPlots, #questionMap, " +
        "#questionRatio, #infoMap, #infoMash, #infoAssembly, " +
        "#exportProjectQuestion, #importProjectQuestion, #questionCombined, " +
        "#questionHash")
        .popover("hide")
    })
    /**
     * Event that prevents drag and drop on modal from exiting the page and
     * opening the file dragged to the browser.
     */
    .on("drag dragstart dragend dragover dragenter dragleave drop", (e) => {
      e.preventDefault()
      e.stopPropagation()
    })


  //* *************//
  //* ** TOGGLE ***//
  //* *************//

  /** This section controls the connection between the toggle button on the leftside
   * and the dropdown on the right side
   */

  /**
   * Variable that controls the behavior of toggle button to switch between
   * plasmid search and accession number search
   * @type {boolean}
   */
  let toggleStatus = false

  /**
   * The function that controls the changes on toggle-event button.
   */
  $("#toggle-event").change(function () {
    toggleStatus = $(this).prop("checked")
    toggleManager(toggleStatus)
  })


  //* *************//
  //* ** CLICK NODES EVENTS ***//
  //* *************//

  /**
   * Variable that contains vivagraph webgl events
   */
  const events = Viva.Graph.webglInputEvents(graphics, g)

  //* * mouse click on nodes **//
  events.click( (node, e) => {

    // when clicking in a new node, the first thing to assure is that is closes
    // the previous instance of the popup
    $("#closePop").click()

    pageReRun = false

    // this resets previous selected node to previous color
    if (currentQueryNode) {
      graphics.getNodeUI(currentQueryNode).color = graphics.getNodeUI(
          currentQueryNode).backupColor
    }
    // then starts making new changes to the newly geerated node
    currentQueryNode = node.id
    let nodeUI1 = graphics.getNodeUI(node.id)
    const domPos = {
      x: nodeUI1.position.x,
      y: nodeUI1.position.y
    }
    // if statement used to check if backup color is set
    if (nodeUI1.backupColor) { nodeUI1.backupColor = nodeUI1.color }

    // changes the color of the node into red
    nodeUI1.color = 0xFFC300
    renderer.rerender()

    // allows the control of the click appearing and locking

    // And ask graphics to transform it to DOM coordinates:
    graphics.transformGraphToClientCoordinates(domPos)
    domPos.x = (domPos.x + nodeUI1.size) + "px"
    domPos.y = (domPos.y) + "px"

    // requests table for sequences metadata
    requestPlasmidTable(node, setupPopupDisplay)
  })


  //* ******************//
  //* ***PLASMIDFINDER Filters****//
  //* ******************//

  /**
   * This event clears all the selected plasmid finder genes.
   */
  $("#pfClear").unbind("click").bind("click", (event) => {
    $("#reset-sliders").click()
    // clear = true;
    event.preventDefault()
    // this needs an array for reusability purposes
    resetDisplayTaxaBox(["p_PlasmidFinder"])

    // resets dropdown selections
    $("#plasmidFinderList").selectpicker("deselectAll")

    // slider.noUiSlider.set([min, max])
    // nodeColorReset(graphics, g, nodeColor, renderer)
    previousTableList = []
    // transform selector object that handles plots and hide their
    // respective divs
    Object.keys(selector).map( (el) => { selector[el].state = false })
    hideAllOtherPlots()
    areaSelection = false
  })

  /**
   * This button event submits a query to the psql database that searches for
   * all the accession numbers that have the selected plasmid finder associated
   * genes.
   */
  $("#pfSubmit").unbind("click").bind("click", (event) => {
    event.preventDefault()

    legendIndex = 2

    selectedFilter = "pf"

    // clears previous selected nodes
    nodeColorReset(graphics, g, nodeColor, renderer)
    previousTableList = []
    // transform selector object that handles plots and hide their
    // respective divs
    Object.keys(selector).map( (el) => { selector[el].state = false })
    hideAllOtherPlots()
    areaSelection = false

    // sets slider legend buttons to enable, allowing them to be clicked
    $("#slideLegendLeft, #slideLegendRight").prop("disabled", false)

    // empties all other legends legend
    $("#taxa_label, #res_label, #vir_label, #metal_label, #advanced_label, " +
      "#read_label, #fileNameDiv").hide()
    $("#colorLegendBox, #colorLegendBoxRes, #colorLegendBoxMetal," +
      " #colorLegendBoxVir, #colorLegendBoxAdvanced, #readString, " +
      "#readLegend").empty()

    // reset nodes before submitting new colors
    const tempPageReRun = pageReRun

    // after setting these variables, show loading div with messages and makes
    // the request to the API in order to show the results
    showDiv().then( () => {
      $("#loadingInfo").html("Fetching PlasmidFinder data...")
      pfSubmitFunction(g, graphics, renderer, tempPageReRun).then( (results) =>  {
        legendInst = results
        pageReRun = false
        // just show legend if any selection is made at all
        if (legendInst === true) {
          $("#Re_run, #go_back, #download_ds, #tableShow, #heatmapButtonTab," +
            " #plotButton, #colorLegend").show()
        }
        // enables button group again
        // $("#toolButtonGroup button").removeAttr("disabled")
        $("#loading").hide()
      })
    })
  })


  //* ******************//
  //* ***RESISTANCES Filters****//
  //* ******************//

  /**
   * This button clears all the selections made for resistance modals, i.e.,
   * all the selected resistance genes will be cleared.
   */
  $("#resClear").unbind("click").bind("click", (event) => {
    event.preventDefault()
    $("#reset-sliders").click()
    resetDisplayTaxaBox(["p_Resfinder", "p_Card"])

    // resets dropdown selections
    $("#cardList").selectpicker("deselectAll")
    $("#resfinderList").selectpicker("deselectAll")

    // slider.noUiSlider.set([min, max])
    // nodeColorReset(graphics, g, nodeColor, renderer)
    previousTableList = []
    // transform selector object that handles plots and hide their
    // respective divs
    Object.keys(selector).map( (el) => { selector[el].state = false })
    hideAllOtherPlots()
    areaSelection = false
  })


  /**
   * Button event that enables to search for specific resistance genes in
   * the plasmid network. This function makes queries to the psql database to
   * search for the desired resistance genes.
   */
  $("#resSubmit").unbind("click").bind("click", (event) => {
    event.preventDefault()

    legendIndex = 1

    selectedFilter = "res"

    // clears previously selected nodes
    nodeColorReset(graphics, g, nodeColor, renderer)
    previousTableList = []
    // transform selector object that handles plots and hide their
    // respective divs
    Object.keys(selector).map( (el) => { selector[el].state = false })

    hideAllOtherPlots()

    $("#slideLegendLeft, #slideLegendRight").prop("disabled", false)

    // empties all other legends legend
    $("#taxa_label, #metal_label, #vir_label, #pf_label, #advanced_label, " +
      "#read_label, #fileNameDiv").hide()
    $("#colorLegendBox, #colorLegendBoxMetal, #colorLegendBoxPf," +
      " #colorLegendBoxVir, #colorLegendBoxAdvanced, #readString, " +
      "#readLegend").empty()

    areaSelection = false

    const tempPageReRun = pageReRun

    // after setting these variables, show loading div with messages and makes
    // the request to the API in order to show the results
    showDiv().then( () => {
      $("#loadingInfo").html("Fetching resistance data...")
      resSubmitFunction(g, graphics, renderer, tempPageReRun).then( (results) => {
        legendInst = results
        pageReRun = false
        // just show legend if any selection is made at all
        if (legendInst === true) {
          $("#Re_run, #go_back, #download_ds, #tableShow, #heatmapButtonTab," +
            " #plotButton, #colorLegend").show()
        }

        $("#loading").hide()
      })
    })
  })


  //* ******************//
  //* ***VIRULENCE Filters****//
  //* ******************//

  /**
   * Button event that clears all the selected virulence genes and their
   * associated nodes
   */
  $("#virClear").unbind("click").bind("click", (event) => {
    $("#reset-sliders").click()
    // clear = true;
    event.preventDefault()
    // this needs an array for reusability purposes
    resetDisplayTaxaBox(["p_Virulence"])

    // resets dropdown selections
    $("#virulenceList").selectpicker("deselectAll")

    // slider.noUiSlider.set([min, max])
    // nodeColorReset(graphics, g, nodeColor, renderer)
    previousTableList = []
    // transform selector object that handles plots and hide their
    // respective divs
    Object.keys(selector).map( (el) => { selector[el].state = false })
    hideAllOtherPlots()
    areaSelection = false
  })


  /**
   * Button event that submits the current selection of virulence genes to
   * display into pATLAS network. It makes a query of the selected virulence
   * genes to the psql database served side.
   */
  $("#virSubmit").unbind("click").bind("click", (event) => {
    event.preventDefault()

    legendIndex = 3

    selectedFilter = "vir"

    // clears previous selected nodes
    nodeColorReset(graphics, g, nodeColor, renderer)
    previousTableList = []
    // transform selector object that handles plots and hide their
    // respective divs
    Object.keys(selector).map( (el) => { selector[el].state = false })
    hideAllOtherPlots()
    areaSelection = false

    $("#slideLegendLeft, #slideLegendRight").prop("disabled", false)

    // empties taxa and plasmidfinder legend
    // empties all other legends legend
    $("#taxa_label, #res_label, #metal_label, #pf_label, #advanced_label, " +
      "#read_label, #fileNameDiv").hide()
    $("#colorLegendBox, #colorLegendBoxRes, #colorLegendBoxPf," +
      " #colorLegendBoxMetal, #colorLegendBoxAdvanced, #readString, " +
      "#readLegend").empty()

    // reset nodes before submitting new colors
    const tempPageReRun = pageReRun

    // after setting these variables, show loading div with messages and makes
    // the request to the API in order to show the results
    showDiv().then( () => {
      $("#loadingInfo").html("Fetching virulence data...")
      virSubmitFunction(g, graphics, renderer, tempPageReRun).then( (results) =>  {
        legendInst = results
        pageReRun = false
        // just show legend if any selection is made at all
        if (legendInst === true) {
          // showLegend.style.display = "block"
          $("#Re_run, #go_back, #download_ds, #tableShow, #heatmapButtonTab," +
            " #plotButton, #colorLegend").show()
        }

        $("#loading").hide()
      })
    })
  })

  /**
   * Button event that clears all the selected metal genes and their
   * associated nodes
   */
  $("#metalClear").unbind("click").bind("click", (event) => {
    $("#reset-sliders").click()
    event.preventDefault()
    // this needs an array for reusability purposes
    resetDisplayTaxaBox(["p_Metal"])

    // resets dropdown selections
    $("#virulenceList").selectpicker("deselectAll")

    previousTableList = []
    // transform selector object that handles plots and hide their
    // respective divs
    Object.keys(selector).map( (el) => { selector[el].state = false })
    hideAllOtherPlots()
    areaSelection = false
  })

  /**
   * Button event that submits the current selection of virulence genes to
   * display into pATLAS network. It makes a query of the selected virulence
   * genes to the psql database served side.
   */
  $("#metalSubmit").unbind("click").bind("click", (event) => {
    event.preventDefault()

    legendIndex = 3

    selectedFilter = "metal"

    // clears previous selected nodes
    nodeColorReset(graphics, g, nodeColor, renderer)
    previousTableList = []
    // transform selector object that handles plots and hide their
    // respective divs
    Object.keys(selector).map( (el) => { selector[el].state = false })
    hideAllOtherPlots()
    areaSelection = false

    $("#slideLegendLeft, #slideLegendRight").prop("disabled", false)

    // empties all other legends legend
    $("#taxa_label, #res_label, #vir_label, #pf_label, #advanced_label, " +
      "#read_label, #fileNameDiv").hide()
    $("#colorLegendBox, #colorLegendBoxRes, #colorLegendBoxPf," +
      " #colorLegendBoxVir, #colorLegendBoxAdvanced, #readString, " +
      "#readLegend").empty()

    // reset nodes before submitting new colors
    const tempPageReRun = pageReRun

    // after setting these variables, show loading div with messages and makes
    // the request to the API in order to show the results
    showDiv().then( () => {
      $("#loadingInfo").html("Fetching virulence data...")
      metalSubmitFunction(g, graphics, renderer, tempPageReRun).then( (results) =>  {
        legendInst = results
        pageReRun = false
        // just show legend if any selection is made at all
        if (legendInst === true) {
          // showLegend.style.display = "block"
          $("#Re_run, #go_back, #download_ds, #tableShow, #heatmapButtonTab," +
            " #plotButton, #colorLegend").show()
        }

        $("#loading").hide()
      })
    })
  })


  /**
   * event listener for dropdown clicks that populate the displayer in modal
   */
  $("#orderList, #familyList, #genusList, #speciesList, #cardList, " +
    "#resfinderList, #plasmidFinderList, #virulenceList, #metalList")
    .on("changed.bs.select", (e) => {

      const arrayOfSelections = $(`#${e.target.id}`).selectpicker("val")

      // fill panel group displaying current selected taxa filters
      let stringClass = e.target.id.slice(0, -4)
      // convert first char to upper case
      stringClass  = stringClass.charAt(0).toUpperCase() + stringClass.slice(1)

      // checks if a taxon is already in display
      const divStringClass = "#p_" + stringClass

      filterDisplayer(arrayOfSelections, stringClass, divStringClass)
    })

  /**
   * event handler that listens for the changes in the dropdown that allows
   * users to select samples. This will be responsible for setting the
   * currentSample variable
   */
  $(".sampleDropdownSelect").on("changed.bs.select", (e) => {
    currentSample = $(`#${e.target.id}`).selectpicker("val")
  })

  //* ******************//
  //* ***INTERSECTIONS and UNIONS****//
  //* ******************//

  /**
   * Button click event to clear all the selections made through the
   * intersections menu
   */
  $("#intersectionsModalClear").unbind("click").bind("click", (event) => {
    // unselect all the selected options from dropdowns
    $("#virList2, #resCardList2, #resResfinderList2, #pfList2," +
      " #speciesList2, #genusList2, #familyList2, #orderList2")
      .selectpicker("deselectAll")

    // an array of dropdown selectors to remove the disabled attr
    const arrayOfSelectors = ["orderList2", "familyList2", "genusList2",
      "speciesList2", "resResfinderList2", "resCardList2"]

    // sets dropdowns to enable state so that tey can be selected again
    for (const selector of arrayOfSelectors) {
      $(`#${selector}`).prop("disabled", false)
    }
  })

  /**
   * Button click event for intersection displays
   */
  $("#intersectionsModalSubmit, #unionModalSubmit").unbind("click").bind(
    "click", (event) => {

      $("#reset-sliders").click()

      const typeOfSubmission = event.target.id

      let objectOfSelections = {

        metal: $("#metalList2").selectpicker("val"),
        virulence: $("#virList2").selectpicker("val"),
        card: $("#resCardList2").selectpicker("val"),
        resfinder: $("#resResfinderList2").selectpicker("val"),
        pfinder: $("#pfList2").selectpicker("val"),
        order: $("#orderList2").selectpicker("val"),
        family: $("#familyList2").selectpicker("val"),
        genus: $("#genusList2").selectpicker("val"),
        species: $("#speciesList2").selectpicker("val")

      }

      const typeToProject = (typeOfSubmission === "intersectionsModalSubmit") ?
        "intersection" : "union"

      typeOfProject[typeToProject] = objectOfSelections

      // after setting these variables, show loading div with messages and makes
      // the request to the API in order to show the results
      showDiv().then( () => {
        $("#loadingInfo").html("Submitting your query...")
        parseQueriesIntersection(g, graphics, renderer,
          objectOfSelections, typeToProject)
      })

      // empties all other legends legend
      $("#taxa_label, #res_label, #vir_label, #pf_label, #metal_label, " +
        "#read_label, #fileNameDiv").hide()
      $("#colorLegendBox, #colorLegendBoxRes, #colorLegendBoxPf," +
        " #colorLegendBoxVir, #colorLegendBoxMetal, #readString, " +
        "#readLegend").empty()

    }
  )

  /**
   * Variable that controls the last taxa selector that was used under
   * intersections menu
   * @type {boolean|String}
   */
  let lastTaxaSelector = false

  /**
   * Variable that controls the last resistance selector taht was used under
   * intersections menu
   * @type {boolean|String}
   */
  let lastResSelector = false

  /**
   * Event that assures that only one of the selectors are used at once
   */
  $("#orderList2, #familyList2, #genusList2, #speciesList2")
    .on("changed.bs.select", (e) => {

        const arrayOfSelectors = ["orderList2", "familyList2",
          "genusList2", "speciesList2"]

        lastTaxaSelector = controlFiltersSameLevel(lastTaxaSelector, e,
          arrayOfSelectors)

      }
    )

  /**
   * Event that assures that only one of the selectors are used at once
   */
  $("#resResfinderList2, #resCardList2")
    .on("changed.bs.select", (e) => {

        const arrayOfSelectors = ["resResfinderList2", "resCardList2"]

        lastResSelector = controlFiltersSameLevel(lastResSelector, e,
          arrayOfSelectors)
      }
    )

  //* ******************//
  //* ***Taxa Filter****//
  //* ******************//

  /**
   * Button event that clears the current taxa selected in taxaModal.
   */
  $("#taxaModalClear").unbind("click").bind("click", (event) => {

    event.preventDefault()

    // resets all the entries for this paragraphs in the html
    const idsArrays = ["p_Order", "p_Family", "p_Genus", "p_Species"]
    resetDisplayTaxaBox(idsArrays)

    // resets dropdown selections
    $("#orderList").selectpicker("deselectAll")
    $("#familyList").selectpicker("deselectAll")
    $("#genusList").selectpicker("deselectAll")
    $("#speciesList").selectpicker("deselectAll")

    previousTableList = []

    // transform selector object that handles plots and hide their
    // respective divs
    Object.keys(selector).map( (el) => { selector[el].state = false })

    hideAllOtherPlots()
    // sets area selection to false
    areaSelection = false
  })


  /**
   * Button event that displays into the network the selected taxa. It fires an
   * a query to the psql database to request the selected taxa
   */
  $("#taxaModalSubmit").unbind("click").bind("click", (event) => {

    event.preventDefault()
    // resets the length sliders
    $("#reset-sliders").click()

    legendIndex = 0

    selectedFilter = "taxa"

    /**
     * Checks if more than one taxa level is selected at once
     * @type {number}
     */
    let i = 0

    pageReRun = false

    // clear legend from reads
    $("#readString").empty()
    $("#readLegend").empty()
    $("#read_label").hide()
    $("#fileNameDiv").hide()

    // changed nodes is reset every instance of taxaModalSubmit button
    listGiFilter = []   // makes listGiFilter an empty array

    //clears nodes
    nodeColorReset(graphics, g, nodeColor, renderer)

    // now processes the current selection
    const speciesQuery = document.getElementById("p_Species").innerHTML,
      genusQuery = document.getElementById("p_Genus").innerHTML,
      familyQuery = document.getElementById("p_Family").innerHTML,
      orderQuery = document.getElementById("p_Order").innerHTML

    let selectedSpecies = speciesQuery.replace("Species:", "").split(",").filter(Boolean),
      selectedGenus = genusQuery.replace("Genus:", "").split(",").filter(Boolean),
      selectedFamily = familyQuery.replace("Family:", "").split(",").filter(Boolean),
      selectedOrder = orderQuery.replace("Order:", "").split(",").filter(Boolean)

    // remove first char from selected* arrays
    selectedSpecies = removeFirstCharFromArray(selectedSpecies)
    selectedGenus = removeFirstCharFromArray(selectedGenus)
    selectedFamily = removeFirstCharFromArray(selectedFamily)
    selectedOrder = removeFirstCharFromArray(selectedOrder)

    //* *** Alert for taxa filter ****//

    const alertArrays = {
      "order": selectedOrder,
      "family": selectedFamily,
      "genus": selectedGenus,
      "species": selectedSpecies
    }

    const divAlert = document.getElementById("alertId")

    // checks if any selection was made
    for (const i in alertArrays) {

      if (alertArrays.hasOwnProperty(i)) {

        if (alertArrays.order.length === 0 &&
          alertArrays.family.length === 0 &&
          alertArrays.genus.length === 0 &&
          alertArrays.species.length === 0) {

          divAlert.style.display = "block"

        }
      }
    }

    // auto hide after 5 seconds without closing the div
    window.setTimeout( () => { $("#alertId").hide() }, 5000)

    //* *** End Alert for taxa filter ****//

    // renders the graph for the desired taxon if more than one taxon type is
    // selected
    let storeLis = "" // a variable to store all <li> generated for legend


    previousTableList = []
    // transform selector object that handles plots and hide their
    // respective divs
    Object.keys(selector).map( (el) => { selector[el].state = false })
    hideAllOtherPlots()
    areaSelection = false

    $("#slideLegendLeft, #slideLegendRight").prop("disabled", false)

    // empties all other legends legend
    $("#pf_label, #res_label, #vir_label, #metal_label, #advanced_label, " +
      "#read_label, #fileNameDiv").hide()
    $("#colorLegendBoxPf, #colorLegendBoxRes, #colorLegendBoxMetal," +
      " #colorLegendBoxVir, #colorLegendBoxAdvanced, #readString, " +
      "#readLegend").empty()

    showDiv().then( () => {
      $("#loadingInfo").html("Fetching selected taxa...")
      iterateArrays(g, graphics, renderer, alertArrays, storeLis, i)
    })

  })

  //* *********************//
  //* * Distances filter **//
  //* *********************//

  /**
   * Button event that allows to highlight links with different colors,
   * according with the mash distances calculated for the differences between
   * each node.
   */
  $("#distancesSubmit").unbind("click").bind("click", (event) => {
    event.preventDefault()

    $("#scaleLegend").empty()
    showDiv().then( () => {
      $("#loadingInfo").html("Coloring links by distance... this may take a " +
        "while.")
      linkColoring(g, graphics, renderer, "distance", false)
    })
    const readMode = false
    colorLegendFunction(readMode)
  })

  //**************************//
  //* LENGTH EVENT LISTENERS *//
  //**************************//

  /**
   * Button event to submit current selection to the network if enter key is
   * not clicked for any reason by the user. This will basically force the
   * network to be updated after click. This event will force the slider to be
   * updated and therefore the visualization of the selected nodes.
   */
  $("#lengthSubmit").unbind("click").bind("click", () => {
    slider.noUiSlider.set([Math.log(inputs[0].valueAsNumber), Math.log(inputs[1].valueAsNumber)])
  })

  /**
   * Event listener for "enter" key to update the slider and the graph. This
   * event will force the slider to be updated and therefore the visualization
   * of the selected nodes
   */
  inputMin.addEventListener("keyup", (event) => {
    // Cancel the default action, if needed
    event.preventDefault()
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
      slider.noUiSlider.set([Math.log(inputs[0].valueAsNumber), Math.log(inputs[1].valueAsNumber)])
    }
  })

  //**************//
  //* RATIO SIZE *//
  //**************//

  /**
   * Function that submits the selection made in the size ratio modal, in order
   * to highlight the selected links in the desired color or remove the links
   * that are not in the selected range.
   */
  $("#ratioSubmit").unbind("click").bind("click", (e) => {

    e.preventDefault()

    const toggleRatioStatus = $("#toggleRatio").prop("checked")

    // clears all links before doing this
    $("#reset-links").click()
    $("#scaleLegend").empty()

    showDiv().then( () => {
      $("#loadingInfo").html("Coloring links by size ratio... this may take " +
        "a while.")
        linkColoring(g, graphics, renderer, "size", toggleRatioStatus)
      }
    )
  })

  //**************//
  //* SHARED HASHES *//
  //**************//

  /**
   * Button event to submit the query for the links that present a given
   * threshold of shared hashes between two plasmids. This may function as a
   * proxy of the sequence overlap between the two plasmids.
   */
  $("#hashSubmit").unbind("click").bind("click", (e) => {

    e.preventDefault()

    const toggleRatioStatus = $("#toggleHash").prop("checked")

    $("#reset-links").click()
    $("#scaleLegend").empty()

    showDiv().then( () => {
      $("#loadingInfo").html("Coloring links by shared sequence... this may " +
        "take a while.")
      removeBasedOnHashes(g, graphics, renderer, toggleRatioStatus)
      }
    )
  })

  //* ************//
  //* ***READS****//
  //* ************//

  /**
   * Event for submit mapping files. It just sets fileMode to mapping and then
   * everything else is done within the redundancy removal buttons
   * (redundancyNo and redundancyYes).
   */
  $("#fileSubmit").unbind("click").bind("click", (event) => {
    event.preventDefault()
    fileMode = "mapping"
  })

  /**
   * Event listener for when the user selects not to remove redundancy from
   * the imported results
   */
  $(".redundancyNo").unbind("click").bind("click", (event) => {
    event.preventDefault()

    // empty requests modal dropdown
    $("#sampleDropdownRequests").find("option").remove().end()
      .selectpicker("refresh")

    // asserts which dict to use
    const queryFileJson = (mashJson) ? mashJson :
      (assemblyJson) ? assemblyJson :
        (consensusJson) ? consensusJson :
          readFilejson

    // starts an array that stores all the promises made.
    let promises = []

    // re-assigns readFilejson to an object avoid it to be false
    readFilejson = {}

    // first build readFilejson object
    Object.keys(queryFileJson).map( (fileName) => {
      const fileString = (typeof queryFileJson[fileName] === "string") ?
        JSON.parse(queryFileJson[fileName]) : queryFileJson[fileName]
      readFilejson[fileName] = fileString
      promises.push(fileName)
    })

    // once all promises are generated, nodes can be colored
    Promise.all(promises).then( async () => {
      await mappingHighlight(g, graphics, renderer)
      // asks if the user wants to filter results or not, prompting a new modal
      await $("#reRunModalResults").modal("show")
    })

  })

  /**
   * Event listener for when the user wants to remove redundant results from
   * the imported results.
   */
  $(".redundancyYes").unbind("click").bind("click", (event) => {

    event.preventDefault()

    // empty requests modal dropdown
    $("#sampleDropdownRequests").find("option").remove().end()
      .selectpicker("refresh")

    // initiates empty object that will store the final filtered JSON object
    // that will display the colors
    let parsedReadFileJson = {}

    // starts an array that stores all the promises made.
    let promises = []

    // list that stores all the removed nodes from parsedReadFileJson
    let blackList = []

    // asserts which dict to use
    const queryFileJson = (mashJson) ? mashJson :
      (assemblyJson) ? assemblyJson :
        (consensusJson) ? consensusJson :
          readFilejson
    
    Object.keys(queryFileJson).map( (fileName) => {
      // variable that fetches the object associated with each file
      const fileString = (typeof queryFileJson[fileName] === "string") ?
        JSON.parse(queryFileJson[fileName]) : queryFileJson[fileName]
      // the variable that stores the dictionary of accessions and respective
      // values from imported results
      const currentDict = Object.keys(fileString)

      parsedReadFileJson[fileName] = {}

      currentDict.map( (acc) => {

        /**
         * The result of the approach being imported to that accession number.
         * It is a number for mapping but for mash screen and assembly it is an
         * array.
         */
        const currentNodePerc = fileString[acc]

        // if check to check if file import has the proper accessions
        if (g.getLinks(acc)) {
          // if node has no links add it instantly
          if (g.getLinks(acc).length === 0) {

            parsedReadFileJson[fileName][acc] = currentNodePerc
            promises.push(acc)

          } else {

            promises.push(acc)

            // but if it has links... check if they are redundant
            g.forEachLinkedNode(acc, (linkedNode, link) => {

              if (currentDict.includes(linkedNode.id)) {

                /**
                 * The result of the approach being imported for the linked
                 * accession number. It is a number for the mapping but for mash
                 * screen and assembly it is an array.
                 */
                const linkedNodePerc = fileString[linkedNode.id]

                // gets linked node length in log scale
                const linkedNodeLength = linkedNode.data.logLength

                // gets the current node length in log scale
                const currentNodeLenght = g.getNode(acc).data.logLength

                /**
                 * Start calc variable in order to be used universally between all
                 * fileModes.
                 */
                let calc

                if (fileMode === "mapping") {

                  /** calculates the difference between the node length times the
                   * node mapping percentage between the currentNode and its
                   * linkedNodes
                   */
                  calc = currentNodeLenght * currentNodePerc -
                    linkedNodeLength * linkedNodePerc

                } else if (fileMode === "mash_screen") {
                  /**
                   * Variable that fetches the mash screen identity value from
                   * the array of objects that each accession number for the
                   * linkedNode has in the input files
                   */
                  const linkedNodeId = linkedNodePerc[0]

                  /**
                   * Variable that fetches the mash screen identity value from
                   * the array of objects that each accession number for the
                   * currentNode being cycled by forEachLinkedNode function
                   * has in the input files.
                   */
                  const currentNodeId = currentNodePerc[0]

                  /**
                   * Calculates the difference between the node length times the
                   * node mash screen identity between the currentNode and its
                   * linkedNodes
                   */
                  calc = currentNodeLenght * currentNodeId -
                    linkedNodeLength - linkedNodeId


                } else if (fileMode === "assembly") {

                  /**
                   * Variable that fetches the mash dist identity (1-distance)
                   * value from the array of objects that each accession number
                   * for the linkedNode has in the input files
                   */
                  const linkedNodeID = linkedNodePerc[0]

                  /**
                   * Variable that fetches the mash dist identity (1-distance)
                   * value from the array of objects that each accession number
                   * for the currentNode being cycled by forEachLinkedNode
                   * function has in the input files.
                   */
                  const currentNodeID = currentNodePerc[0]

                  /**
                   * variable that fetches the number of shared hashes between
                   * the queried sequences and the accession of the plasmid in db
                   * for the linked node being compared here.
                   */
                  const linkedNodeHashes = linkedNodePerc[1]

                  /**
                   * variable that fetches the number of shared hashes between the
                   * queried sequences and the accession of the plasmid in db
                   * for the currentNode.
                   */
                  const currentNodeHashes = currentNodePerc[1]

                  calc = currentNodeID * currentNodeHashes * currentNodeLenght -
                    linkedNodeID * linkedNodeHashes * linkedNodeLength

                }

                // adds node if it is better or equally likely to be the correct
                // plasmid
                if (calc >= 0) {

                  // if currentNode is a better hit but linkedNode is already in dict
                  if (Object.keys(parsedReadFileJson[fileName]).includes(linkedNode.id)
                    && calc > 0) {
                    // remove this accession from the entries in parsedReadFileJson
                    delete parsedReadFileJson[fileName][linkedNode.id]

                  }

                  // if calc is >0 then linkedNode.id should never be added. If
                  // a equally probable node exists it will not be linked to this
                  // acc because of the default behavior of vivagraph
                  // forEachLinkedNode function.
                  if (!blackList.includes(linkedNode.id)) {
                    blackList.push(linkedNode.id)
                  }

                  // if it is major or equal to the linkedNode then add it to the library
                  // if it is minor then the linkedNode will be added in another iteration
                  if (!blackList.includes(acc)) {
                    parsedReadFileJson[fileName][acc] = currentNodePerc
                  } else {
                    // if the calc value is negative then that node must be
                    // excluded from the final results.
                    delete parsedReadFileJson[fileName][acc]
                    if (!blackList.includes(acc)) {
                      blackList.push(acc)
                    }
                  }
                }
              }
            })
          }
        }
      })
    })

    // assures that all promises are fulfilled before executing everything else
    Promise.all(promises).then( async () => {
      readFilejson = parsedReadFileJson
      await mappingHighlight(g, graphics, renderer)
      // then asks if the user wants to filter the current selection or not
      // and how
      await $("#reRunModalResults").modal("show")
    })
  })

  /**
   * Event listener to cancel the reading of the file. This will empty the div
   * with the text for the file selection.
   */
  $("#cancel_infile").unbind("click").bind("click", () => {
    readFilejson = abortRead("file_text")
  })

  /**
   * Function that will load results for mapping approach as an example so that
   * users may have an example without importing any real data.
   */
  $("#sampleMapping").unbind("click").bind("click", (event) => {
    event.preventDefault()
    masterReadArray = []
    assemblyJson = false

    resetAllNodes(graphics, g, nodeColor, renderer)
    previousTableList = []
    // transform selector object that handles plots and hide their
    // respective divs
    Object.keys(selector).map( (el) => { selector[el].state = false })
    hideAllOtherPlots()
    areaSelection = false

    showDiv().then( () => {
      $("#loadingInfo").html("Loading sample data...")
      getArrayMapping().done( (result) => {
        // puts to readFilejson object that may store many files
        readFilejson = {
          "mapping_sample1": result
        }
        const outLists = readColoring(g, listGi, graphics, renderer, result)
        listGi = outLists[0]
        listGiFilter = outLists[1]
        masterReadArray = pushToMasterReadArray(readFilejson)

        hideDivsFileInputs()
      })
    })
  })

  //* ************//
  //* ***MASH SCREEN****//
  //* ************//

  /**
   * Event handler for mash submit. sets fileMode to mash_screen
   */
  $("#fileSubmit_mash").unbind("click").bind("click", (event) => {
    event.preventDefault()
    fileMode = "mash_screen"
  })


  /**
   * Event handler to cancel the import of mash_screen file
   */
  $("#cancel_infile_mash").unbind("click").bind("click", () => {
    mashJson = abortRead("file_text_mash")
  })

  /**
   * Event handler to import sample results for mash_screen
   */
  $("#sampleMash").unbind("click").bind("click", (event) => {
    event.preventDefault()
    masterReadArray = []
    assemblyJson = false
    // readIndex will be used by slider buttons
    //readIndex = 0
    resetAllNodes(graphics, g, nodeColor, renderer)
    previousTableList = []
    // transform selector object that handles plots and hide their
    // respective divs
    Object.keys(selector).map( (el) => { selector[el].state = false })
    hideAllOtherPlots()
    areaSelection = false

    showDiv().then( () => {
      $("#loadingInfo").html("Loading sample data...")
      getArrayMash().done( (result) => {
        // puts to readFilejson object that may store many files
        mashJson = {
          "mash_sample1": result
        }
        readFilejson = mashJson
        const outLists = readColoring(g, listGi, graphics, renderer, result)
        listGi = outLists[0]
        listGiFilter = outLists[1]
        masterReadArray = pushToMasterReadArray(mashJson)

        hideDivsFileInputs()
      })
    })

  })

  //* ********* ***//
  //* * Assembly **//
  //* ********* ***//

  /**
   * Event handler to import assembly results. It sets fileMode to assembly
   */
  $("#assemblySubmit").unbind("click").bind("click", (event) => {
    event.preventDefault()
    fileMode = "assembly"
  })

  /**
   * Event handler to cancel the import of assembly
   */
  $("#cancel_assembly").unbind("click").bind("click", () => {
    assemblyJson = abortRead("assembly_text")
  })

  /**
   * Added sample assembly data for demonstration purposes.
   */
  $("#sampleAssembly").unbind("click").bind("click", (event) => {
    event.preventDefault()
    masterReadArray = []
    readFilejson = false
    resetAllNodes(graphics, g, nodeColor, renderer)
    previousTableList = []
    // transform selector object that handles plots and hide their
    // respective divs
    Object.keys(selector).map((el) => {
      selector[el].state = false
    })
    hideAllOtherPlots()
    areaSelection = false
    showDiv().then(() => {
      $("#loadingInfo").html("Loading sample data...")
      getArrayAssembly().then((results) => {
        readFilejson = assemblyJson = results
        const readString = Object.values(results)[0]
        fileChecks(readString)
        $("#fileNameDiv").html(`Current sample: ${Object.keys(readFilejson)[0]}`)
          .show()
        const outputList = readColoring(g, listGi, graphics, renderer, readString)
        listGi = outputList[0]
        listGiFilter = outputList[1]
        masterReadArray = pushToMasterReadArray(assemblyJson)

        hideDivsFileInputs()

      })

    })
  })

  //* ********* ***//
  //* * Consensus **//
  //* ********* ***//

  /**
   * Added event listener for consensus file imports submit button.
   */
  $("#consensusSubmit").unbind("click").bind("click", (event) => {
    event.preventDefault()
    // if consensusJson is differnt from false it means that the file has
    // already been loaded.
    if (consensusJson !== false) {
      fileMode = "consensus"
      const readString = JSON.parse(Object.values(consensusJson)[0])
      fileChecks(readString)
      $("#fileNameDiv").html(`Current sample: ${currentSample}`)
        .show()
      masterReadArray = []
      readFilejson = consensusJson
      resetAllNodes(graphics, g, nodeColor, renderer)
      previousTableList = []
      // transform selector object that handles plots and hide their
      // respective divs
      Object.keys(selector).map( (el) => { selector[el].state = false })
      hideAllOtherPlots()
      areaSelection = false
      showDiv().then( () => {
        $("#loadingInfo").html("Loading data...")
        const outputList = readColoring(g, listGi, graphics, renderer, readString)
        listGi = outputList[0]
        listGiFilter = outputList[1]

        // adds read queries to the typeOfProject
        typeOfProject["consensus"] = consensusJson

        masterReadArray = pushToMasterReadArray(consensusJson)

        hideDivsFileInputs()

      })

    } else {
      // alert user that file may be empty or there is no imported file at all
      fileChecks(consensusJson)
    }
  })

  /**
   * Event linstener to cacel the import of consensus files
   */
  $("#cancel_consensus").unbind("click").bind("click", () => {
    consensusJson = abortRead("consensus_text")
  })

  //***********************//
  //* SIDE BAR CONTROLS *//
  //*********************//

  /**
   * Function that controls the behavior of the side bar menu, collapsing the
   * buttons that are not in use when other collapsible is clicked
   */
  $("#collapseGroup").on("show.bs.collapse",".collapse", () => {
    $("#collapseGroup").find(".collapse.in").collapse("hide")
  })

  //***********************//
  //* TOP NAV BAR BUTTONS *//
  //***********************//

  /**
   * Button that toggles the side menu
   */
  $("#menu-toggle").on("click", function() {
    if (firstClickMenu === true) {
      $("#menu-toggle").css( {"color": "#fff"} )
      firstClickMenu = false
    } else {
      $("#menu-toggle").css( {"color": "#999999"} )
      firstClickMenu = true
    }
  })

  /**
   * Button event that resets the colors on each node
   */
  $("#reset-sliders").unbind("click").bind("click", () => {

    listGiFilter = [] //resets listGiFilter
    previousTableList = []

    areaSelection = false
    readFilejson = false // makes file selection empty again
    assemblyJson = false
    mashJson = false
    currentQueryNode = false
    slider.noUiSlider.set(sliderMinMax)
    resetAllNodes(graphics, g, nodeColor, renderer)
    previousTableList = []
    // transform selector object that handles plots and hide their
    // respective divs
    Object.keys(selector).map( (el) => { selector[el].state = false })

    $("#slideLegendLeft, #slideLegendRight").prop("disabled", true)
    $("#fileNameDiv").hide()

    hideAllOtherPlots()
  })

  $("#noRunRequests").unbind("click").bind("click", (e) => {
    // if the page is in filter mode trigger the go back function,
    // otherwise just dismiss the modal
    if (firstInstace === false) {
      $("#go_back").click()
    }
  })


  /**
   * Buttons that run the re run operation for the selected nodes. if reRunYes
   * button is clicked then each selected node as well as their closest links
   * will be saved to a new display (filtered network). However, if reRunNo
   * is clicked only the selected nodes will be displayed in the filtered
   * network.
   */
  $("#reRunYes, #reRunNo, #reRunYesRequests, #reRunNoRequests").unbind("click")
    .bind("click", (e) => {

    $("#noRunRequests").hide()

    centralNode = false

    getLinkedNodes = (e.target.id.includes("reRunYes"))

    // resets areaSelection
    areaSelection = false
    firstInstace = false

    reloadAccessionList = []  // needs to be killed every instance in
    // order for reload to allow reloading again

    //* * Loading Screen goes on **//
    showDiv().then( () => {
      $("#loadingInfo").html("Filtering plasmid network for the requested " +
        "plasmids...")

      actualRemoval(g, graphics, onLoad, false)

    })
  })


  /**
   * Button that allows to return to the initial tree by reloading the page
   */
  $("#go_back").unbind("click").bind("click", () => {

    areaSelection = false
    firstInstace = true
    pageReload = true
    blockFilterModal = false
    list = []
    listGi = []
    listLengths = []
    listGiFilter = []
    reloadAccessionList = []

    $("#noRunRequests").show()
    $("#fileNameDiv").hide()

    resetAllNodes(graphics, g, nodeColor, renderer)

    showDiv().then( () => {
      $("#loadingInfo").html("Loading full plasmid network...")
      // removes nodes and forces adding same nodes
      setTimeout( () => {
        actualRemoval(g, graphics, onLoad, true)
      }, 100)
    })
  })


  /**
   * Button that opens the stasModal in the default species plot.
   */
  $("#plotButton").unbind("click").bind("click", () => {
    $("#modalPlot").modal()
    clickerButton = "species"
    $("#sortGraph, #sortGraphAlp").removeAttr("disabled")
    listGiFilter = (reloadAccessionList.length !== 0) ?
      // reduces listGiFilter to reloadAccessionList
      listGiFilter.filter( (n) => reloadAccessionList.includes(n)) :
      // otherwise maintain listGiFilter untouched
      listGiFilter
    setTimeout( () => {
      listPlots = repetitivePlotFunction(g, graphics, renderer, areaSelection, listGiFilter, clickerButton)
    }, 500)
  })


  /**
   * Button that opens heatmap modal, for currently imported files.
   */
  $("#heatmapButtonTab").unbind("click").bind("click", () => {
    $("#heatmapModal").modal()

    heatmapMaker(g, masterReadArray, readFilejson)
  })


  /**
   * Button that opens the table modal
   */
  $("#tableShow").unbind("click").bind("click", () => {
    $("#tableModal").modal()
    showDiv()
      .then( () => {
        $("#loadingInfo").html("Preparing table data...")
        previousTableList = makeTable(areaSelection, listGiFilter,
          previousTableList, g, graphics, graphSize)
      })
  })


  $("#requestModalShow").unbind("click").bind("click", () => {
    $("#importRequest").modal()
  })

  /**
   * Button that fires the download of the current selection of nodes
   */
  $("#download_ds").unbind("click").bind("click", (e) => {
    e.preventDefault()
    // for now this is just taking what have been changed by taxa coloring
    if (areaSelection === true) {
      // downloads if area selection is triggered
      downloadSeqByColor(g, graphics)
    } else {
      // downloads when listGiFilter is defined, namely in taxa filters,
      // mapping results
      downloadSeq(listGiFilter)
    }
  })


  /**
   * Button that resets the color of all links to the default color.
   */
  $("#reset-links").unbind("click").bind("click", (event) => {
    event.preventDefault()
    const arrayOfDivs = [
      $("#colorLegendBox, #colorLegendBoxRes, #colorLegendBoxPf, " +
        "#colorLegendBoxMetal, #colorLegendBoxVir, #readLegend, " +
        "#assemblyLegend").html(),

    ]
    let divCounter = 0
    for (const div of arrayOfDivs) {
      if (div === "") {
        divCounter += 1
        if (divCounter === 5) {
          $("#colorLegend").hide()
        }
      }
    }
    $("#scaleLegend, #scaleString").empty()
    $("#distance_label").hide()
    setTimeout(function () {
      resetLinkColor(g, graphics, renderer)
    }, 100)
  })


  /**
   * Button that searches for a given plasmid or accession number in the graph
   * network. It uses for that search the input box near to the button.
   */
  $("#submitButton").unbind("click").bind("click", async (event) => {
    event.preventDefault()    // prevents page from reloading

    $("#closePop").click()

    if (toggleStatus === false) {
      // executed when searching the accession number
      const formvalueId = $("#formValueId").val()
      const query = (formvalueId === "") ? clickedHighchart :
        formvalueId.replace(".", "_")

      currentQueryNode = await centerToggleQuery(g, graphics, renderer, query,
        currentQueryNode)
    } else {
      // executed for plasmid search
      currentQueryNode = await toggleOnSearch(g, graphics, renderer,
          currentQueryNode)
      // then is here used to parse the results from async/await function
    }

    setTimeout(() => { renderer.rerender() }, 0)

  })

  /**
   * Button that clears the form to search for plasmid name or accession number.
   */
  $("#clearButton").unbind("click").bind("click", () => {
    document.getElementById("formValueId").value = ""
  })

  //*****************//
  //* POPUP BUTTONS *//
  //*****************//

  /**
   * Button that closes the popup that is opened each time a plasmid/node is
   * clicked.
   */
  $("#closePop").unbind("click").bind("click", () => {
    // make tab divs inactive
    $("#resTab, #pfTab, #virTab, #metalTab").removeClass("active")
    // make buttons inactive
    $("#plasmidButton, #metalButton, #virButton, #resButton")
      .removeClass("active")
    $("#popup_description").hide()

    clickedPopupButtonCard = false
    clickedPopupButtonFamily = false
    clickedPopupButtonVir = false
    clickedPopupButtonMetal = false

    // when the popup is closed the plot with the annotations should be hidden
    $("#resistancePopupPlot").hide()
    xRangePlotList = []

    if (currentQueryNode !== false) {
      graphics.getNodeUI(currentQueryNode).color = graphics.getNodeUI(currentQueryNode).backupColor
    }
    currentQueryNode = false
    renderer.rerender()
  })

  /**
   * Button that downloads a csv file with all the metadata available through
   * the popup
   */
  $("#downloadCsv").unbind("click").bind("click", () => {
    // execute the same replacement function for all this divs
    const targetArray = quickFixString([
      "#accessionPop",
      "#speciesNamePop",
      "#lengthPop",
      "#plasmidNamePop",
      "#clusterIdPop",
      "#percentagePop",
      "#percentagePopMash",
      "#copyNumberPop",
      "#percentagePopMashDist",
      "#hashPop",
      "#contigPop",
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
      "#virPop",
      "#virGenePop",
      "#virGenbankPop",
      "#virCoveragePop",
      "#virIdentityPop",
      "#virRangePop",
      "#virPop",
      "#virGenePop",
      "#virGenbankPop",
      "#virCoveragePop",
      "#virIdentityPop",
      "#virRangePop",
      "#metalPop",
      "#metalGenePop",
      "#metalGenbankPop",
      "#metalCoveragePop",
      "#metalIdentityPop",
      "#metalRangePop"
    ])
    // then convert the resulting array to a csv file
    arrayToCsv(targetArray)
  })

  /**
   * Event to center on the popup node
   */
  $("#centerNodePopup").unbind("click").bind("click", () => {
    const popupAccession = $("#accessionPop a").html()
    recenterDOM(renderer, layout, [popupAccession])
  })

  /**
   * Button that controls the display of the resistance information in the popup
   */
  $("#resButton").unbind("click").bind("click", () => {
    if (clickedPopupButtonCard === false) {
      clickedPopupButtonCard = resGetter(currentQueryNode)
    }
  })

  /**
   * Button that controls the display of the plasmid finder information
   * in the popup
   */
  $("#plasmidButton").unbind("click").bind("click", () => {
    if (clickedPopupButtonFamily === false) {
      clickedPopupButtonFamily = plasmidFamilyGetter(currentQueryNode)
    }
  })

  /**
   * Button that controls the display of the virulence information in the popup
   */
  $("#virButton").unbind("click").bind("click", () => {
    if (clickedPopupButtonVir === false) {
      clickedPopupButtonVir = virulenceGetter(currentQueryNode)
    }
  })

  /**
   * Button that controls the display of the metal resistance information
   * in the popup
   */
  $("#metalButton").unbind("click").bind("click", () => {
    if (clickedPopupButtonMetal === false) {
      clickedPopupButtonMetal = metalGetter(currentQueryNode)
    }
  })

  //************************************//
  //**** BUTTONS THAT CONTROL PLOTS ****//
  //************************************//

  /**
   * Button that opens statsModal in the required plot instead of the default
   * species plot.
   */
  $("#genusStats, #speciesStats, #familyStats, #orderStats," +
    " #resistanceStats, #pfamilyStats, #virStats, #clusterStats, " +
    "#lengthStats, #metalStats").unbind("click").bind("click", (event) => {
    // this gets the clicked selector, gets its html, converts it to lower
    // case and trims for white spaces and new line chars
    clickerButton = $(event.target).html()
      .toLowerCase()
      .trim()
      .replace(" ", "")

    // checks if metal button is clicked and if so change the clickerButton
    // to 'metal'
    clickerButton = (clickerButton.includes("metal")) ? "metal" : clickerButton

    if (event.target.id === "lengthStats") {
      $("#sortGraph, #sortGraphAlp").attr("disabled", true)
    } else {
      $("#sortGraph, #sortGraphAlp").attr("disabled", false)
    }

    // assures that the modal is opened before triggering the function
    setTimeout( () => {
      listPlots = repetitivePlotFunction(g, graphics, renderer, areaSelection, listGiFilter, clickerButton)
    }, 500)
  })

  /**
   * Button that trigger the event to sort the graph by values (descending
   * order)
   */
  $("#sortGraph").unbind("click").bind("click", () => {

    const sortVal = true
    selector[clickerButton.replace(" ", "")].state = false
    const listPlotsType = selector[clickerButton.replace(" ", "")].listPlots
    const layoutPlot = layoutGet(clickerButton)

    if (listPlotsType) { statsParser(g, graphics, renderer, false,
      listPlotsType, layoutPlot, clickerButton, false, sortVal, associativeObj)
    }
  })

  /**
   * Button that trigger the event to sort the graph alphabetically
   */
  $("#sortGraphAlp").unbind("click").bind("click", () => {
    const sortAlp = true
    selector[clickerButton.replace(" ", "")].state = false
    const listPlotsType = selector[clickerButton.replace(" ", "")].listPlots
    const layoutPlot = layoutGet(clickerButton)

    if (listPlotsType) { statsParser(g, graphics, renderer, false,
      listPlotsType, layoutPlot, clickerButton, sortAlp, false, associativeObj)
    }
  })

  //**********************************************************//
  // BUTTONS INSIDE PLOT MODAL THAT ALLOW TO SWITCH B/W PLOTS //
  //**********************************************************//

  /**
   * Event for the dropdown available in statsPlot Modal, allowing to quickly
   * switch between different types of plots
   */
  $("#statsList").on("changed.bs.select", (e) => {

    // fetches the target option being selected in the dropdown
    const selectedTarget = $(`#${e.target.id}`).selectpicker("val")
      .toLowerCase()

    // assigns to clickerButton the appropriate entry for the parsers in
    // repetitivePlotFunction
    clickerButton = (selectedTarget === "plasmidfinder") ? "plasmidfamilies" :
      (selectedTarget === "biocide & metal") ? "metal" : selectedTarget

    // controls if the two sort buttons should be enabled or not
    if (clickerButton === "length") {
      $("#sortGraph, #sortGraphAlp").attr("disabled", true)
    } else {
      $("#sortGraph, #sortGraphAlp").attr("disabled", false)
    }

    // generates the plot itself
    listPlots = repetitivePlotFunction(g, graphics, renderer, areaSelection,
      listGiFilter, clickerButton)

  })

  //************************************************//
  //**** BUTTONS THAT CONTROL VIVAGRAPH DISPLAY ****//
  //************************************************//

  // Buttons to control force play/pause using bootstrap navigation bar

  /**
   * variable that controls if the current visualization of the vivagraph
   * force layout is paused or not
   * @type {boolean}
   */
  let paused = true

  /**
   * Button event that pauses or plays the force layout into vivagraph network.
   */
  $("#playpauseButton").unbind("click").bind("click", () => {
    $("#playpauseButton").empty()
    if (paused === true) {
      renderer.resume()
      $("#playpauseButton").append("<span class='glyphicon glyphicon-pause'></span>")
        .removeClass("btn-default").addClass("btn-success")
      paused = false
    } else {
      renderer.pause()
      $("#playpauseButton").append("<span class='glyphicon glyphicon-play'></span>")
        .removeClass("btn-success").addClass("btn-default")
      paused = true
    }
  })

  //***ZOOMING***//

  /**
   * Button that enables zooming in into vivagraph canvas
   */
  $("#zoom_in").unbind("click").bind("click", (event) => {
    event.preventDefault()
    renderer.zoomIn()
    renderer.rerender()   // rerender after zoom avoids glitch with
    // duplicated nodes
  })

  /**
   * Button that enables zooming out into vivagraph canvas
   */
  $("#zoom_out").unbind("click").bind("click", (event) => {
    event.preventDefault()
    renderer.zoomOut()
    renderer.rerender()   // rerender after zoom avoids glitch with
    // duplicated nodes
  })

  /*** MULTI-SELECTION ***/

  /**
   * Button that enable the multiselection overlay through the shift key and
   * mouse dragging.
   */
  $("#refreshButton").unbind("click").bind("click", () => {

    // if shift key is allowed then change it
    if (freezeShift === false) {

      freezeShift = true
      $("#refreshButton").removeClass("btn-success").addClass("btn-default")

      // if this variable is indefined then doesn't attempt to destroy it
      if (multiSelectOverlayObj !== false) {
        multiSelectOverlayObj = false
      }

      // if shift key is frozen (let it go let it goooo)
    } else {

      freezeShift = false
      $("#refreshButton").removeClass("btn-default").addClass("btn-success")

    }
  })

  /**
   * Function to center the graph in the current central node, the node with
   * more links.
   */
  $("#center_graph").unbind("click").bind("click", () => {
    showDiv().then( async () => {
      $("#loadingInfo").html("Centering in plasmid with most links...")
      await getCentralNode(g)
      await recenterDOM(renderer, layout, [centralNode])
      $("#loading").hide()
    })
  })

  /**
   * Closes requests modal
   */
  $("#closeRequestModal").unbind("click").bind("click", () => {
    $(".redundancyNo").click()
  })

  /**
   * Closes re run modal
   */
  $("#closeReRunModal").unbind("click").bind("click", () => {
    $(".noRunRequests").click()
  })

  /** control the visualization of multiple files for read mode
   * The default idea is that the first file in this readFilejson object is the
   * one to be loaded when uploading then everything else should use cycler.
   * This button allows to slide to the rightmost or leftmost file.
   */
  $("#slideRight, #slideLeft").unbind("click").bind("click", (e) => {
    resetAllNodes(graphics, g, nodeColor, renderer)
    previousTableList = []
    // transform selector object that handles plots and hide their
    // respective divs
    Object.keys(selector).map( (el) => { selector[el].state = false })
    hideAllOtherPlots()
    areaSelection = false

    // checks the target button before sliding right or left

    showDiv().then( () => {
      const outArray = (e.currentTarget.id === "slideRight") ?
        slideToRight(readFilejson, g, listGi, graphics, renderer) :
        slideToLeft(readFilejson, g, listGi, graphics, renderer)

      currentSample = Object.keys(readFilejson)[outArray[0]]
      listGiFilter = outArray[1][1]
      listGi = outArray[1][0]

      // updates the dropdown in the import modal
      selectSampleDropdownProgrammatically()
    })
  })

  // this forces the entire script to run
  init() //forces main json or the filtered objects to run before
  // rendering the graph

  /**
   * function for keyboard shortcut to save file with node positions
   * This is only useful if devel is true and should be disabled by default
   * for users. This is something used by developers only
   */
  Mousetrap.bind("shift+ctrl+space", () => {
    initCallback(g, layout, devel)
  })

  /**
   * This synchronizes div that are used to set the cutoff values, either they
   * are provided through import file menus or through the import request view.
   */
  $(".cutoffValue, .copyNumberValue, .cutoffValueMash, .cutoffHashSeq, " +
    ".cutoffValueSeq").keyup( (e) => {
    // this fetches the class, however it assumes that it is the last element
    // present in the html class attribute
    const currentClass = e.target.className.split(" ").slice(-1)[0]
    // this fetches the current target value
    const changedValue = e.target.value
    // then updates all forms that have the current class with the value being
    // set in one of the forms that has the class attr.
    $(`.${currentClass}`).val(changedValue)
  })

} // closes onload
