/*globals showRerun */
/**
 * Function that initiates the graph rendering and that contains everything
 * that interacts with graph via webgl.
 * @param {Object} graphics - vivagraph functions related with node and link
 * data.
 */
const renderGraph = (graphics) => {
  //const graphics = Viva.Graph.View.webglGraphics()
  //** block #1 for node customization **//
  // first, tell webgl graphics we want to use custom shader
  // to render nodes:
  const circleNode = buildCircleNodeShader()
  graphics.setNodeProgram(circleNode)
  // second, change the node ui model, which can be understood
  // by the custom shader:
  graphics.node( (node) => {
    let nodeSize = minNodeSize * node.data.logLength
    return new WebglCircle(nodeSize, nodeColor)
  })

  //* * END block #1 for node customization **//
  // rerun precomputes 500
  // const prerender = (devel === true || rerun === true) ? 500 : 0
  // version that doesn't rerun
  const prerender = (devel === true) ? 500 :
    parseInt(Math.log(listGiFilter.length)) * 50//prerender depending on the size of the listGiFilter

  renderer = Viva.Graph.View.renderer(g, {
    layout,
    graphics,
    container: document.getElementById("couve-flor"),
    prerender,
    preserveDrawingBuffer: true
  })

  renderer.run()
  // by default the animation on forces is paused since it may be
  // computational intensive for old computers
  renderer.pause()
  //* * Loading Screen goes off **//
  $("#loading").hide()
  $("#couve-flor").css("visibility", "visible")

  /*******************/
  /* MULTI-SELECTION */
  /*******************/

  $("#refreshButton").unbind("click").bind("click", () => {
    if (freezeShift === false) {
      freezeShift = true
      multiSelectOverlayObj.destroy()
      $("#refreshButton").removeClass("btn-success").addClass("btn-default")
    } else {
      freezeShift = false
      $("#refreshButton").removeClass("btn-default").addClass("btn-success")
    }
  })

  // event for shift key down
  // shows overlay div and exectures startMultiSelect
  document.addEventListener("keydown", (e) => {
    if (e.which === 16 && multiSelectOverlay === false && freezeShift === false) { // shift key
      // should close popup open so it doesn't get into listGiFilter
      $("#closePop").click()
      $(".graph-overlay").show()
      multiSelectOverlay = true
      multiSelectOverlayObj = startMultiSelect(g, renderer, layout)
      $("#Re_run, #go_back, #download_ds, #tableShow, #heatmapButtonTab, #plotButton").show()
      // showRerun.style.display = "block"
      // showGoback.style.display = "block"
      // showDownload.style.display = "block"
      // showTable.style.display = "block"
      // heatMap.style.display = "block"
      // plotButton.style.display = "block"
      // showGoback.className = showGoback.className.replace(/(?:^|\s)disabled(?!\S)/g, "")
      // showDownload.className = showDownload.className.replace(/(?:^|\s)disabled(?!\S)/g, "")
      // showTable.className = showTable.className.replace(/(?:^|\s)disabled(?!\S)/g, "")
      areaSelection = true
      listGiFilter = [] //if selection is made listGiFilter should be empty
      previousTableList = []
      // transform selector object that handles plots and hide their
      // respective divs
      Object.keys(selector).map( (el) => { selector[el].state = false })
      hideAllOtherPlots()
      resetAllNodes(graphics, g, nodeColor, renderer, idsArrays)
      // also reset file handlers that interfere with Re_run
      readFilejson = false
      assemblyJson = false
    }
  })
  // event for shift key up
  // destroys overlay div and transformes multiSelectOverlay to false
  document.addEventListener("keyup", (e) => {
    if (e.which === 16 && multiSelectOverlay !== "disable") {
      $(".graph-overlay").hide()
      $("#colorLegend").hide()
      if (multiSelectOverlay !== false) {
        multiSelectOverlayObj.destroy()
      }
      multiSelectOverlay = false
    }
  })

  defaultZooming(layout, renderer)

  // used to center on the node with more links
  // this is used to skip if it is a re-run button execution
  if (storeMasterNode.length > 0) {
    recenterDOM(renderer, layout, storeMasterNode)
  }

  //* ************//
  //* **ZOOMING***//
  //* ************//

  // opens events in webgl such as mouse hoverings or clicks

  $("#zoom_in").unbind("click").bind("click", (event) => {
    event.preventDefault()
    renderer.zoomIn()
    renderer.rerender()   // rerender after zoom avoids glitch with
    // duplicated nodes
  })
  $("#zoom_out").unbind("click").bind("click", (event) => {
    event.preventDefault()
    renderer.zoomOut()
    renderer.rerender()   // rerender after zoom avoids glitch with
    // duplicated nodes
  })

  //* *************//
  //* ** TOGGLE ***//
  //* *************//
  //* * This section controls the connection between the toggle button on the leftside ***//
  //* * and the dropdown on the right side **//

  let toggleStatus = false // default state
  // $("#toggle-event").bootstrapToggle("off") // set to default off
  $("#toggle-event").change(function () {   // jquery seems not to support es6
    toggleStatus = $(this).prop("checked")
    toggleManager(toggleStatus)
  })

  //* *************//
  //* ** EVENTS ***//
  //* *************//

  const events = Viva.Graph.webglInputEvents(graphics, g)

  //* * mouse click on nodes **//
  events.click( (node, e) => {
    pageReRun = false
    $("#resTab").removeClass("active")
    $("#resButton").removeClass("active")
    $("#pfTab").removeClass("active")
    $("#plasmidButton").removeClass("active")
    $("#virButton").removeClass("active")
    $("#virTab").removeClass("active")
    // this resets previous selected node to previous color
    if (currentQueryNode) {
      graphics.getNodeUI(currentQueryNode).color = graphics.getNodeUI(currentQueryNode).backupColor
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

    nodeUI1.color = 0xFFC300
    renderer.rerender()

    // allows the control of the click appearing and locking

    // And ask graphics to transform it to DOM coordinates:
    graphics.transformGraphToClientCoordinates(domPos)
    domPos.x = (domPos.x + nodeUI1.size) + "px"
    domPos.y = (domPos.y) + "px"

    // this sets the popup internal buttons to allow them to run,
    // otherwise they won't run because its own function returns this
    // variable to false, preveting the popup to expand with its
    // respectiv functions
    clickedPopupButtonCard = true
    clickedPopupButtonRes = true
    clickedPopupButtonFamily = true
    // requests table for sequences metadata
    requestPlasmidTable(node, setupPopupDisplay)
  })

  //* **************//
  //* ** BUTTONS ***//
  //* **************//
  // $("#closePop").on('click', () => {
  $("#closePop").unbind("click").bind("click", () => { //TODO ISSUE
    $("#resTab").removeClass("active")
    $("#resButton").removeClass("active")
    $("#pfTab").removeClass("active")
    $("#plasmidButton").removeClass("active")
    $("#popup_description").hide()

    if (currentQueryNode !== false) {
      graphics.getNodeUI(currentQueryNode).color = graphics.getNodeUI(currentQueryNode).backupColor
    } //else {
      //graphics.getNodeUI(currentQueryNode).color = 0x666370
    //}
    currentQueryNode = false
    renderer.rerender()
  })

  //**** BUTTONS THAT CONTROL PLOTS ****//

  // Button to open modal for plots
  // all these buttons require that the modalPlot modal opens before
  // executing the function and that is the reason why they wait half a
  // second before executing repetitivePlotFunction's
  $("#plotButton").unbind("click").bind("click", () => {
    $("#modalPlot").modal()
    clickerButton = "species"
    listGiFilter = (reloadAccessionList.length !== 0) ?
      // reduces listGiFilter to reloadAccessionList
      listGiFilter.filter( (n) => reloadAccessionList.includes(n)) :
      // otherwise maintain listGiFilter untouched
      listGiFilter
    setTimeout( () => {
      listPlots = repetitivePlotFunction(g, graphics, renderer, areaSelection, listGiFilter, clickerButton)
    }, 500)
  })

  $("#speciesStats").unbind("click").bind("click", () => {
    clickerButton = "species"
    setTimeout( () => {
      listPlots = repetitivePlotFunction(g, graphics, renderer, areaSelection, listGiFilter, clickerButton)
    },500)
  })

  $("#genusStats").unbind("click").bind("click", () => {
    clickerButton = "genus"
    setTimeout( () => {
      listPlots = repetitivePlotFunction(g, graphics, renderer, areaSelection, listGiFilter, clickerButton)
    }, 500)
  })

  $("#familyStats").unbind("click").bind("click", () => {
    clickerButton = "family"
    setTimeout( () => {
      listPlots = repetitivePlotFunction(g, graphics, renderer, areaSelection, listGiFilter, clickerButton)
    }, 500)
  })

  $("#orderStats").unbind("click").bind("click", () => {
    clickerButton = "order"
    setTimeout( () => {
      listPlots = repetitivePlotFunction(g, graphics, renderer, areaSelection, listGiFilter, clickerButton)
    }, 500)
  })

  $("#resistanceStats").unbind("click").bind("click", () => {
    clickerButton = "resistances"
    setTimeout( () => {
      listPlots = resRepetitivePlotFunction(g, graphics, renderer, areaSelection, listGiFilter, clickerButton)
    }, 500)
  })

  $("#pfamilyStats").unbind("click").bind("click", () => {
    clickerButton = "plasmid families"
    setTimeout( () => {
      listPlots = pfRepetitivePlotFunction(g, graphics, renderer, areaSelection, listGiFilter, clickerButton)
    }, 500)
  })

  $("#virStats").unbind("click").bind("click", () => {
    clickerButton = "virulence"
    setTimeout( () => {
      listPlots = virRepetitivePlotFunction(g, graphics, renderer, areaSelection, listGiFilter, clickerButton)
    }, 500)
  })

  // redundant with speciesStats but may be useful in the future
  $("#lengthStats").unbind("click").bind("click", () => {
    clickerButton = "length"
    setTimeout( () => {
      listPlots = repetitivePlotFunction(g, graphics, renderer, areaSelection, listGiFilter, clickerButton)
    }, 500)
  })

  $("#clusterStats").unbind("click").bind("click", () => {
    clickerButton = "cluster"
    setTimeout( () => {
      listPlots = repetitivePlotFunction(g, graphics, renderer, areaSelection, listGiFilter, clickerButton)
    }, 500)
  })

  // sort by values
  $("#sortGraph").unbind("click").bind("click", () => {
    const sortVal = true
    selector[clickerButton.replace(" ", "")].state = false
    listPlots = selector[clickerButton.replace(" ", "")].listPlots
    const layoutPlot = layoutGet(clickerButton)
    if (listPlots) { statsParser(g, graphics, renderer, false, listPlots, layoutPlot, clickerButton, false, sortVal, associativeObj) }
  })

  // sort alphabetically
  $("#sortGraphAlp").unbind("click").bind("click", () => {
    const sortAlp = true
    selector[clickerButton.replace(" ", "")].state = false
    listPlots = selector[clickerButton.replace(" ", "")].listPlots
    const layoutPlot = layoutGet(clickerButton)
    if (listPlots) { statsParser(g, graphics, renderer, false, listPlots, layoutPlot, clickerButton, sortAlp, false, associativeObj) }
  })

  // BUTTONS INSIDE PLOT MODAL THAT ALLOW TO SWITCH B/W PLOTS //

  // if buttons inside modalPlot are pressed

  $("#lengthPlot").unbind("click").bind("click", () => {
    clickerButton = "length"
    listPlots = repetitivePlotFunction(g, graphics, renderer, areaSelection, listGiFilter, clickerButton)
  })

  $("#speciesPlot").unbind("click").bind("click", () => {
    clickerButton = "species"
    listPlots = repetitivePlotFunction(g, graphics, renderer, areaSelection, listGiFilter, clickerButton)
  })

  $("#genusPlot").unbind("click").bind("click", () => {
    clickerButton = "genus"
    listPlots = repetitivePlotFunction(g, graphics, renderer, areaSelection, listGiFilter, clickerButton)
  })

  $("#familyPlot").unbind("click").bind("click", () => {
    clickerButton = "family"
    listPlots = repetitivePlotFunction(g, graphics, renderer, areaSelection, listGiFilter, clickerButton)
  })

  $("#orderPlot").unbind("click").bind("click", () => {
    clickerButton = "order"
    listPlots = repetitivePlotFunction(g, graphics, renderer, areaSelection, listGiFilter, clickerButton)
  })

  $("#clusterPlot").unbind("click").bind("click", () => {
    clickerButton = "cluster"
    listPlots = repetitivePlotFunction(g, graphics, renderer, areaSelection, listGiFilter, clickerButton)
  })

  $("#resPlot").unbind("click").bind("click", () => {
    clickerButton = "resistances"
    listPlots = resRepetitivePlotFunction(g, graphics, renderer, areaSelection, listGiFilter, clickerButton)
  })

  $("#pfPlot").unbind("click").bind("click", () => {
    clickerButton = "plasmid families"
    listPlots = pfRepetitivePlotFunction(g, graphics, renderer, areaSelection, listGiFilter, clickerButton)
  })

  $("#virPlot").unbind("click").bind("click", () => {
    clickerButton = "virulence"
    listPlots = virRepetitivePlotFunction(g, graphics, renderer, areaSelection, listGiFilter, clickerButton)
  })

  //**** BUTTONS THAT CONTROL VIVAGRAPH DISPLAY ****//

  // Buttons to control force play/pause using bootstrap navigation bar
  let paused = true
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

  // Form and button for search box
  $("#submitButton").unbind("click").bind("click", (event) => {
    $("#resTab").removeClass("active")
    $("#resButton").removeClass("active")
    $("#pfTab").removeClass("active")
    $("#plasmidButton").removeClass("active")
    $("#virTab").removeClass("active")
    $("#virButton").removeClass("active")

    event.preventDefault()    // prevents page from reloading
    if (toggleStatus === false) {
      // const query !==)
      const formvalueId = $("#formValueId").val()
      const query = (formvalueId === "") ? clickedHighchart :
        formvalueId.replace(".", "_")

      currentQueryNode = centerToggleQuery(g, graphics, renderer, query,
        currentQueryNode, clickedPopupButtonCard, clickedPopupButtonRes,
        clickedPopupButtonFamily)
    } else {
      // executed for plasmid search
      toggleOnSearch(g, graphics, renderer,
        currentQueryNode, clickedPopupButtonCard, clickedPopupButtonRes,
        clickedPopupButtonFamily)
      // then is here used to parse the results from async/await function
        .then( (result) => {
          currentQueryNode = result
        })
    }
    // this sets the popup internal buttons to allow them to run,
    // otherwise they won't run because its own function returns this
    // variable to false, preventing the popup to expand with its
    // respective functions
    clickedPopupButtonCard = true
    clickedPopupButtonRes = true
    clickedPopupButtonFamily = true
    clickedPopupButtonVir = true
  })
  // Button to clear the selected nodes by form
  $("#clearButton").unbind("click").bind("click", () => {
    document.getElementById("formValueId").value = ""
  })

  //* ******************//
  //* ***plasmidfinder Filters****//
  //* ******************//

  if (firstInstace === true && pageReload === false) {
    getArrayPf().done((json) => {
      // first parse the json input file
      const listPF = []
      // iterate over the file
      $.each(json, (accession, entry) => {
        const geneEntries = entry.gene
        for (let i in geneEntries) {
          if (geneEntries.hasOwnProperty(i)) {
            if (listPF.indexOf(geneEntries[i]) < 0) {
              listPF.push(geneEntries[i])
            }
          }
        }
      })
      // populate the menus
      singleDropdownPopulate("#plasmidFamiliesList", listPF, "PlasmidfinderClass")

      $(".PlasmidfinderClass").on("click", function() {
        // fill panel group displaying current selected taxa filters //
        const stringClass = this.className.slice(0, -5)
        const tempVar = this.firstChild.innerHTML
        // checks if a taxon is already in display
        const divStringClass = "#p_" + stringClass

        filterDisplayer(tempVar, stringClass, divStringClass)
      })
    })
  }

  // setup clear button for plasmidfinder functions
  $("#pfClear").unbind("click").bind("click", (event) => {
    document.getElementById("reset-sliders").click()
    // clear = true;
    event.preventDefault()
    // this needs an array for reusability purposes
    resetDisplayTaxaBox(["p_Plasmidfinder"])

    // resets dropdown selections
    $("#plasmidFamiliesList").selectpicker("deselectAll")

    slider.noUiSlider.set([min, max])
    nodeColorReset(graphics, g, nodeColor, renderer)
    previousTableList = []
    // transform selector object that handles plots and hide their
    // respective divs
    Object.keys(selector).map( (el) => { selector[el].state = false })
    hideAllOtherPlots()
    areaSelection = false
    if (typeof showLegend !== "undefined" && $("#scaleLegend").html() === "") {
      showLegend.style.display = "none"
      showRerun.style.display = "none"
      showGoback.style.display = "none"
      showDownload.style.display = "none"
      showTable.style.display = "none"
      heatMap.style.display = "none"
      plotButton.style.display = "none"
    } else {
      $("#colorLegendBox").empty()
      document.getElementById("taxa_label").style.display = "none" // hide label
      showRerun.style.display = "none"
      showGoback.style.display = "none"
      showDownload.style.display = "none"
      showTable.style.display = "none"
      heatMap.style.display = "none"
      plotButton.style.display = "none"
    }
  })

  $("#pfSubmit").unbind("click").bind("click", (event) => {
    event.preventDefault()
    resetDisplayTaxaBox(
      ["p_Resfinder", "p_Card", "p_Virulence", "p_Order", "p_Family", "p_Genus", "p_Species"]
    )
    $("#orderList").selectpicker("deselectAll")
    $("#familyList").selectpicker("deselectAll")
    $("#genusList").selectpicker("deselectAll")
    $("#speciesList").selectpicker("deselectAll")
    $("#resList").selectpicker("deselectAll")
    $("#cardList").selectpicker("deselectAll")
    $("#virList").selectpicker("deselectAll")
    // clears previous selected nodes
    nodeColorReset(graphics, g, nodeColor, renderer)
    previousTableList = []
    // transform selector object that handles plots and hide their
    // respective divs
    Object.keys(selector).map( (el) => { selector[el].state = false })
    hideAllOtherPlots()
    areaSelection = false
    // empties taxa and plasmidfinder legend
    $("#taxa_label").hide()
    $("#colorLegendBox").empty()
    $("#res_label").hide()
    $("#colorLegendBoxRes").empty()
    $("#vir_label").hide()
    $("#colorLegendBoxVir").empty()
    // reset nodes before submitting new colors
    const tempPageReRun = pageReRun
    showDiv().then( () => {
      pfSubmitFunction(g, graphics, renderer, tempPageReRun).then( (results) =>  {
        legendInst = results
        pageReRun = false
        // just show legend if any selection is made at all
        if (legendInst === true) {
          showLegend.style.display = "block"
          showRerun.style.display = "block"
          showGoback.style.display = "block"
          showDownload.style.display = "block"
          showTable.style.display = "block"
          heatMap.style.display = "block"
          plotButton.style.display = "block"
        }
        // enables button group again
        $("#toolButtonGroup button").removeAttr("disabled")
        $("#loading").hide()
      })
    })
  })

  //* ******************//
  //* ***Resistance Filters****//
  //* ******************//

  // first parse the json input file
  if (firstInstace === true && pageReload === false) {
    getArrayRes().done((json) => {
      const listCard = [],
        listRes = []
      // iterate over the file
      $.each(json, (accession, entry) => {
        const databaseEntries = entry.database
        const geneEntries = entry.gene
        for (let i in databaseEntries) {
          if (databaseEntries.hasOwnProperty(i)) {
            if (databaseEntries[i] === "card" && listCard.indexOf(geneEntries[i]) < 0) {
              listCard.push(geneEntries[i])
            } else {
              if (listRes.indexOf(geneEntries[i]) < 0) {
                listRes.push(geneEntries[i])
              }
            }
          }
        }
      })
      // populate the menus
      singleDropdownPopulate("#cardList", listCard, "CardClass")
      singleDropdownPopulate("#resList", listRes, "ResfinderClass")

      const classArray = [".CardClass", ".ResfinderClass"]
      for (let i = 0; i < classArray.length; i++) {
        $(classArray[i]).on("click", function() {
          // fill panel group displaying current selected taxa filters //
          const stringClass = this.className.slice(0, -5)
          const tempVar = this.firstChild.innerHTML

          // checks if a taxon is already in display
          const divStringClass = "#p_" + stringClass

          filterDisplayer(tempVar, stringClass, divStringClass)
        })
      }
    })
  }

  $("#resClear").unbind("click").bind("click", (event) => {
    event.preventDefault()
    document.getElementById("reset-sliders").click()
    resetDisplayTaxaBox(["p_Resfinder", "p_Card"])

    // resets dropdown selections
    $("#cardList").selectpicker("deselectAll")
    $("#resList").selectpicker("deselectAll")

    slider.noUiSlider.set([min, max])
    nodeColorReset(graphics, g, nodeColor, renderer)
    previousTableList = []
    // transform selector object that handles plots and hide their
    // respective divs
    Object.keys(selector).map( (el) => { selector[el].state = false })
    hideAllOtherPlots()
    areaSelection = false
    if (typeof showLegend !== "undefined" && $("#scaleLegend").html() === "") {
      showLegend.style.display = "none"
      showRerun.style.display = "none"
      showGoback.style.display = "none"
      showDownload.style.display = "none"
      showTable.style.display = "none"
      heatMap.style.display = "none"
      plotButton.style.display = "none"
    } else {
      $("#colorLegendBox").empty()
      document.getElementById("taxa_label").style.display = "none" // hide label
      showRerun.style.display = "none"
      showGoback.style.display = "none"
      showDownload.style.display = "none"
      showTable.style.display = "none"
      heatMap.style.display = "none"
      plotButton.style.display = "none"
    }
  })
  $("#resSubmit").unbind("click").bind("click", (event) => {
    event.preventDefault()
    resetDisplayTaxaBox(
      ["p_Plasmidfinder", "p_Virulence", "p_Order", "p_Family", "p_Genus", "p_Species"]
    )
    $("#orderList").selectpicker("deselectAll")
    $("#familyList").selectpicker("deselectAll")
    $("#genusList").selectpicker("deselectAll")
    $("#speciesList").selectpicker("deselectAll")
    $("#plasmidFamiliesList").selectpicker("deselectAll")
    $("#virList").selectpicker("deselectAll")

    // clears previously selected nodes
    nodeColorReset(graphics, g, nodeColor, renderer)
    previousTableList = []
    // transform selector object that handles plots and hide their
    // respective divs
    Object.keys(selector).map( (el) => { selector[el].state = false })
    hideAllOtherPlots()
    areaSelection = false
    // empties taxa and plasmidfinder legend
    $("#taxa_label").hide()
    $("#colorLegendBox").empty()
    $("#pf_label").hide()
    $("#colorLegendBoxPf").empty()
    $("#vir_label").hide()
    $("#colorLegendBoxVir").empty()
    // same should be done for taxa filters submit button
    const tempPageReRun = pageReRun
    showDiv().then( () => {
      resSubmitFunction(g, graphics, renderer, tempPageReRun).then( (results) => {
        legendInst = results
        pageReRun = false
        // just show legend if any selection is made at all
        if (legendInst === true) {
          showLegend.style.display = "block"
          showRerun.style.display = "block"
          showGoback.style.display = "block"
          showDownload.style.display = "block"
          showTable.style.display = "block"
          heatMap.style.display = "block"
          plotButton.style.display = "block"
        }
        // enables button group again
        $("#toolButtonGroup button").removeAttr("disabled")
        $("#loading").hide()
      })
    })
  })

  //* ******************//
  //* ***Virulence Filters****//
  //* ******************//

  if (firstInstace === true && pageReload === false) {
    getArrayVir().done( (json) => {
      // first parse the json input file
      const listVir = []
      // iterate over the file
      $.each(json, (accession, entry) => {
        const geneEntries = entry.gene
        for (let i in geneEntries) {
          if (geneEntries.hasOwnProperty(i)) {
            if (listVir.indexOf(geneEntries[i]) < 0) {
              listVir.push(geneEntries[i])
            }
          }
        }
      })

      // populate the menus
      singleDropdownPopulate("#virList", listVir, "VirulenceClass")

      $(".VirulenceClass").on("click", function() {
        // fill panel group displaying current selected taxa filters //
        const stringClass = this.className.slice(0, -5)
        const tempVar = this.firstChild.innerHTML
        // checks if a taxon is already in display
        const divStringClass = "#p_" + stringClass

        filterDisplayer(tempVar, stringClass, divStringClass)
      })
    })
  }

  // setup clear button for plasmidfinder functions
  $("#virClear").unbind("click").bind("click", (event) => {
    document.getElementById("reset-sliders").click()
    // clear = true;
    event.preventDefault()
    // this needs an array for reusability purposes
    resetDisplayTaxaBox(["p_Virulence"])

    // resets dropdown selections
    $("#virList").selectpicker("deselectAll")

    slider.noUiSlider.set([min, max])
    nodeColorReset(graphics, g, nodeColor, renderer)
    previousTableList = []
    // transform selector object that handles plots and hide their
    // respective divs
    Object.keys(selector).map( (el) => { selector[el].state = false })
    hideAllOtherPlots()
    areaSelection = false
    if (typeof showLegend !== "undefined" && $("#scaleLegend").html() === "") {
      showLegend.style.display = "none"
      showRerun.style.display = "none"
      showGoback.style.display = "none"
      showDownload.style.display = "none"
      showTable.style.display = "none"
      heatMap.style.display = "none"
      plotButton.style.display = "none"
    } else {
      $("#colorLegendBox").empty()
      document.getElementById("taxa_label").style.display = "none" // hide label
      showRerun.style.display = "none"
      showGoback.style.display = "none"
      showDownload.style.display = "none"
      showTable.style.display = "none"
      heatMap.style.display = "none"
      plotButton.style.display = "none"
    }
  })

  $("#virSubmit").unbind("click").bind("click", (event) => {
    event.preventDefault()
    resetDisplayTaxaBox(
      ["p_Resfinder", "p_Card", "p_Plasmidfinder", "p_Order", "p_Family", "p_Genus", "p_Species"]
    )
    $("#orderList").selectpicker("deselectAll")
    $("#familyList").selectpicker("deselectAll")
    $("#genusList").selectpicker("deselectAll")
    $("#speciesList").selectpicker("deselectAll")
    $("#resList").selectpicker("deselectAll")
    $("#cardList").selectpicker("deselectAll")
    $("#plasmidFamiliesList").selectpicker("deselectAll")
    // clears previous selected nodes
    nodeColorReset(graphics, g, nodeColor, renderer)
    previousTableList = []
    // transform selector object that handles plots and hide their
    // respective divs
    Object.keys(selector).map( (el) => { selector[el].state = false })
    hideAllOtherPlots()
    areaSelection = false
    // empties taxa and plasmidfinder legend
    $("#taxa_label").hide()
    $("#colorLegendBox").empty()
    $("#res_label").hide()
    $("#colorLegendBoxRes").empty()
    $("#pf_label").hide()
    $("#colorLegendBoxPf").empty()
    // reset nodes before submitting new colors
    const tempPageReRun = pageReRun
    showDiv().then( () => {
      virSubmitFunction(g, graphics, renderer, tempPageReRun).then( (results) =>  {
        legendInst = results
        pageReRun = false
        // just show legend if any selection is made at all
        if (legendInst === true) {
          showLegend.style.display = "block"
          showRerun.style.display = "block"
          showGoback.style.display = "block"
          showDownload.style.display = "block"
          showTable.style.display = "block"
          heatMap.style.display = "block"
          plotButton.style.display = "block"
        }
        // enables button group again
        $("#toolButtonGroup button").removeAttr("disabled")
        $("#loading").hide()
      })
    })
  })


  //* ******************//
  //* ***Taxa Filter****//
  //* ******************//

  const listOrders = [],
    listFamilies = [],
    listGenera = [],
    listSpecies = []
  if (firstInstace === true && pageReload === false) {
    getArrayTaxa().done((json) => {
      $.each(json, (sps, other) => {    // sps aka species
        const species = sps.split("_").join(" ")
        const genus = other[0]
        const family = other[1]
        const order = other[2]
        dictGenera[species] = [genus, family, order] // append the list to
        // this dict to be used later
        if (listGenera.indexOf(genus) < 0) {
          listGenera.push(genus)
        }
        if (listFamilies.indexOf(family) < 0) {
          listFamilies.push(family)
        }
        if (listOrders.indexOf(order) < 0) {
          listOrders.push(order)
        }
        if (listSpecies.indexOf(species) < 0) {
          listSpecies.push(species)
        }
      })

      // populate the menus
      singleDropdownPopulate("#orderList", listOrders, "OrderClass")
      singleDropdownPopulate("#familyList", listFamilies, "FamilyClass")
      singleDropdownPopulate("#genusList", listGenera, "GenusClass")
      singleDropdownPopulate("#speciesList", listSpecies, "SpeciesClass")

      // clickable <li> and control of displayer of current filters
      const classArray = [".OrderClass", ".FamilyClass", ".GenusClass", ".SpeciesClass"]
      for (let i = 0; i < classArray.length; i++) {
        $(classArray[i]).on("click", function() {
          // fill panel group displaying current selected taxa filters //
          const stringClass = this.className.slice(0, -5)
          const tempVar = this.firstChild.innerHTML

          // checks if a taxon is already in display
          const divStringClass = "#p_" + stringClass

          filterDisplayer(tempVar, stringClass, divStringClass)
        })
      }
    })
  }

  //* **** Clear selection button *****//
  // clear = false; //added to control the colors being triggered after clearing
  $("#taxaModalClear").unbind("click").bind("click", (event) => {
    document.getElementById("reset-sliders").click()
    // clear = true;
    event.preventDefault()
    resetDisplayTaxaBox(idsArrays)

    // resets dropdown selections
    $("#orderList").selectpicker("deselectAll")
    $("#familyList").selectpicker("deselectAll")
    $("#genusList").selectpicker("deselectAll")
    $("#speciesList").selectpicker("deselectAll")

    slider.noUiSlider.set([min, max])
    nodeColorReset(graphics, g, nodeColor, renderer)
    previousTableList = []
    // transform selector object that handles plots and hide their
    // respective divs
    Object.keys(selector).map( (el) => { selector[el].state = false })
    hideAllOtherPlots()
    areaSelection = false
    if (typeof showLegend !== "undefined" && $("#scaleLegend").html() === "") {
      showLegend.style.display = "none"
      showRerun.style.display = "none"
      showGoback.style.display = "none"
      //document.getElementById("go_back").className += " disabled"
      showDownload.style.display = "none"
      showTable.style.display = "none"
      heatMap.style.display = "none"
      plotButton.style.display = "none"
    } else {
      $("#colorLegendBox").empty()
      document.getElementById("taxa_label").style.display = "none" // hide label
      showRerun.style.display = "none"
      showGoback.style.display = "none"
      //document.getElementById("go_back").className += " disabled"
      showDownload.style.display = "none"
      showTable.style.display = "none"
      heatMap.style.display = "none"
      plotButton.style.display = "none"
    }
  })

  //* **** Submit button for taxa filter *****//

  // perform actions when submit button is clicked.

  $("#taxaModalSubmit").unbind("click").bind("click", (event) => {
    pageReRun = false
    // clear legend from reads
    $("#readString").empty()
    $("#readLegend").empty()
    $("#read_label").hide()
    event.preventDefault()
    resetDisplayTaxaBox(["p_PlasmidFinder", "p_Resfinder", "p_Card", "p_Virulence"])
    $("#plasmidFamiliesList").selectpicker("deselectAll")
    $("#resList").selectpicker("deselectAll")
    $("#cardList").selectpicker("deselectAll")
    $("#virList").selectpicker("deselectAll")
    // changed nodes is reset every instance of taxaModalSubmit button
    listGiFilter = []   // makes listGiFilter an empty array
    // noLegend = false // sets legend to hidden state by default
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
    // print alert if no filters are selected
    let counter = 0 // counts the number of taxa type that has not been
    // selected

    const alertArrays = {
      "order": selectedOrder,
      "family": selectedFamily,
      "genus": selectedGenus,
      "species": selectedSpecies
    }

    const divAlert = document.getElementById("alertId")
    let Alert = false
    for (const i in alertArrays) {
      // if (alertArrays[i].length === 0) {
      //   Alert = true
      //   counter = 4  // counter used to check if more than one dropdown has selected options
      if (alertArrays[i].length > 0) {
        counter = counter + 1
        Alert = false
      } else if (alertArrays.order.length === 0 &&
        alertArrays.family.length === 0 &&
        alertArrays.genus.length === 0 &&
        alertArrays.species.length === 0) {
        Alert = true
      }

    }
    if (Alert === true) {
      divAlert.style.display = "block"
      showLegend.style.display = "none" // removes legend when this
      // warning is raised
      Alert = false
    }

    // auto hide after 5 seconds without closing the div
    window.setTimeout( () => { $("#alertId").hide() }, 5000)

    //* *** End Alert for taxa filter ****//

    // make tmpselectedGenus an associative array since it is the base of family and order arrays

    let assocFamilyGenus = {}
    let assocOrderGenus = {}
    let assocGenus = {}

    // appends genus to selectedGenus according with the family and order for single-color selection
    // also appends to associative arrays for family and order for multi-color selection
    $.each(dictGenera, (species, pair) => {
      const genus = pair[0]
      const family = pair[1]
      const order = pair[2]
      if (selectedFamily.indexOf(family) >= 0) {
        selectedGenus.push(species)
        if (!(family in assocFamilyGenus)) {
          assocFamilyGenus[family] = []
          assocFamilyGenus[family].push(species)
        } else {
          assocFamilyGenus[family].push(species)
        }
      } else if (selectedOrder.indexOf(order) >= 0) {
        selectedGenus.push(species)
        if (!(order in assocOrderGenus)) {
          assocOrderGenus[order] = []
          assocOrderGenus[order].push(species)
        } else {
          assocOrderGenus[order].push(species)
        }
      } else if (selectedGenus.indexOf(genus) >= 0) {
        if (!(genus in assocGenus)) {
          assocGenus[genus] = []
          assocGenus[genus].push(species)
        } else {
          assocGenus[genus].push(species)
        }
      }
    })

    // renders the graph for the desired taxon if more than one taxon type is selected
    let storeLis = "" // a variable to store all <li> generated for legend
    let firstIteration = true // boolean to control the upper taxa level
    // (order or family)

    // first restores all nodes to default color
    nodeColorReset(graphics, g, nodeColor, renderer)
    previousTableList = []
    // transform selector object that handles plots and hide their
    // respective divs
    Object.keys(selector).map( (el) => { selector[el].state = false })
    hideAllOtherPlots()
    areaSelection = false
    // empties taxa and plasmidfinder legend
    $("#res_label").hide()
    $("#colorLegendBoxRes").empty()
    $("#pf_label").hide()
    $("#colorLegendBoxPf").empty()
    $("#vir_label").hide()
    $("#colorLegendBoxVir").empty()

    // if multiple selections are made in different taxa levels
    if (counter > 1 && counter <= 4) {
      const styleColor = "background-color:" + colorList[2]
      storeLis = storeLis + "<li" +
        " class='centeredList'><button class='jscolor btn" +
        " btn-default' style=" + styleColor + "></button>&nbsp;multi taxa" +
        " selection</li>"
      showDiv().then( () => {
        const promises = []
        const currentColor = 0xf71735   // sets color of all changes_nodes to
        // be red
        storeLis = "<li class='centeredList'><button class='jscolor btn btn-default'" +
          " style='background-color:#f71735'></button>&nbsp;multi-level" +
          " selected taxa</li>"
        // for (const i in alertArrays.order) {
        let currentSelectionOrder = alertArrays.order
        for (const i in currentSelectionOrder) {
          if (currentSelectionOrder.hasOwnProperty(i)) {
            const tempArray = assocOrderGenus[currentSelectionOrder[i]]
            for (const sp in tempArray) {
              if ({}.hasOwnProperty.call(tempArray, sp)) {
                promises.push(
                  taxaRequest(g, graphics, renderer, tempArray[sp], currentColor)//, reloadAccessionList)//, changed_nodes)
                    .then((results) => {
                      results.map((request) => {
                        listGiFilter.push(request.plasmid_id)
                      })
                    })
                )
              }
            }
          }
        }
        // }
        // for (i in alertArrays.family) {
        let currentSelectionFamily = alertArrays.family
        for (const i in currentSelectionFamily) {
          if (currentSelectionFamily.hasOwnProperty(i)) {
            const tempArray = assocFamilyGenus[currentSelectionFamily[i]]
            for (const sp in tempArray) {
              if (tempArray.hasOwnProperty(sp)) {
                promises.push(
                  taxaRequest(g, graphics, renderer, tempArray[sp], currentColor)//, reloadAccessionList)//, changed_nodes)
                    .then((results) => {
                      results.map((request) => {
                        listGiFilter.push(request.plasmid_id)
                      })
                    })
                )
              }
            }
          }
        }
        // }
        // for (i in alertArrays.genus) {
        let currentSelectionGenus = alertArrays.genus
        for (const i in currentSelectionGenus) {
          if (currentSelectionGenus.hasOwnProperty(i)) {
            const tempArray = assocGenus[currentSelectionGenus[i]]
            for (const sp in tempArray) {
              if (tempArray.hasOwnProperty(sp)) {
                promises.push(
                  taxaRequest(g, graphics, renderer, tempArray[sp], currentColor)//, reloadAccessionList)//, changed_nodes)
                    .then((results) => {
                      results.map((request) => {
                        listGiFilter.push(request.plasmid_id)
                      })
                    })
                )
              }
            }
          }
        }
        // }
        // for (i in alertArrays.species) {
        let currentSelectionSpecies = alertArrays.species
        for (const i in currentSelectionSpecies) {
          if (currentSelectionSpecies.hasOwnProperty(i)) {
            promises.push(
              taxaRequest(g, graphics, renderer, currentSelectionSpecies[i], currentColor)//, reloadAccessionList)//, changed_nodes)
                .then((results) => {
                  results.map((request) => {
                    listGiFilter.push(request.plasmid_id)
                  })
                })
            )
          }
        }
        Promise.all(promises)
          .then( () => {
            $("#loading").hide()
            showLegend.style.display = "block"
            document.getElementById("taxa_label").style.display = "block" // show label
            $("#colorLegendBox").empty()
              .append(storeLis +
                "<li class='centeredList'><button class='jscolor btn btn-default'" +
                "style='background-color:#666370' ></button>&nbsp;unselected</li>")
            showRerun.style.display = "block"
            showGoback.style.display = "block"
            showDownload.style.display = "block"
            showTable.style.display = "block"
            heatMap.style.display = "block"
            plotButton.style.display = "block"
            // enables button group again
            $("#toolButtonGroup button").removeAttr("disabled")
          })
      })
    }
    // renders the graph for the desired taxon if one taxon type is selected
    // allows for different colors between taxa of the same level
    else if (counter === 1) {
      let currentSelection
      // first cycle between all the arrays to find which one is not empty
      for (const array in alertArrays) {
        // selects the not empty array
        if (alertArrays[array].length !== 0 && firstIteration === true) {
          currentSelection = alertArrays[array]
          // performs the actual interaction for color picking and assigning
          showDiv().then( () => {
            const promises = []
            for (const i in currentSelection) {
              // orders //
              if (currentSelection.hasOwnProperty(i)) {
                if (alertArrays.order.length !== 0) {
                  const currentColor = colorList[i].replace("#", "0x")
                  const tempArray = assocOrderGenus[currentSelection[i]]
                  const styleColor = "background-color:" + colorList[i]
                  storeLis = storeLis + "<li" +
                    " class='centeredList'><button class='jscolor btn" +
                    " btn-default' style=" + styleColor + "></button>&nbsp;" +
                    currentSelection[i] + "</li>"
                  // executres node function for family and orders
                  for (const sp in tempArray) {
                    promises.push(
                      taxaRequest(g, graphics, renderer, tempArray[sp], currentColor)//, reloadAccessionList)//, changed_nodes)
                        .then((results) => {
                          results.map((request) => {
                            listGiFilter.push(request.plasmid_id)
                          })
                        })
                    )
                  }
                }

                // families //
                else if (alertArrays.family.length !== 0) {
                  const currentColor = colorList[i].replace("#", "0x")
                  const tempArray = assocFamilyGenus[currentSelection[i]]
                  const styleColor = "background-color:" + colorList[i]
                  storeLis = storeLis + "<li" +
                    " class='centeredList'><button class='jscolor btn" +
                    " btn-default' style=" + styleColor +
                    "></button>&nbsp;" + currentSelection[i] + "</li>"
                  // executres node function for family
                  for (const sp in tempArray) {
                    if (tempArray.hasOwnProperty(sp)) {
                      promises.push(
                        taxaRequest(g, graphics, renderer, tempArray[sp], currentColor)//, reloadAccessionList)//, changed_nodes)
                          .then((results) => {
                            results.map((request) => {
                              listGiFilter.push(request.plasmid_id)
                            })
                          })
                      )
                    }
                  }
                }

                // genus //
                else if (alertArrays.genus.length !== 0) {
                  const currentColor = colorList[i].replace("#", "0x")
                  const tempArray = assocGenus[currentSelection[i]]
                  const styleColor = "background-color:" + colorList[i]
                  storeLis = storeLis + "<li class='centeredList'><button" +
                    " class='jscolor btn btn-default' style=" +
                    styleColor + "></button>&nbsp;" + currentSelection[i] +
                    "</li>"

                  // requests taxa associated accession from db and colors
                  // respective nodes
                  for (const sp in tempArray) {
                    if (tempArray.hasOwnProperty(sp)) {
                      promises.push(
                        taxaRequest(g, graphics, renderer, tempArray[sp], currentColor)//, reloadAccessionList)//, changed_nodes)
                          .then((results) => {
                            results.map((request) => {
                              listGiFilter.push(request.plasmid_id)
                            })
                          })
                      )
                    }
                  }
                }

                // species //
                else if (alertArrays.species.length !== 0) {
                  const currentColor = colorList[i].replace("#", "0x")
                  const styleColor = "background-color:" + colorList[i]
                  storeLis = storeLis + "<li class='centeredList'><button" +
                    " class='jscolor btn btn-default' style=" +
                    styleColor + "></button>&nbsp;" + currentSelection[i] +
                    "</li>"

                  // requests taxa associated accession from db and colors
                  // respective nodes
                  promises.push(
                    taxaRequest(g, graphics, renderer, currentSelection[i], currentColor)//, reloadAccessionList)
                    // })//, changed_nodes)
                      .then( (results) => {
                        results.map( (request) => {
                          listGiFilter.push(request.plasmid_id)
                        })
                      })
                  )
                }
              }
            }
            Promise.all(promises)
              .then(() => {
                $("#loading").hide()
                showLegend.style.display = "block"
                document.getElementById("taxa_label").style.display = "block" // show label
                $("#colorLegendBox").empty()
                  .append(storeLis +
                    "<li class='centeredList'><button class='jscolor btn btn-default'" +
                    " style='background-color:#666370' ></button>&nbsp;unselected</li>")
                showRerun.style.display = "block"
                showGoback.style.display = "block"
                showDownload.style.display = "block"
                showTable.style.display = "block"
                heatMap.style.display = "block"
                plotButton.style.display = "block"
                // enables button group again
                $("#toolButtonGroup button").removeAttr("disabled")
              })
          }) // ends showDiv

          firstIteration = false // stops getting lower levels
        }
      }
    }
  })

  //* ************//
  //* ***READS****//
  //* ************//

  $("#fileSubmit").unbind("click").bind("click", (event) => {
    event.preventDefault()
    masterReadArray = []
    assemblyJson = false
    // feeds the first file
    const readString = JSON.parse(Object.values(readFilejson)[0])
    $("#fileNameDiv").html(Object.keys(readFilejson)[0])
      .show()
    // readIndex will be used by slider buttons
    readIndex = 0
    resetAllNodes(graphics, g, nodeColor, renderer, idsArrays)
    previousTableList = []
    // transform selector object that handles plots and hide their
    // respective divs
    Object.keys(selector).map( (el) => { selector[el].state = false })
    hideAllOtherPlots()
    areaSelection = false
    $("#loading").show()
    setTimeout( () => {
      // colors each node for first element of readFilejson
      const outLists = readColoring(g, listGi, graphics, renderer, readString)
      listGi  = outLists[0]
      listGiFilter = outLists[1]
      masterReadArray = pushToMasterReadArray(readFilejson)
    }, 100)

    // }
    // used to hide when function is not executed properly
    setTimeout( () => {
      $("#loading").hide()
    }, 100)
    $("#slideRight").prop("disabled", false)
    $("#slideLeft").prop("disabled", false)
  })

  $("#cancel_infile").unbind("click").bind("click", () => {
    readFilejson = abortRead()
  })

  $("#sampleMapping").unbind("click").bind("click", (event) => {
    event.preventDefault()
    masterReadArray = []
    assemblyJson = false
    // readIndex will be used by slider buttons
    readIndex = 0
    resetAllNodes(graphics, g, nodeColor, renderer, idsArrays)
    previousTableList = []
    // transform selector object that handles plots and hide their
    // respective divs
    Object.keys(selector).map( (el) => { selector[el].state = false })
    hideAllOtherPlots()
    areaSelection = false
    $("#loading").show()
    setTimeout( () => {
      getArrayMapping().done( (result) => {
        // puts to readFilejson object that may store many files
        readFilejson = {
          // has to be stringifyed to be passed to pushToMasterReadArray
          "mapping_sample1": JSON.stringify(result)
        }
        $("#fileNameDiv").html("mapping_sample1")
          .show()
        const outLists = readColoring(g, listGi, graphics, renderer, result)
        listGi = outLists[0]
        listGiFilter = outLists[1]
        masterReadArray = pushToMasterReadArray(readFilejson)
      })
    })
    // used to hide when function is not executed properly
    setTimeout( () => {
      $("#loading").hide()
    }, 100)
  })

  //* ************//
  //* ***MASH****//
  //* ************//

  $("#fileSubmit_mash").unbind("click").bind("click", (event) => {
    masterReadArray = []
    assemblyJson = false
    readFilejson = mashJson // converts mashJson into readFilejson to
    const readString = JSON.parse(Object.values(mashJson)[0])
    $("#fileNameDiv").html(Object.keys(mashJson)[0])
      .show()
    // readIndex will be used by slider buttons
    readIndex += 1
    // it and use the same function (readColoring)
    resetAllNodes(graphics, g, nodeColor, renderer, idsArrays)
    previousTableList = []
    // transform selector object that handles plots and hide their
    // respective divs
    Object.keys(selector).map( (el) => { selector[el].state = false })
    hideAllOtherPlots()
    areaSelection = false
    event.preventDefault()
    $("#loading").show()
    setTimeout( () => {
      const outputList = readColoring(g, listGi, graphics, renderer, readString)
      listGi = outputList[0]
      listGiFilter = outputList[1]
      masterReadArray = pushToMasterReadArray(readFilejson)
    }, 100)

    // }
    // used to hide when function is not executed properly
    setTimeout( () => {
      $("#loading").hide()
    }, 100)
    $("#slideRight").prop("disabled", false)
    $("#slideLeft").prop("disabled", false)

  })

  $("#cancel_infile_mash").unbind("click").bind("click", () => {
    mashJson = abortRead()
  })

  $("#sampleMash").unbind("click").bind("click", (event) => {
    event.preventDefault()
    masterReadArray = []
    assemblyJson = false
    // readIndex will be used by slider buttons
    readIndex = 0
    resetAllNodes(graphics, g, nodeColor, renderer, idsArrays)
    previousTableList = []
    // transform selector object that handles plots and hide their
    // respective divs
    Object.keys(selector).map( (el) => { selector[el].state = false })
    hideAllOtherPlots()
    areaSelection = false
    $("#loading").show()
    setTimeout( () => {
      getArrayMash().done( (result) => {
        // puts to readFilejson object that may store many files
        mashJson = {
          // has to be stringifyed to be passed to pushToMasterReadArray
          "mash_sample1": JSON.stringify(result)
        }
        $("#fileNameDiv").html("mash_sample1")
          .show()
        readFilejson = mashJson
        const outLists = readColoring(g, listGi, graphics, renderer, result)
        listGi = outLists[0]
        listGiFilter = outLists[1]
        masterReadArray = pushToMasterReadArray(mashJson)
      })
    })
    // used to hide when function is not executed properly
    setTimeout( () => {
      $("#loading").hide()
    }, 100)
  })

  //* ********* ***//
  //* * Assembly **//
  //* ********* ***//
  $("#assemblySubmit").unbind("click").bind("click", (event) => {
    // $("#alertAssembly").show()
    masterReadArray = []
    readFilejson = assemblyJson
    readIndex = 0
    event.preventDefault()
    resetAllNodes(graphics, g, nodeColor, renderer, idsArrays)
    previousTableList = []
    $("#fileNameDiv").html(Object.keys(assemblyJson)[0])
      .show()
    // transform selector object that handles plots and hide their
    // respective divs
    Object.keys(selector).map( (el) => { selector[el].state = false })
    hideAllOtherPlots()
    areaSelection = false
    $("#loading").show()
    setTimeout( () => {
      const readString = JSON.parse(Object.values(assemblyJson)[0])
      const outputList = readColoring(g, listGi, graphics, renderer, readString)
      listGi = outputList[0]
      listGiFilter = outputList[1]
      masterReadArray = pushToMasterReadArray(assemblyJson)
      // listGiFilter = assembly(listGi, assemblyJson, g, graphics, masterReadArray, listGiFilter)
    }, 100)
    setTimeout( () => {
      renderer.rerender()
    }, 100)

    // }
    // used to hide when function is not executed properly
    setTimeout( () => {
      $("#loading").hide()
    }, 100)
    $("#slideRight").prop("disabled", false)
    $("#slideLeft").prop("disabled", false)
  })

  $("#cancel_assembly").unbind("click").bind("click", () => {
    assemblyJson = abortRead()
  })

  $("#sampleAssembly").unbind("click").bind("click", (event) => {
    // $("#alertAssembly").show()
    event.preventDefault()
    masterReadArray = []
    readIndex = 0
    resetAllNodes(graphics, g, nodeColor, renderer, idsArrays)
    previousTableList = []

    // transform selector object that handles plots and hide their
    // respective divs
    Object.keys(selector).map( (el) => { selector[el].state = false })
    hideAllOtherPlots()
    areaSelection = false
    $("#loading").show()
    setTimeout( () => {
      getArrayAssembly().then( (results) => {
        assemblyJson = results
        readFilejson = results
        $("#fileNameDiv").html(Object.keys(assemblyJson)[0])
          .show()
        const readString = JSON.parse(Object.values(assemblyJson)[0])
        const outputList = readColoring(g, listGi, graphics, renderer, readString)
        listGi = outputList[0]
        listGiFilter = outputList[1]
        masterReadArray = pushToMasterReadArray(assemblyJson)
        // listGiFilter = assembly(listGi, results, g, graphics, masterReadArray, listGiFilter)
      }, 100)
    })
    setTimeout( () => {
      renderer.rerender()
    }, 100)
    // used to hide when function is not executed properly
    setTimeout( () => {
      $("#loading").hide()
    }, 100)
    $("#slideRight").prop("disabled", false)
    $("#slideLeft").prop("disabled", false)
  })

  //* *********************//
  //* * Distances filter **//
  //* *********************//
  $("#distancesSubmit").unbind("click").bind("click", (event) => {
    event.preventDefault()
    $("#loading").show()
    $("#scaleLegend").empty()
    showDiv().then( () => {
      linkColoring(g, graphics, renderer, "distance", toggleRatioStatus)
      // enables button group again
      $("#toolButtonGroup button").removeAttr("disabled")
    })
    const readMode = false
    colorLegendFunction(readMode)
  })

  $("#reset-links").unbind("click").bind("click", (event) => {
    event.preventDefault()
    const arrayOfDivs = [
      $("#colorLegendBox").html(),
      $("#colorLegendBoxRes").html(),
      $("#colorLegendBoxPf").html(),
      $("#readLegend").html(),
      $("#assemblyLegend").html(),

    ]
    let divCounter = 0
    for (const div of arrayOfDivs) {
      if (div === "") {
        divCounter += 1
        if (divCounter === 5) {
          // $("#scaleLegend").empty()
          // $("#scaleString").empty()
          // $("#distance_label").hide()
          showLegend.style.display = "none"

          //document.getElementById("reset-links").disabled = "disabled"
        }
      }
    }
    $("#scaleLegend").empty()
    $("#scaleString").empty()
    $("#distance_label").hide()
    setTimeout( () => {
      resetLinkColor(g, graphics, renderer)
    }, 100)
  })

  //* ********************//
  //* ***Length filter****//
  //* ********************//

  //* * slider button and other options **//

  // sets the limits of buttons and slider
  // this is only triggered on first instance because we only want to get
  // the limits of all plasmids once
  if (sliderMinMax.length === 0) {
    sliderMinMax = [Math.log(Math.min.apply(null, listLengths)),
      Math.log(Math.max.apply(null, listLengths))]
    // generates and costumizes slider itself
    const slider = document.getElementById("slider")

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

  // event handler for slider
  // trigger only if clicked to avoid looping through the nodes again
  $("#length_filter").unbind("click").bind("click", () => {
    slider.noUiSlider.on("set", function() {
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
          if (parseInt(nodeLength) < parseInt(sliderMin) || parseInt(nodeLength) > parseInt(sliderMax)) {
            nodeUI.color = 0xcdc8b1 // shades nodes
          } else if (parseInt(nodeLength) >= parseInt(sliderMin) || parseInt(nodeLength) <= parseInt(sliderMax)) {
            nodeUI.color = nodeUI.backupColor // return nodes to original color
          }
        }
      })
      renderer.rerender()
    })
  })

  // inputs mins and maxs for slider
  const inputMin = document.getElementById("slider_input_min"),
    inputMax = document.getElementById("slider_input_max"),
    inputs = [inputMin, inputMax]
  slider.noUiSlider.on("update", function (values, handle) {
    inputs[handle].value = Math.trunc(Math.exp(values[handle]))
  })

  // resets the slider
  $("#reset-sliders").unbind("click").bind("click", () => {
    listGiFilter = [] //resets listGiFilter
    previousTableList = []
    // transform selector object that handles plots and hide their
    // respective divs
    Object.keys(selector).map( (el) => { selector[el].state = false })
    hideAllOtherPlots()
    areaSelection = false
    readFilejson = false // makes file selection empty again
    assemblyJson = false
    mashJson = false
    currentQueryNode = false
    slider.noUiSlider.set(sliderMinMax)
    resetAllNodes(graphics, g, nodeColor, renderer, idsArrays)
    previousTableList = []
    // transform selector object that handles plots and hide their
    // respective divs
    Object.keys(selector).map( (el) => { selector[el].state = false })
    hideAllOtherPlots()
  })
  // runs the re run operation for the selected species
  $("#Re_run").unbind("click").bind("click", () => {
    // resets areaSelection
    areaSelection = false
    firstInstace = false
    rerun = true
    reloadAccessionList = []  // needs to be killed every instance in
    // order for reload to allow reloading again
    //* * Loading Screen goes on **//
    // removes disabled from class in go_back button
    // document.getElementById("go_back").className = document.getElementById("go_back").className.replace(/(?:^|\s)disabled(?!\S)/g, "")
    // document.getElementById("download_ds").className = document.getElementById("download_ds").className.replace(/(?:^|\s)disabled(?!\S)/g, "")
    // document.getElementById("tableShow").className = document.getElementById("tableShow").className.replace(/(?:^|\s)disabled(?!\S)/g, "")
    showDiv().then( () => {
      // removes nodes
      setTimeout( () => {
        actualRemoval(g, graphics, onLoad, false)
        freezeShift = true
        // enables button group again
        $("#toolButtonGroup button").removeAttr("disabled")
      }, 100)
    })
  })

  // returns to the initial tree by reloading the page
  $("#go_back").unbind("click").bind("click", () => {
    // window.location.reload()   // a temporary fix to go back to full dataset
    firstInstace = true
    pageReload = true
    list = []
    listGi = []
    listLengths = []
    listGiFilter = []
    showDiv().then( () => {
      // removes nodes and forces adding same nodes
      setTimeout( () => {
        actualRemoval(g, graphics, onLoad, true)
        // enables button group again
        $("#toolButtonGroup button").removeAttr("disabled")
      }, 100)
    })
  })
  // sets a counter for welcome div
  if (($("#welcomeModal").data("bs.modal") || {}).isShown) {
    let logger = 30
    let countDown = setInterval( () => {
      if ($("#counter").html() !== "") {
        logger -= 1
        $("#counter").html(`Closing in: ${logger.toString()}s`)
        if (logger === 0) {
          clearInterval(countDown)
          $("#welcomeModal").modal("hide")
          $("#counter").html("")
        }
      }
    }, 1000)
  }
  // button to cancel cowntdown control
  $("#counterClose").unbind("click").bind("click", () => {
    $("#counter").html("")
    $("#counterClose").hide()
  })

} // closes renderGraph