// if this is a developer session please enable the below line of code
const devel = false

// boolean that controls the prerender function if rerun
// is activated
let rerun = false

// helps set menu to close status
let first_click_menu = true

// checks if vivagraph should load first initial dataset or the filters
let firstInstace = true

// this variable is used to store the clicked node to use in resistance and
// plasmid buttons
let clickedNode = false

// starts a global instance for checking if button was clicked before
let clickedPopupButtonRes = false
let clickedPopupButtonCard = false
let clickedPopupButtonFamily = false

// variable to control stats displayer
let areaSelection = false

const getArray = (devel === true) ? $.getJSON("/test") : $.getJSON("/fullDS")
// an array to store bootstrap table related list for downloads and coloring
// nodes on submit
let bootstrapTableList = []
// dictionary to store all the connections between species and other taxa
// level available. This needs to be stored here because there is no reason
// to execute the getArray_taxa twice.
const dict_genera = {}

// load JSON file with taxa dictionary
const getArray_taxa = () => {
  return $.getJSON("/taxa")
}

// load JSON file with resistance dictionary
const getArray_res = () => {
  return $.getJSON("/resistance")
}

// load JSON file with taxa dictionary
const getArray_pf = () => {
  return $.getJSON("/plasmidfinder")
}

// list used to store for re-run button (apply filters)
let listGiFilter = []
let reloadAccessionList = []

let sliderMinMax = [] // initiates an array for min and max slider entries
// and stores it for reloading instances of onload()
let list_gi = []

// initiates vivagraph main functions
// onLoad consists of mainly three functions: init, precompute and renderGraph
const onLoad = () => {
  // store the node with more links
  let storeMasterNode = []    //cleared every instance of onload
  // start array that controls taxa filters
  const idsArrays = ["p_Order", "p_Family", "p_Genus", "p_Species"]

  let counter = -1 //sets a counter for the loop between the inputs nodes
  // Sets parameters to be passed to WebglCircle in order to change
  // node shape, setting color and size.
  const nodeColor = 0x666370 // hex rrggbb
  const minNodeSize = 2 // a value that assures that the node is
  // displayed without increasing the size of big nodes too much

  let list = []   // list to store references already ploted as nodes
  // links between accession numbers
  let list_lengths = [] // list to store the lengths of all nodes

  // initiate vivagraph instance
  const g = Viva.Graph.graph()
  // define layout
  const layout = Viva.Graph.Layout.forceDirected(g, {
    springLength: 30,
    springCoeff: 0.0001,
    dragCoeff: 0.0001, // sets how fast nodes will separate from origin,
    // the higher the value the slower
    gravity: -1.2,
    theta: 1
  })
  // define render on the scope of onload in order to be used by buttons
  // outside renderGraph
  let renderer
  // buttons that are able to hide
  let showRerun = document.getElementById("Re_run"),
    showGoback = document.getElementById("go_back"),
    showDownload = document.getElementById("download_ds"),
    showLegend = document.getElementById("colorLegend")
    showTable = document.getElementById("tableShow")

  const graphics = Viva.Graph.View.webglGraphics()

  //* Starts graphics renderer *//
  // TODO without precompute we can easily pass parameters to renderGraph like links distances
  const renderGraph = (graphics) => {
    //console.log("entered renderGraph")
    //const graphics = Viva.Graph.View.webglGraphics()
    //** block #1 for node customization **//
    // first, tell webgl graphics we want to use custom shader
    // to render nodes:
    const circleNode = buildCircleNodeShader()
    graphics.setNodeProgram(circleNode)
    // second, change the node ui model, which can be understood
    // by the custom shader:
    graphics.node( (node) => {
      //console.log("node", node)
      nodeSize = minNodeSize * node.data.log_length
      return new WebglCircle(nodeSize, nodeColor)
    })

    //* * END block #1 for node customization **//
    const prerender = (devel === true || rerun === true) ? 500 : 0

    renderer = Viva.Graph.View.renderer(g, {
      layout,
      graphics,
      container: document.getElementById('couve-flor'),
      prerender,
      preserveDrawingBuffer: true
    })

    renderer.run()
    // by default the animation on forces is paused since it may be
    // computational intensive for old computers
    renderer.pause()

    /*******************/
    /* MULTI-SELECTION */
    /*******************/

    // variable used to control if div is shown or not
    let multiSelectOverlay = false

    // event for shift key down
    // shows overlay div and exectures startMultiSelect
    document.addEventListener("keydown", (e) => {
      //console.log("keydown")
      if (e.which === 16 && multiSelectOverlay === false) { // shift key
        $(".graph-overlay").show()
        multiSelectOverlay = startMultiSelect(g, renderer, layout)
        showRerun.style.display = "block"
        showGoback.style.display = "block"
        showDownload.style.display = "block"
        showTable.style.display = "block"
        showGoback.className = showGoback.className.replace(/(?:^|\s)disabled(?!\S)/g, "")
        showDownload.className = showDownload.className.replace(/(?:^|\s)disabled(?!\S)/g, "")
        showTable.className = showTable.className.replace(/(?:^|\s)disabled(?!\S)/g, "")
        areaSelection = true
      }
    })
    // event for shift key up
    // destroys overlay div and transformes multiSelectOverlay to false
    document.addEventListener("keyup", (e) => {
      //console.log("keyup")
      if (e.which === 16 && multiSelectOverlay) {
        $(".graph-overlay").hide()
        multiSelectOverlay.destroy()
        multiSelectOverlay = false
      }
    })

    //startMultiSelect(g, renderer, layout)

    defaultZooming(layout, renderer)

    // used to center on the node with more links
    // this is used to skip if it is a re-run button execution
    if (storeMasterNode.length > 0) {
      recenterDOM(renderer, layout, storeMasterNode)
    } else {
      console.log("stored node is empty", storeMasterNode)
    }

    //* ************//
    //* **ZOOMING***//
    //* ************//

    // opens events in webgl such as mouse hoverings or clicks

    $("#zoom_in").click( (event) => {
      event.preventDefault()
      renderer.zoomIn()
      renderer.rerender()   // rerender after zoom avoids glitch with
      // duplicated nodes
    })
    $("#zoom_out").click( (event) => {
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

    toggle_status = false // default state
    $("#toggle-event").bootstrapToggle("off") // set to default off
    $("#toggle-event").change(function () {   // jquery seems not to support es6
      toggle_status = $(this).prop("checked")
      toggle_manager(toggle_status)
      // TODO this should be reworked because it conflicts with
      // popup_description highlight node. Maybe it can be this function can
      // be combined with popup_description
    })

    //* *************//
    //* ** EVENTS ***//
    //* *************//

    const events = Viva.Graph.webglInputEvents(graphics, g)
    store_nodes = []  // list used to store nodes
    // changes the color of node and links (and respective linked nodes) of this node when clicked
    events.dblClick( (node) => {
      store_nodes.push(node.id)
      let colorToUse
      //console.log('Single click on node: ' + node.id)
      const nodeUI = graphics.getNodeUI(node.id)
      if (toggle_status === true) {   // if statement to check if toggle
        // button is enabled
        // statement when node and linked nodes are still in default color
        if (nodeUI.color === nodeColor) {
          colorToUse = [0xc89933, 0x000000FF, 0x7c3912]
        }
        // statement when linked node is selected
        else if (nodeUI.color === 0x7c3912) {
          colorToUse = [0xc89933, 0x000000FF, 0x7c3912]
        }
        // statement when node is shaded
        else if (nodeUI.color === 0xcdc8b1) {
          colorToUse = [0xc89933, 0x000000FF, 0x7c3912]
        }
        // statement do deselect node and linked nodes
        else {
          // resets the color of node and respective links (and linked nodes) if it was previously checked (on click)
          colorToUse = [nodeColor, 0xb3b3b3ff, nodeColor]
        }
        nodeUI.color = colorToUse[0]
        g.forEachLinkedNode(node.id, (linkedNode, link) => {
          const linkUI = graphics.getLinkUI(link.id)
          linkUI.color = colorToUse[1]
          const linked_nodeUI = graphics.getNodeUI(linkedNode.id)
          if (linked_nodeUI.color !== 0xc89933) {
            linked_nodeUI.color = colorToUse[2]
          }
        })
      }
      renderer.rerender()
    })

    //* * mouse click on nodes **//
    events.click( (node, e) => {
      // this resets previous selected node to previous color
      if (clickedNode) {
        graphics.getNodeUI(clickedNode).color = graphics.getNodeUI(clickedNode).backupColor
      }
      // then starts making new changes to the newly geerated node
      clickedNode = node.id
      nodeUI_1 = graphics.getNodeUI(node.id)
      const domPos = {
        x: nodeUI_1.position.x,
        y: nodeUI_1.position.y
      }
      // if statement used to check if backup color is set
      if (nodeUI_1.backupColor) { nodeUI_1.backupColor = nodeUI_1.color }

      nodeUI_1.color = 0xFFC300
      renderer.rerender()

      // allows the control of the click appearing and locking

      // And ask graphics to transform it to DOM coordinates:
      graphics.transformGraphToClientCoordinates(domPos)
      domPos.x = (domPos.x + nodeUI_1.size) + 'px'
      domPos.y = (domPos.y) + 'px'

      // call the requests
      const requestPlasmidTable = (node, setupPopupDisplay) => {
        // if statement to check if node is in database or is a new import
        // from mapping
        if (node.data.seq_length) {
          $.get('api/getspecies/', {'accession': node.id}, (data, status) => {
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
            // check if data can be called as json object properly from db something like data.species or data.length
            setupPopupDisplay(node, speciesName, plasmidName) //callback
            // function for
            // node displaying after fetching data from db
          })
        }


        // exception when node has no length (used on new nodes?)
        else {
          speciesName = 'N/A'
          plasmidName = 'N/A'
          setupPopupDisplay(node, speciesName, plasmidName) //callback
        }
      }

      const setupPopupDisplay = (node, speciesName, plasmidName) => {
        // this sets the popup internal buttons to allow them to run,
        // otherwise they won't run because its own function returns this
        // variable to false, preveting the popup to expand with its
        // respectiv functions
        clickedPopupButtonCard = true
        clickedPopupButtonRes = true
        clickedPopupButtonFamily = true

        // first needs to empty the popup in order to avoid having
        // multiple entries from previous interactions
        $("#popup_description").empty()
        $("#popup_description").append(
          "<button id='close' class='btn btn-default' type='button'>&times;</button>" +
          "<button class='btn btn-default' id='downloadCsv'" +
          "type='button' data-toogle='tooptip'" +
          "title='Export as csv'>" +
          "<span class='glyphicon glyphicon-save-file'></span>" +
          "</button>" +
          "<div>General sequence info" +
          "<div id='accessionPop'>" +
          node.data.sequence + "</div>" +
          "<div id='speciesNamePop'><span style='color: #468499'>Species:" +
          " </span>" + speciesName +
          "</div>" + node.data.seq_length +
          "<div id='plasmidNamePop'>" +
          "<span style='color: #468499'>Plasmid: </span>" + plasmidName +
          "</div><div id='percentagePop'>" +
          "<span style='color: #468499'>Percentage:" +
          " </span>" + node.data.percentage +
          "</div><div id='copyNumberPop'>" +
          "<span style='color: #468499'>Relative copy number: " +
          "</span>" + node.data.copyNumber +
          "</div>" +
          // adds buttons for resistances and plasmid families
          "<br />" +
          "<div style='float: left;' class='btn btn-default'" +
          " id='resButton'>" +
          " Resistances" +
          "</div>" +
          "<div style='float: right;' class='btn btn-default'" +
          " id='plasmidButton'>" +
          "Plasmid families" +
          "</div>" +
          "</div>"
        )
        $("#popup_description").show()
      }
      // requests table for sequences metadata
      requestPlasmidTable(node, setupPopupDisplay)
    })

    //* * mouse hovering block end **//
    renderer.rerender()

    //* * Loading Screen goes off **//
    $('#loading').hide()
    $("#couve-flor").css("visibility", "visible")

    //* **************//
    //* ** BUTTONS ***//
    //* **************//

    $(document).on("click", "#close", function() {
      $(this).parent().hide()
      graphics.getNodeUI(clickedNode).color = nodeUI_1.backupColor
      renderer.rerender()
    })

    //**** BUTTONS THAT CONTROL PLOTS ****//

    let clickerButton, listPlots

    // Button to open modal for plots
    // all these buttons require that the modalPlot modal opens before
    // executing the function and that is the reason why they wait half a
    // second before executing repetitivePlotFunction's
    $("#refreshButton").on("click", function (e) {
      clickerButton = "species"
      console.log("listgifilter refreshbutton", listGiFilter)
      console.log("reloadaccessionlist", reloadAccessionList)
      listGiFilter = (reloadAccessionList.length !== 0) ?
        // reduces listGiFilter to reloadAccessionList
        listGiFilter.filter((n) => reloadAccessionList.includes(n)) :
        // otherwise maintain listGiFilter untouched
        listGiFilter

      setTimeout( () => {
        listPlots = repetitivePlotFunction(areaSelection, listGiFilter, clickerButton, g, graphics)
      }, 500)
    })

    $("#speciesStats").on("click", function (e) {
      clickerButton = "species"
      setTimeout( () => {
        listPlots = repetitivePlotFunction(areaSelection, listGiFilter, clickerButton, g, graphics)
      },500)
    })

    $("#genusStats").on("click", function (e) {
      clickerButton = "genus"
      setTimeout( () => {
        listPlots = repetitivePlotFunction(areaSelection, listGiFilter, clickerButton, g, graphics)
      }, 500)
    })

    $("#familyStats").on("click", function (e) {
      clickerButton = "family"
      setTimeout( () => {
        listPlots = repetitivePlotFunction(areaSelection, listGiFilter, clickerButton, g, graphics)
      }, 500)
    })

    $("#orderStats").on("click", function (e) {
      clickerButton = "order"
      setTimeout( () => {
        listPlots = repetitivePlotFunction(areaSelection, listGiFilter, clickerButton, g, graphics)
      }, 500)
    })

    $("#resistanceStats").on("click", function (e) {
      clickerButton = "res"
      setTimeout( () => {
        listPlots = resRepetitivePlotFunction(areaSelection, listGiFilter, clickerButton, g, graphics)
      }, 500)
    })

    $("#pfamilyStats").on("click", function (e) {
      clickerButton = "pf"
      setTimeout( () => {
        listPlots = pfRepetitivePlotFunction(areaSelection, listGiFilter, clickerButton, g, graphics)
      }, 500)
    })

    // redundant with speciesStats but may be useful in the future
    $("#lengthStats").on("click", function (e) {
      clickerButton = "length"
      setTimeout( () => {
        listPlots = repetitivePlotFunction(areaSelection, listGiFilter, clickerButton, g, graphics)
      }, 500)
    })

    // TODO get a way to sort the array generated inside getMetadata
    // sort by values
    $("#sortGraph").on("click", function (e) {
      const sortVal = true
      let color
      const layout = {
        yaxis: {
          title: "Number of selected plasmids"
        },
        xaxis: {
          title: clickerButton,
          tickangle: -45
        },
        title: `${clickerButton} in selection`,
        margin: {
          b: 200,
          l: 100
        }
      }

      if (clickerButton === "species") {
        color = "#B71C1C"
      } else if (clickerButton === "genus") {
        color = "red"
      } else if (clickerButton === "family") {
        color = "#FF5722"
      } else if (clickerButton === "order") {
        color = "orange"
      } else if (clickerButton === "length") {
        color = "#2196F3"
      }
      // this makes it faster instead of querying everything again
      if (listPlots) { statsParser(listPlots, layout, true, color, false, sortVal) }
    })

    // sort alphabetically
    $("#sortGraphAlp").on("click", function (e) {
      const sortAlp = true
      let color
      const layout = {
        yaxis: {
          title: "Number of selected plasmids"
        },
        xaxis: {
          title: clickerButton,
          tickangle: -45
        },
        title: `${clickerButton} in selection`,
        margin: {
          b: 200,
          l: 100
        }
      }

      if (clickerButton === "species") {
        color = "#B71C1C"
      } else if (clickerButton === "genus") {
        color = "red"
      } else if (clickerButton === "family") {
        color = "#FF5722"
      } else if (clickerButton === "order") {
        color = "orange"
      } else if (clickerButton === "length") {
        color = "#2196F3"
      }
      // this makes it faster instead of querying everything again
      if (listPlots) { statsParser(listPlots, layout, true, color, sortAlp, false) }
    })

    // BUTTONS INSIDE PLOT MODAL THAT ALLOW TO SWITCH B/W PLOTS //

    // if buttons inside modalPlot are pressed

    $("#lengthPlot").on("click", function (e) {
      clickerButton = "length"
      // TODO save previous plotly generated graphs before rendering the new ones
      listPlots = repetitivePlotFunction(areaSelection, listGiFilter, clickerButton, g, graphics)
    })

    $("#speciesPlot").on("click", function (e) {
      clickerButton = "species"
      listPlots = repetitivePlotFunction(areaSelection, listGiFilter, clickerButton, g, graphics)
    })

    $("#genusPlot").on("click", function (e) {
      clickerButton = "genus"
      listPlots = repetitivePlotFunction(areaSelection, listGiFilter, clickerButton, g, graphics)
    })

    $("#familyPlot").on("click", function (e) {
      clickerButton = "family"
      listPlots = repetitivePlotFunction(areaSelection, listGiFilter, clickerButton, g, graphics)
    })

    $("#orderPlot").on("click", function (e) {
      clickerButton = "order"
      listPlots = repetitivePlotFunction(areaSelection, listGiFilter, clickerButton, g, graphics)
    })

    $("#resPlot").on("click", function (e) {
      clickerButton = "res"
      listPlots = resRepetitivePlotFunction(areaSelection, listGiFilter, clickerButton, g, graphics)
    })

    $("#pfPlot").on("click", function (e) {
      clickerButton = "pf"
      listPlots = pfRepetitivePlotFunction(areaSelection, listGiFilter, clickerButton, g, graphics)
    })

    //**** BUTTONS THAT CONTROL VIVAGRAPH DISPLAY ****//

    // Buttons to control force play/pause using bootstrap navigation bar
    paused = true
    $('#playpauseButton').on('click', function (e) {
      $('#playpauseButton').empty()
      if (paused === true) {
        renderer.resume()
        $('#playpauseButton').append('<span class="glyphicon glyphicon-pause"></span>')
        paused = false
      } else {
        renderer.pause()
        $('#playpauseButton').append('<span class="glyphicon glyphicon-play"></span>')
        paused = true
      }
    })

    // Form and button for search box
    $("#submitButton").click(function (event) {
      const query = $("#formValueId").val().replace(".", "_")
      //console.log('search query: ' + query)
      event.preventDefault()
      g.forEachNode( (node) => {
        const nodeUI = graphics.getNodeUI(node.id)
        const sequence = node.data.sequence.split(">")[3].split("<")[0]
        // console.log(sequence)
        //nodeUI = graphics.getNodeUI(node.id)
        const x = nodeUI.position.x,
          y = nodeUI.position.y
        if (sequence === query) {
          // centers graph visualization in a given node, searching for gi
          renderer.moveTo(x, y)
        }
      })
    })
    // Button to clear the selected nodes by form
    $("#clearButton").click(function (event) {
      document.getElementById("formValueId").value = ""
    })

    //* ***********************//
    //* ***Fast Form filter****//
    //* ***********************//

    // Form search box utils

    // then applying autocomplete function
    // $( () => {
    //   $('#formValueId').autocomplete({
    //     source: list_gi
    //   })
    // })

    //* ******************//
    //* ***plasmidfinder Filters****//
    //* ******************//

    if (firstInstace === true) {
      getArray_pf().done((json) => {
        // first parse the json input file
        const listPF = []
        // iterate over the file
        $.each(json, (accession, entry) => {
          geneEntries = entry.gene
          for (let i in geneEntries) {
            if (listPF.indexOf(geneEntries[i]) < 0) {
              listPF.push(geneEntries[i])
            }
          }
        })
        // populate the menus
        singleDropdownPopulate("#plasmidFamiliesList", listPF, "PlasmidfinderClass")

        $(".PlasmidfinderClass").on("click", function (e) {
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
      node_color_reset(graphics, g, nodeColor, renderer)
      if (typeof showLegend !== "undefined" && $("#scaleLegend").html() === "") {
        showLegend.style.display = "none"
        showRerun.style.display = "none"
        showGoback.style.display = "none"
        showDownload.style.display = "none"
        showTable.style.display = "none"
      } else {
        $("#colorLegendBox").empty()
        document.getElementById("taxa_label").style.display = "none" // hide label
        showRerun.style.display = "none"
        showGoback.style.display = "none"
        showDownload.style.display = "none"
        showTable.style.display = "none"
      }
    })

    $("#pfSubmit").unbind("click").bind("click", (event) => {
      event.preventDefault()
      // reset nodes before submitting new colors
      const legendInst = pfSubmitFunction(g, graphics, renderer)
      // just show legend if any selection is made at all
      if (legendInst === true) {
        showLegend.style.display = "block"
        showRerun.style.display = "block"
        showGoback.style.display = "block"
        showDownload.style.display = "block"
        showTable.style.display = "block"
        showGoback.className = showGoback.className.replace(/(?:^|\s)disabled(?!\S)/g, "")
        showDownload.className = showDownload.className.replace(/(?:^|\s)disabled(?!\S)/g, "")
        showTable.className = showTable.className.replace(/(?:^|\s)disabled(?!\S)/g, "")
      }
    })

    //* ******************//
    //* ***Resistance Filters****//
    //* ******************//

    // first parse the json input file
    if (firstInstace === true) {
      getArray_res().done((json) => {
        const listCard = [],
          listRes = []
        // iterate over the file
        $.each(json, (accession, entry) => {
          databaseEntries = entry.database
          geneEntries = entry.gene
          for (let i in databaseEntries) {
            if (databaseEntries[i] === "card" && listCard.indexOf(geneEntries[i]) < 0) {
              listCard.push(geneEntries[i])
            } else {
              if (listRes.indexOf(geneEntries[i]) < 0) {
                listRes.push(geneEntries[i])
              }
            }
          }
        })
        // populate the menus
        singleDropdownPopulate("#cardList", listCard, "CardClass")
        singleDropdownPopulate("#resList", listRes, "ResfinderClass")

        const classArray = [".CardClass", ".ResfinderClass"]
        for (let i = 0; i < classArray.length; i++) {
          $(classArray[i]).on("click", function (e) {
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
      document.getElementById("reset-sliders").click()
      // clear = true;
      event.preventDefault()
      resetDisplayTaxaBox(["p_Resfinder", "p_Card"])

      // resets dropdown selections
      $("#cardList").selectpicker("deselectAll")
      $("#resList").selectpicker("deselectAll")

      slider.noUiSlider.set([min, max])
      node_color_reset(graphics, g, nodeColor, renderer)
      if (typeof showLegend !== "undefined" && $("#scaleLegend").html() === "") {
        showLegend.style.display = "none"
        showRerun.style.display = "none"
        showGoback.style.display = "none"
        showDownload.style.display = "none"
        showTable.style.display = "none"
      } else {
        $("#colorLegendBox").empty()
        document.getElementById("taxa_label").style.display = "none" // hide label
        showRerun.style.display = "none"
        showGoback.style.display = "none"
        showDownload.style.display = "none"
        showTable.style.display = "none"
      }
    })
    $("#resSubmit").unbind("click").bind("click", (event) => {
      console.log("ressubmit")
      event.preventDefault()
      // TODO reset nodes before adding new colors
      // same should be done for taxa filters submit button
      const legendInst = resSubmitFunction(g, graphics, renderer)
      // just show legend if any selection is made at all
      if (legendInst === true) {
        showLegend.style.display = "block"
        showRerun.style.display = "block"
        showGoback.style.display = "block"
        showDownload.style.display = "block"
        showTable.style.display = "block"
        showGoback.className = showGoback.className.replace(/(?:^|\s)disabled(?!\S)/g, "")
        showDownload.className = showDownload.className.replace(/(?:^|\s)disabled(?!\S)/g, "")
        showTable.className = showTable.className.replace(/(?:^|\s)disabled(?!\S)/g, "")
      }
    })


    //* ******************//
    //* ***Taxa Filter****//
    //* ******************//

    const list_orders = [],
      list_families = [],
      list_genera = [],
      list_species = []
    if (firstInstace === true) {
      getArray_taxa().done((json) => {
        $.each(json, (sps, other) => {    // sps aka species
          const species = sps.split("_").join(" ")
          const genus = other[0]
          const family = other[1]
          const order = other[2]
          dict_genera[species] = [genus, family, order] // append the list to
          // this dict to be used later
          if (list_genera.indexOf(genus) < 0) {
            list_genera.push(genus)
          }
          if (list_families.indexOf(family) < 0) {
            list_families.push(family)
          }
          if (list_orders.indexOf(order) < 0) {
            list_orders.push(order)
          }
          if (list_species.indexOf(species) < 0) {
            list_species.push(species)
          }
        })

        // populate the menus
        singleDropdownPopulate("#orderList", list_orders, "OrderClass")
        singleDropdownPopulate("#familyList", list_families, "FamilyClass")
        singleDropdownPopulate("#genusList", list_genera, "GenusClass")
        singleDropdownPopulate("#speciesList", list_species, "SpeciesClass")

        // clickable <li> and control of displayer of current filters
        const classArray = [".OrderClass", ".FamilyClass", ".GenusClass", ".SpeciesClass"]
        for (let i = 0; i < classArray.length; i++) {
          $(classArray[i]).on("click", function (e) {
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
      node_color_reset(graphics, g, nodeColor, renderer)
      if (typeof showLegend !== "undefined" && $("#scaleLegend").html() === "") {
        showLegend.style.display = "none"
        showRerun.style.display = "none"
        showGoback.style.display = "none"
        //document.getElementById("go_back").className += " disabled"
        showDownload.style.display = "none"
        showTable.style.display = "none"
      } else {
        $("#colorLegendBox").empty()
        document.getElementById("taxa_label").style.display = "none" // hide label
        showRerun.style.display = "none"
        showGoback.style.display = "none"
        //document.getElementById("go_back").className += " disabled"
        showDownload.style.display = "none"
        showTable.style.display = "none"
      }
    })

    //* **** Submit button for taxa filter *****//

    // perform actions when submit button is clicked.

    $("#taxaModalSubmit").unbind("click").bind("click", (event) => {
      event.preventDefault()
      // changed nodes is reset every instance of taxaModalSubmit button
      // let changed_nodes = []

      console.log("listGiFilter taxamodalsubmit", listGiFilter, dict_genera)
      listGiFilter = []   // makes listGiFilter an empty array
      noLegend = false // sets legend to hidden state by default
      // now processes the current selection
      const species_query = document.getElementById("p_Species").innerHTML,
        genus_query = document.getElementById("p_Genus").innerHTML,
        family_query = document.getElementById("p_Family").innerHTML,
        order_query = document.getElementById("p_Order").innerHTML
      console.log(species_query)
      let selectedSpecies = species_query.replace("Species:", "").split(",").filter(Boolean),
        selectedGenus = genus_query.replace("Genus:", "").split(",").filter(Boolean),
        selectedFamily = family_query.replace("Family:", "").split(",").filter(Boolean),
        selectedOrder = order_query.replace("Order:", "").split(",").filter(Boolean)
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
      // control the alertClose button

      $("#alertClose").click( () => {
        $("#alertId").hide()  // hide this div
      })

      // control button to close div
      $("#alertCloseNCBI").click( () => {
        $("#alertNCBI").hide()  // hide this div
      })

      // auto hide after 5 seconds without closing the div
      // TODO what is this for? XD
      window.setTimeout( () => { $("#alertId").hide() }, 5000)

      //* *** End Alert for taxa filter ****//

      // make tmpselectedGenus an associative array since it is the base of family and order arrays

      let assocFamilyGenus = {}
      let assocOrderGenus = {}
      let assocGenus = {}

      // appends genus to selectedGenus according with the family and order for single-color selection
      // also appends to associative arrays for family and order for multi-color selection
      $.each(dict_genera, function (species, pair) {
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
      let store_lis = "" // a variable to store all <li> generated for legend
      let firstIteration = true // boolean to control the upper taxa level
      // (order or family)

      // first restores all nodes to default color
      node_color_reset(graphics, g, nodeColor, renderer)

      // if multiple selections are made in different taxa levels
      if (counter > 1 && counter <= 4) {
        currentColor = 0xf71735   // sets color of all changes_nodes to be red
        store_lis = "<li class='centeredList'><button class='jscolor btn'" +
          " btn-default' style='background-color:#f71735'></button>&nbsp;multi-level selected taxa</li>"
        for (i in alertArrays.order) {
          let currentSelection = alertArrays.order
          for (i in currentSelection) {
            const tempArray = assocOrderGenus[currentSelection[i]]
            for (sp in tempArray) {
              taxaRequest(g, graphics, renderer, tempArray[sp], currentColor, reloadAccessionList)//, changed_nodes)
                .then(results => {
                  results.map(request => {
                    listGiFilter.push(request.plasmid_id)
                  })
                })
            }
          }
        }
        for (i in alertArrays.family) {
          let currentSelection = alertArrays.family
          for (i in currentSelection) {
            const tempArray = assocFamilyGenus[currentSelection[i]]
            for (sp in tempArray) {
              taxaRequest(g, graphics, renderer, tempArray[sp], currentColor, reloadAccessionList)//, changed_nodes)
                .then(results => {
                  results.map(request => {
                    listGiFilter.push(request.plasmid_id)
                  })
                })
            }
          }
        }
        for (i in alertArrays.genus) {
          let currentSelection = alertArrays.genus
          for (i in currentSelection) {
            const tempArray = assocGenus[currentSelection[i]]
            for (sp in tempArray) {
              taxaRequest(g, graphics, renderer, tempArray[sp], currentColor, reloadAccessionList)//, changed_nodes)
                .then(results => {
                  results.map(request => {
                    listGiFilter.push(request.plasmid_id)
                  })
                })
            }
          }
        }
        for (i in alertArrays.species) {
          let currentSelection = alertArrays.species
          for (i in currentSelection) {
            taxaRequest(g, graphics, renderer, currentSelection[i], currentColor, reloadAccessionList)//, changed_nodes)
              .then(results => {
                results.map(request => {
                  listGiFilter.push(request.plasmid_id)
                })
              })
          }
        }
      }
      // renders the graph for the desired taxon if one taxon type is selected
      // allows for different colors between taxa of the same level
      else if (counter === 1) {
        console.log("alert arrays 1", alertArrays, assocGenus)
        // first cycle between all the arrays to find which one is not empty
        for (array in alertArrays) {
          // selects the not empty array
          if (alertArrays[array] != '' && firstIteration == true) {
            var currentSelection = alertArrays[array]
            // performs the actual interaction for color picking and assigning
            for (i in currentSelection) {

              // orders //
              if (alertArrays['order'] != '') {
                var currentColor = colorList[i].replace('#', '0x')
                var tempArray = assocOrderGenus[currentSelection[i]]
                style_color = 'background-color:' + colorList[i]
                store_lis = store_lis + '<li' +
                  ' class="centeredList"><button class="jscolor btn' +
                  ' btn-default" style=' + style_color + '></button>&nbsp;' + currentSelection[i] + '</li>'
                // executres node function for family and orders
                for (sp in tempArray) {
                  taxaRequest(g, graphics, renderer, tempArray[sp], currentColor, reloadAccessionList)//, changed_nodes)
                    .then(results => {
                      results.map(request => {
                        listGiFilter.push(request.plasmid_id)
                      })
                    })
                }
              }

              // families //
              else if (alertArrays['family'] != '') {
                var currentColor = colorList[i].replace('#', '0x')
                var tempArray = assocFamilyGenus[currentSelection[i]]
                style_color = 'background-color:' + colorList[i]
                store_lis = store_lis + '<li' +
                  ' class="centeredList"><button class="jscolor btn' +
                  ' btn-default" style=' + style_color + '></button>&nbsp;' + currentSelection[i] + '</li>'
                // executres node function for family
                for (sp in tempArray) {
                  taxaRequest(g, graphics, renderer, tempArray[sp], currentColor, reloadAccessionList)//, changed_nodes)
                    .then(results => {
                      results.map(request => {
                        listGiFilter.push(request.plasmid_id)
                      })
                    })
                }
              }

              // genus //
              else if (alertArrays['genus'] != '') {
                var currentColor = colorList[i].replace('#', '0x')
                var tempArray = assocGenus[currentSelection[i]]
                style_color = 'background-color:' + colorList[i]
                store_lis = store_lis + '<li class="centeredList"><button class="jscolor btn btn-default" style=' + style_color + '></button>&nbsp;' + currentSelection[i] + '</li>'

                // requests taxa associated accession from db and colors
                // respective nodes
                for (sp in tempArray) {
                  taxaRequest(g, graphics, renderer, tempArray[sp], currentColor, reloadAccessionList)//, changed_nodes)
                    .then(results => {
                      results.map(request => {
                        listGiFilter.push(request.plasmid_id)
                      })
                    })
                }
              }

              // species //
              else if (alertArrays['species'] != []) {
                console.log("test species")
                var currentColor = colorList[i].replace('#', '0x')
                style_color = 'background-color:' + colorList[i]
                store_lis = store_lis + '<li class="centeredList"><button class="jscolor btn btn-default" style=' + style_color + '></button>&nbsp;' + currentSelection[i] + '</li>'

                // requests taxa associated accession from db and colors
                // respective nodes
                taxaRequest(g, graphics, renderer, currentSelection[i], currentColor, reloadAccessionList)//, changed_nodes)
                  .then(results => {
                    results.map(request => {
                      listGiFilter.push(request.plasmid_id)
                    })
                  })
              }
            }
            firstIteration = false // stops getting lower levels
          }
        }
      }
      // used to control if no selection was made avoiding to display the legend
      else {
        noLegend = true
      }
      // show legend //
      if (noLegend == false) {
        showLegend.style.display = 'block'
        document.getElementById('taxa_label').style.display = 'block' // show label
        $('#colorLegendBox').empty()
        $('#colorLegendBox').append(store_lis +
          '<li class="centeredList"><button class="jscolor btn btn-default" style="background-color:#666370" ></button>&nbsp;unselected</li>')
        showRerun.style.display = 'block'
        showGoback.style.display = 'block'
        showDownload.style.display = 'block'
        showTable.style.display = 'block'
      }
    })

    //* ************//
    //* ***READS****//
    //* ************//

    $('#fileSubmit').click(function (event) {
      resetAllNodes(graphics, g, nodeColor, renderer, showLegend, showRerun,
        showGoback, showDownload, showTable, idsArrays)
      event.preventDefault()
      $('#loading').show()
      setTimeout(function () {
        list_gi, listGiFilter = readColoring(g, list_gi, graphics, renderer)
      }, 100)

      // }
      // used to hide when function is not executed properly
      setTimeout(function () {
        $('#loading').hide()
      }, 100)
    })

    $('#cancel_infile').click(function (event) {
      abortRead(read_json)
    })

    //* ************//
    //* ***MASH****//
    //* ************//

    $('#fileSubmit_mash').click(function (event) {
      read_json = mash_json // conerts mash_json into read_json to overwrite
      // it and use the same function (readColoring)
      console.log("mash")
      resetAllNodes(graphics, g, nodeColor, renderer, showLegend, showRerun,
        showGoback, showDownload, showtable, idsArrays)
      event.preventDefault()
      $('#loading').show()
      setTimeout(function () {
        list_gi, listGiFilter = readColoring(g, list_gi, graphics, renderer)
      }, 100)

      // }
      // used to hide when function is not executed properly
      setTimeout(function () {
        $('#loading').hide()
      }, 100)
    })

    $('#cancel_infile_mash').click(function (event) {
      abortRead(mash_json)
    })

    //* ********* ***//
    //* * Assembly **//
    //* ********* ***//
    $('#assemblySubmit').click(function (event) {
      event.preventDefault()
      resetAllNodes(graphics, g, nodeColor, renderer, showLegend, showRerun,
        showGoback, showDownload, showTable, idsArrays)
      $('#loading').show()
      setTimeout(function () {
        assembly(list_gi, assembly_json, g, graphics, renderer)
      }, 100)

      // }
      // used to hide when function is not executed properly
      setTimeout(function () {
        $('#loading').hide()
      }, 100)
    })

    $('#cancel_assembly').click(function (event) {
      abortRead(assembly_json)
    })

    //* *********************//
    //* * Distances filter **//
    //* *********************//
    $('#distancesSubmit').click(function (event) {
      event.preventDefault()
      $('#loading').show()
      $('#scaleLegend').empty()
      setTimeout(function () {
        link_coloring(g, graphics, renderer)
      }, 100)
      const readMode = false
      color_legend(readMode)
      //document.getElementById('reset-links').disabled = ''
    })

    $('#reset-links').click(function (event) {
      event.preventDefault()
      document.getElementById('distance_label').style.display = 'none' // hide label
      if ($('#colorLegendBox').html() === '') {
        $('#scaleLegend').empty()
        //showLegend = document.getElementById('colorLegend') // global
        // variable to be reset by the button reset-filters
        showLegend.style.display = 'none'
      } else {
        $('#scaleLegend').empty()
      }
      setTimeout(function () {
        reset_link_color(g, graphics, renderer)
      }, 100)
      //document.getElementById('reset-links').disabled = 'disabled'
    })

    //* ********************//
    //* ***Length filter****//
    //* ********************//

    //* * slider button and other options **//

    // sets the limits of buttons and slider
    // this is only triggered on first instance because we only want to get
    // the limits of all plasmids once
    if (sliderMinMax.length === 0) {
      sliderMinMax = [Math.log(Math.min.apply(null, list_lengths)),
        Math.log(Math.max.apply(null, list_lengths))]
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
    $("#length_filter").click( (event) => {
      slider.noUiSlider.on("set", (event) => {
        let slider_max = Math.exp(slider.noUiSlider.get()[1]),
          slider_min = Math.exp(slider.noUiSlider.get()[0])
        g.forEachNode( (node) => {
          // check if node is not a singleton
          // singletons for now do not have size set so they cannot be
          // filtered with this method
          // only changes nodes for nodes with seq_length data
          if (node.data.seq_length) {
            const node_length = node.data.seq_length.split(">").slice(-1).toString()
            let nodeUI = graphics.getNodeUI(node.id)
            if (parseInt(node_length) < parseInt(slider_min) || parseInt(node_length) > parseInt(slider_max)) {
              nodeUI.color = 0xcdc8b1 // shades nodes
            } else if (parseInt(node_length) >= parseInt(slider_min) || parseInt(node_length) <= parseInt(slider_max)) {
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

    // function setSliderHandle (i, value) {
    //   var r = [null, null]
    //   r[i] = value
    //   slider.noUiSlider.set(r)
    // }

    // Listen to keydown events on the input field.
    // inputs.forEach(function (input, handle) {
    //   input.addEventListener('change', function () {
    //     setSliderHandle(handle, this.value)
    //   })
    //
    //   input.addEventListener('keydown', function (e) {
    //     var values = slider.noUiSlider.get()
    //     var value = Number(values[handle])
    //
    //     // [[handle0_down, handle0_up], [handle1_down, handle1_up]]
    //     var steps = slider.noUiSlider.steps()
    //
    //     // [down, up]
    //     var step = steps[handle]
    //
    //     var position
    //
    //     // 13 is enter,
    //     // 38 is key up,
    //     // 40 is key down.
    //     switch (e.which) {
    //       case 13:
    //         setSliderHandle(handle, this.value)
    //         break
    //
    //       case 38:
    //
    //         // Get step to go increase slider value (up)
    //         position = step[1]
    //
    //         // false = no step is set
    //         if (position === false) {
    //           position = 1
    //         }
    //
    //         // null = edge of slider
    //         if (position !== null) {
    //           setSliderHandle(handle, value + position)
    //         }
    //
    //         break
    //
    //       case 40:
    //
    //         position = step[0]
    //
    //         if (position === false) {
    //           position = 1
    //         }
    //
    //         if (position !== null) {
    //           setSliderHandle(handle, value - position)
    //         }
    //         break
    //     }
    //   })
    // })

    // resets the slider
    $('#reset-sliders').click(function (event) {
      listGiFilter = [] //resets listGiFilter
      areaSelection = false
      slider.noUiSlider.set(sliderMinMax)
      resetAllNodes(graphics, g, nodeColor, renderer, showLegend, showRerun,
        showGoback, showDownload, showTable, idsArrays)
    })
    // runs the re run operation for the selected species
    $('#Re_run').click(function (event) {
      console.log("rerun listGiFilter", listGiFilter)
      // resets areaSelection
      areaSelection = false
      //* * Loading Screen goes on **//
      //console.log("click", listGiFilter)
      // removes disabled from class in go_back button
      document.getElementById("go_back").className = document.getElementById("go_back").className.replace(/(?:^|\s)disabled(?!\S)/g, "")
      document.getElementById("download_ds").className = document.getElementById("download_ds").className.replace(/(?:^|\s)disabled(?!\S)/g, "")
      document.getElementById("tableShow").className = document.getElementById("tableShow").className.replace(/(?:^|\s)disabled(?!\S)/g, "")
      show_div(
        // removes nodes
        actual_removal(g, graphics, onload)
      )
    })

    // returns to the initial tree by reloading the page
    $('#go_back').click(function (event) {
      //console.log('returning to main')
      window.location.reload()   // a temporary fix to go back to full dataset
    })
  } // closes renderGraph
  //}) //end of getArray

  const init = () => {
    if (firstInstace === true) {
      // the next if statement is only executed on development session, it
      // is way less efficient than the non development session.
      if (devel === true) {
        getArray.done(function (json) {
          $.each(json, function (sequence_info, dict_dist) {
            counter++
            // next we need to retrieve each information type independently
            const sequence = sequence_info.split("_").slice(0, 3).join("_");
            //var species = sequence_info.split("_").slice(2,4).join(" ");

            // and continues
            const seqLength = sequence_info.split("_").slice(-1).join("");
            const log_length = Math.log(parseInt(seqLength)); //ln seq length
            list_lengths.push(seqLength); // appends all lengths to this list
            list_gi.push(sequence)
            //checks if sequence is not in list to prevent adding multiple nodes for each sequence
            if (list.indexOf(sequence) < 0) {
              g.addNode(sequence, {
                sequence: "<font color='#468499'>Accession:" +
                " </font><a" +
                " href='https://www.ncbi.nlm.nih.gov/nuccore/" + sequence.split("_").slice(0, 2).join("_") + "' target='_blank'>" + sequence + "</a>",
                //species:"<font color='#468499'>Species:
                // </font>" + species,
                seq_length: "<font" +
                " color='#468499'>Sequence length:" +
                " </font>" + seqLength,
                log_length: log_length
              })
              list.push(sequence)

              // loops between all arrays of array pairing sequence and distances
              for (let i = 0; i < dict_dist.length; i++) {
                //console.log(dict_dist[i], Object.keys(dict_dist[i])[0])
                //const pairs = dict_dist[i]
                const reference = Object.keys(dict_dist[i])[0]  // stores references in a unique variable
                //console.log(Object.values(dict_dist[i])[0].distance)
                const distance = Object.values(dict_dist[i])[0].distance   // stores distances in a unique variable
                g.addLink(sequence, reference, distance)
              }
            }
            // checks if the node is the one with most links and stores it in
            // storedNode --> returns an array with storedNode and previousDictDist
            storeMasterNode = storeRecenterDom(storeMasterNode, dict_dist, sequence, counter)
          })
          // precompute before rendering
          renderGraph(graphics)
        }) //new getArray end
      } else {
        // this renders the graph when not in development session
        // this is a more efficient implementation which takes a different
        // file for loading the graph.
        getArray.done(function (json) {

          const addAllNodes = (array, callback) => {
            counter++
            const sequence = array.id
            const seqLength = array.length
            const log_length = Math.log(parseInt(seqLength))
            list_lengths.push(seqLength)
            list_gi.push(sequence)
            //console.log(array, sequence, seqLength, log_length)

            if (list.indexOf(sequence) < 0) {
              g.addNode(sequence, {
                sequence: "<font color='#468499'>Accession:" +
                " </font><a" +
                " href='https://www.ncbi.nlm.nih.gov/nuccore/" + sequence.split("_").slice(0, 2).join("_") + "' target='_blank'>" + sequence + "</a>",
                seq_length: "<font" +
                " color='#468499'>Sequence length:" +
                " </font>" + seqLength,
                log_length: log_length
              })
              layout.setNodePosition(sequence, array.position.x, array.position.y)
              list.push(sequence)
            }
            callback()
          }

          const addAllLinks = (array, callback) => {
            const sequence = array.parentId   // stores sequences
            const reference = array.childId  // stores references
            const distance = array.distance   // stores distances
            if (array.childId !== "") {
              // here it adds only unique links because filtered.json file
              // just stores unique links
              g.addLink(sequence, reference, distance)
            } else {
              console.log("empty array: ", array.childId , sequence)
            }
            callback()
          }

          // setup concurrency
          /* TODO I think this implementation is not limiting the number of
           nodes and links being added simultaneously but it assures that
            the code is run in a certain order.
            I.e. first all nodes are added, then all links are added and
             only then renderGraph is executed */
          const queue = async.queue(addAllNodes, 10)

          queue.drain = () => {
            //console.log("finished")
            // after getting all nodes, setup another concurrency for all links
            const queue2 = async.queue(addAllLinks, 10)

            queue2.drain = () => {
              //console.log("finished 2")
              renderGraph(graphics)
            }
            // attempting to queue json.links, which are the links to be added to the graph AFTER adding the nodes to the graph
            queue2.push(json.links)
          }
          // attempting to queue json.nodes which are basically the nodes I want to add first to the graph
          queue.push(json.nodes)
        })
      }
    } else {
      // storeMasterNode is empty in here
      rerun = true
      console.log("listGiFilter before requestDB", listGiFilter)
      listGiFilter, reloadAccessionList = requesterDB(g, listGiFilter, counter, storeMasterNode, renderGraph, graphics, reloadAccessionList)

      // this list_gi isn't the same as the initial but has information on
      // all the nodes that were used in filters
      // TODO masterNode needs to be used to re-center the graph
    }
  }

  //* ***********************************************//
  // control the infile input and related functions //
  //* ***********************************************//

  handleFileSelect('infile', '#file_text', function (new_read_json) {
    read_json = new_read_json //careful when redefining this because
    // read_json is a global variable
  })

  handleFileSelect('mashInfile', '#file_text_mash', function (new_mash_json) {
    mash_json = new_mash_json //global
  })

  handleFileSelect('assemblyfile', '#assembly_text', function (new_assembly_json) {
    assembly_json = new_assembly_json   //global
  })

  //* ****************************** *//
  //      Menu Button controls       //
  //* ****************************** *//

  $("#menu-toggle").on("click", function (e) {
    if (first_click_menu === true) {
      $("#menu-toggle").css({"color": "#fff"})
      first_click_menu = false
    } else {
      $("#menu-toggle").css({"color": "#999999"})
      first_click_menu = true
    }
  })

  // download button //
  $("#download_ds").unbind("click").bind("click", (e) => {
    //console.log(areaSelection)
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
    bootstrapTableList.push(row.id)
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
      for (row in rows) {
        bootstrapTableList.push(rows[row].id)
      }
    })
    // function to remove when all are selected
    .on("uncheck-all.bs.table", (e, rows) => {
      bootstrapTableList = []
    })

  // function to download dataset selected in table
  $("#downloadTable").unbind("click").bind("click", (e) => {
    // transform internal accession numbers to ncbi acceptable accesions
    const acc = bootstrapTableList.map((uniqueAcc) => {
      return uniqueAcc.split("_").splice(0,2).join("_")
    })
    multiDownload(acc, "nuccore", "fasta", fireMultipleDownloads)
  })
  // button to color selected nodes by check boxes
  $("#tableSubmit").unbind("click").bind("click", (e) => {
    $("#reset-sliders").click()
    colorNodes(g, graphics, bootstrapTableList, "0x3957ff")
    // handles hidden buttons
    showRerun.style.display = "block"
    showGoback.style.display = "block"
    showDownload.style.display = "block"
    showTable.style.display = "block"
    // sets listGiFilter to the selected nodes
    listGiFilter = bootstrapTableList
    renderer.rerender()
  })

  // function to create table
  $("#tableShow").unbind("click").bind("click", (e) => {
    $("#tableModal").modal()
    makeTable(listGiFilter, g)
  })
  // function to close table
  $("#cancelTable").unbind("click").bind("click", (e) => {
    $("#tableModal").modal("toggle")
  })

  // popup button for download csv
  // this only does single entry exports, for more exports table should be used
  $(document).on("click", "#downloadCsv", () => {

    const quickFixString = (divNameList) => {
      let returnArray = []
      for (i in divNameList) {
        const divName = divNameList[i]
        returnArray.push($(divName).text().replace(":", ","))
      }
      console.log(returnArray)
      return returnArray
    }
    // execute the same replacement function for all this divs
    const targetArray = quickFixString([
      "#accessionPop",
      "#speciesNamePop",
      "#speciesNamePop",
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
      "#pfRangePop"
    ])
    // then convert the resulting array to a csv file
    arrayToCsv(targetArray)
  })

  // resistance button control //
  $(document).on("click", "#resButton", function(event) {
    // controls the look of buttons
    $("#resButton").removeClass("btn-default").addClass("btn-primary")
    $("#plasmidButton").removeClass("btn-primary").addClass("btn-default")
    if (clickedPopupButtonCard === true) {
      clickedPopupButtonCard = resGetter(clickedNode)
      $("#pfTab").hide()
    } else {
      // when it is already queried and we are just cycling b/w the two divs
      // (tabs) then just show and hide the respective divs
      $("#resTab").show()
      $("#pfTab").hide()
    }
  })

  $(document).on("click", "#plasmidButton", function(event) {
    // controls the look of buttons
    $("#plasmidButton").removeClass("btn-default").addClass("btn-primary")
    $("#resButton").removeClass("btn-primary").addClass("btn-default")
    if (clickedPopupButtonFamily === true) {
      clickedPopupButtonFamily = plasmidFamilyGetter(clickedNode)
      $("#resTab").hide()
    } else {
      // when it is already queried and we are just cycling b/w the two divs
      // (tabs) then just show and hide the respective divs
      $("#pfTab").show()
      $("#resTab").hide()
    }
  })

  // this forces the entire script to run
  init() //forces main json or the filtered objects to run before
  // rendering the graph

  // keyboard shortcut to save file with node positions
  Mousetrap.bind("shift+ctrl+space", () => {
    initCallback(g, layout, devel)
  })

} // closes onload