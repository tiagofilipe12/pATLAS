// helps set menu to close status
var first_click_menu = true
// load JSON file
function getArray () {
  return $.getJSON('/test')   // change the input file name
}
// load JSON file with taxa dictionary
function getArray_taxa () {
  return $.getJSON('/taxa')   // change the input file name
}

// initiates vivagraph main functions
function onLoad () {
  var list = []   // list to store references already ploted as nodes
  var list_lengths = [] // list to store the lengths of all nodes
  var list_species = [] // lists all species
  var list_genera = [] // list all genera
  var list_gi = []
  g = Viva.Graph.graph()

  getArray().done(function (json) {
    $.each(json, function (sequence_info, dict_dist) {
        // next we need to retrieve each information type independently
      var sequence = sequence_info.split('_').slice(0, 3).join('_')

      /* trial request
        parameter name has to be the same as the one one reqparse on the server
        moved from "seq" to "accession"
        may overload the server. try to make the request on mouseover? make the first one and put on memory the result. 
        moved from "/api/getspecies/" to the relative path "api/getspecies/" (relative to the root)
      */
      $.get('api/getspecies/', {'accession': sequence}, function (data, status) {
        console.log(data, status)
      })

      // end of trial request

      var species = sequence_info.split('_').slice(3, 5)
        // added to check for errors in database regarding species characterization
      if (species[0] == ' ') {
        species = sequence_info.split('_').slice(4) + ' sp'
      }
        // and continues
      var genus = sequence_info.split('_').slice(3).join(' ')
      var seq_length = sequence_info.split('_').slice(-1).join('')
      var log_length = Math.log(parseInt(seq_length)) // ln seq length

      list_lengths.push(seq_length) // appends all lengths to this list
      list_species.push(species) // appends all species to this list
      list_genera.push(genus)
      list_gi.push(sequence)
        // checks if sequence is not in list to prevent adding multiple nodes for each sequence
      if (list.indexOf(sequence) < 0) {
        // sequence has no version of accession
        g.addNode(sequence, {sequence: "<font color='#468499'>seq_id: </font><a href='https://www.ncbi.nlm.nih.gov/nuccore/" + sequence.split('_').slice(0, 2).join('_') + "' target='_blank'>" + sequence + '</a>',
          species: "<font color='#468499'>Species: </font>" + species,
          seq_length: "<font color='#468499'>seq_length: </font>" + seq_length,
          log_length: log_length
        })
        list.push(sequence)
      }
          // loops between all arrays of array pairing sequence and distances
      for (var i = 0; i < dict_dist.length; i++) {
        var pairs = dict_dist[i]
        var reference = pairs[0].split('_').slice(0, 3).join('_')  // stores references in a unique variable
        var distance = pairs[1]   // stores distances in a unique variable
        g.addLink(sequence, reference, distance)
      };
    })
      // previously used to check the number of nodes provided
    var layout = Viva.Graph.Layout.forceDirected(g, {
      springLength: 30,
      springCoeff: 0.0001,
      dragCoeff: 0.01, // sets how fast nodes will separate from origin, the higher the value the slower
      gravity: -1.2,
      theta: 1
    })
      // precompute before redering
    precompute(1000, renderGraph)
    function precompute (iterations, callback) {
          // let's run 10 iterations per event loop cycle:
      var i = 0
      while (iterations > 0 && i < 10) {
        layout.step()
        iterations--
        i++
      }
        // processingElement.innerHTML = 'Layout precompute: ' + iterations;
      if (iterations > 0) {
        setTimeout(function () {
          precompute(iterations, callback)
        }, 0) // keep going in next even cycle
      } else {
          // we are done!
        callback()
      }
    }
      // Sets parameters to be passed to WebglCircle in order to change
      // node shape, setting color and size.
    var nodeColor = 0x666370 // hex rrggbb
    min_nodeSize = 2 // a value that assures that the node is
      // displayed without incresing the size of big nodes too much

      //* Starts graphics renderer *//
    function renderGraph () {
      var graphics = Viva.Graph.View.webglGraphics()
          //* * block #1 for node customization **//
          // first, tell webgl graphics we want to use custom shader
          // to render nodes:
      var circleNode = buildCircleNodeShader()
      graphics.setNodeProgram(circleNode)
          // second, change the node ui model, which can be understood
          // by the custom shader:
      graphics.node(function (node) {
        nodeSize = min_nodeSize * node.data.log_length
        return new WebglCircle(nodeSize, nodeColor)
      })

          //* * END block #1 for node customization **//
      var renderer = Viva.Graph.View.renderer(g, {
        layout: layout,
        graphics: graphics,
        container: document.getElementById('couve-flor')
      })
      renderer.run()

          //* ************//
          //* **ZOOMING***//
          //* ************//

          // opens events in webgl such as mouse hoverings or clicks

      $('#zoom_in').click(function (e) {
        e.preventDefault()
        renderer.zoomIn()
      })
      $('#zoom_out').click(function (e) {
        e.preventDefault()
        renderer.zoomOut()
      })

          //* *************//
          //* ** TOGGLE ***//
          //* *************//
          //* * This section controls the connection between the toggle button on the leftside ***//
          //* * and the dropdown on the right side **//

      toggle_status = false // default state
      $('#toggle-event').bootstrapToggle('off') // set to default off
      $('#toggle-event').change(function () {
        toggle_status = $(this).prop('checked')
        toggle_manager(toggle_status)
      })

          //* *************//
          //* ** EVENTS ***//
          //* *************//

      var events = Viva.Graph.webglInputEvents(graphics, g)
      store_nodes = []  // list used to store nodes
          // changes the color of node and links (and respective linked nodes) of this node when clicked
      click_check = false    // controls the handling of hoverings
      events.click(function (node) {
        store_nodes.push(node.id)
            // allows the control of the hovering appearing and locking
        if (click_check == false) {
          click_check = true
        } else {
          click_check = false
          $('#popup_description').css({'display': 'none'})
        }
        console.log('Single click on node: ' + node.id)
        var nodeUI = graphics.getNodeUI(node.id)
        if (toggle_status == true) {   // if statement to check if toggle button is enabled
              // statement when node and linked nodes are still in default color
          if (nodeUI.color == nodeColor) {
            color_to_use = [0xc89933, 0x000000FF, 0x7c3912]
          }
              // statement when linked node is selected
          else if (nodeUI.color == 0x7c3912) {
            color_to_use = [0xc89933, 0x000000FF, 0x7c3912]
          }
              // statement when node is shaded
          else if (nodeUI.color == 0xcdc8b1) {
            color_to_use = [0xc89933, 0x000000FF, 0x7c3912]
          }
              // statement do deselect node and linked nodes
          else {
                // resets the color of node and respective links (and linked nodes) if it was previously checked (on click)
            color_to_use = [nodeColor, 0xb3b3b3ff, nodeColor]
          }
          nodeUI.color = color_to_use[0]
          g.forEachLinkedNode(node.id, function (linkedNode, link) {
            var linkUI = graphics.getLinkUI(link.id)
            linkUI.color = color_to_use[1]
            var linked_nodeUI = graphics.getNodeUI(linkedNode.id)
            if (linked_nodeUI.color != 0xc89933) {
                linked_nodeUI.color = color_to_use[2]
              }
          })
        }
        renderer.rerender()
      })

          //* * mouse hovering on nodes **//
      events.mouseEnter(function (node, e) {
        nodeUI_1 = graphics.getNodeUI(node.id)
        var domPos = {
          x: nodeUI_1.position.x,
          y: nodeUI_1.position.y
        }
            // And ask graphics to transform it to DOM coordinates:
        graphics.transformGraphToClientCoordinates(domPos)
        domPos.x = (domPos.x + nodeUI_1.size) + 'px'
        domPos.y = (domPos.y) + 'px'
        $('#popup_description').empty()
        $('#popup_description').append('<div>' +
                                            node.data.sequence +
                                            '<br />' +
                                            node.data.species +
                                            '<br />' +
                                            node.data.seq_length +
                                            '<br />' +
                                            node.data.percentage +
                                            '</div>')
        $('#popup_description').css({'padding': '10px 10px 10px 10px',
          'border': '1px solid grey',
          'border-radius': '10px',
          'background-color': 'white',
          'display': 'block',
          'left': domPos.x,
          'top': domPos.y,
          'position': 'fixed',
          'z-index': 2
        })
      }).mouseLeave(function (node) {
            // if node is not clicked then mouse hover can disappear
        if (click_check == true) {
          $('#popup_description').css({'display': 'block'})
        } else {
          $('#popup_description').css({'display': 'none'})
        }
      })

          //* * mouse hovering block end **//
      renderer.rerender()

        // by default the animation on forces is paused since
        // it may be computational intensive for old computers
      renderer.pause()

        //* * Loading Screen goes off **//
        // $("#loading").hide();
        // $("#couve-flor").show();
      $('#loading').hide()
      document.getElementById('couve-flor').style.visibility = 'visible'

        //* **************//
        //* ** BUTTONS ***//
        //* **************//

        // Button to reset selection of nodes
      $('#refreshButton').on('click', function (e) {
        color_to_use = [nodeColor, 0xb3b3b3ff, nodeColor]
        for (id in store_nodes) {
          var nodeUI = graphics.getNodeUI(store_nodes[id])
          nodeUI.color = color_to_use[0]
          g.forEachLinkedNode(store_nodes[id], function (linkedNode, link) {
            var linkUI = graphics.getLinkUI(link.id)
            linkUI.color = color_to_use[1]
            var linked_nodeUI = graphics.getNodeUI(linkedNode.id)
            linked_nodeUI.color = color_to_use[2]
          })
        }
        renderer.rerender()
      })

        // Buttons to control force play/pause using bootstrap navigation bar
      paused = true
      $('#playpauseButton').on('click', function (e) {
        $('#playpauseButton').empty()
        if (paused == true) {
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
      changed_nodes = []
      $('#submitButton').click(function (event) {
        var query = $('#formValueId').val()
        console.log('search query: ' + query)
        event.preventDefault()
        g.forEachNode(function (node) {
          var nodeUI = graphics.getNodeUI(node.id)
          var sequence = node.data.sequence.split('>')[3].split('<')[0]
            // console.log(sequence)
          nodeUI = graphics.getNodeUI(node.id)
          var x = nodeUI.position.x,
            y = nodeUI.position.y
          if (sequence == query) {
              // centers graph visualization in a given node, searching for gi
            renderer.moveTo(x, y)
          }
        })
      })
        // Button to clear the selected nodes by form
      $('#clearButton').click(function (event) {
        document.getElementById('formValueId').value = ''
      })

        //* ******************//
        //* ***Taxa Filter****//
        //* ******************//

        // list with unique species in dataset
      var uniqueArray_species = list_species.filter(function (item, pos) {
        return list_species.indexOf(item) == pos
      })
        // then sort it
      var sortedArray_species = uniqueArray_species.sort()
        // search by specific genera //

        // first get a list with unique array entries for genera
      var uniqueArray_genera = list_genera.filter(function (item, pos) {
        return list_genera.indexOf(item) == pos
      })
        // then sort it
      var sortedArray_genera = uniqueArray_genera.sort()

        // load json taxa_tree.json if button is clicked by user//
      var list_orders = [],
        list_families = [],
        dict_genera = {}
      getArray_taxa().done(function (json) {
        $.each(json, function (genus, other) {
          family = other[0]
          order = other[1]
          dict_genera[genus] = [family, order] // append the list to this dict to be used later
          if (sortedArray_genera.indexOf(genus) >= 0) {
            if (list_families.indexOf(family) < 0) {
                list_families.push(family)
              }
            if (list_orders.indexOf(order) < 0) {
                list_orders.push(order)
              }
          }
        })

          // sort families and orders alphabetically

        var sortedArray_order = list_orders.sort(),
          sortedArray_family = list_families.sort()

          // append all order present in dataset

        for (var i = 0; i < sortedArray_order.length; i++) {
          var order_tag = 'order' + sortedArray_order[i]
          var orderId = "id='" + order_tag + "'"
          $('#orderList').append("<option class='OrderClass'>" +
                                    sortedArray_order[i] +
                                    '</option>')
        }
        $('#orderList').append("<option class='OrderClass'> \
                                    <em>Other</em></option>")
          // append all families present in dataset
        for (var i = 0; i < sortedArray_family.length; i++) {
          var family_tag = 'family' + sortedArray_family[i]
          var familyId = "id='" + family_tag + "'"
          $('#familyList').append("<option class='FamilyClass'>" +
                                    sortedArray_family[i] +
                                    '</option>')
        }
        $('#familyList').append("<option class='FamilyClass'> \
                                    <em>Other</em></li>")
          // append all genera present in dataset
        for (var i = 0; i < sortedArray_genera.length; i++) {
          var genus_tag = 'genus' + sortedArray_genera[i]
          var genusId = "id='" + genus_tag + "'"
          $('#genusList').append("<option class='GenusClass'>" +
                                    sortedArray_genera[i] +
                                    '</option>')
        }
          // append all species present in dataset
        for (var i = 0; i < sortedArray_species.length; i++) {
          var species_tag = 'genus' + sortedArray_species[i]
          var speciesId = "id='" + species_tag + "'"
          $('#speciesList').append("<option class='SpeciesClass'>" +
                                    sortedArray_species[i] +
                                    '</option>')
        }

          // updates options provided to bootstrap-select
        $('#orderList').selectpicker('refresh')
        $('#familyList').selectpicker('refresh')
        $('#genusList').selectpicker('refresh')
        $('#speciesList').selectpicker('refresh')

          // clickable <li> and control of displayer of current filters
        firstInstance = true // global variable
        existingTaxon = [],   // global variable
              taxaInList = []   // global variable
        var classArray = ['.OrderClass', '.FamilyClass', '.GenusClass', '.SpeciesClass']
        idsArrays = ['p_Order', 'p_Family', 'p_Genus', 'p_Species'] // global variable
        for (var i = 0; i < classArray.length; i++) {
          $(classArray[i]).on('click', function (e) {
              // empties the text in this div for the first intance
            if (firstInstance == true) {
                for (var x = 0; x < idsArrays.length; x++) {
                  $('#' + idsArrays[x]).empty()
                }
                firstInstance = false
              }
              // fill panel group displaying current selected taxa filters //
            var stringClass = this.className.slice(0, -5)
            var tempVar = this.firstChild.innerHTML

              // checks if a taxon is already in display
            var divstringClass = document.getElementById('p_' + stringClass)
            removal = false
            if (existingTaxon.indexOf(stringClass) < 0 && taxaInList.indexOf(tempVar) < 0) {
                divstringClass.innerHTML = stringClass + ': ' + tempVar
                removal = false
              }
              // checks if selection is in list and is the last element present... removing it
            else if (existingTaxon.indexOf(stringClass) >= 0 && taxaInList[0] == tempVar && taxaInList.length == 1) {
                // resets displayCurrentBox
                resetDisplayTaxaBox(idsArrays)
                removal = true
              } else {
                // if taxa is already not in list then append
                if (taxaInList.indexOf(tempVar) < 0) {
                  divstringClass.innerHTML = divstringClass.innerHTML + ',' + tempVar
                  removal = false
                }
                // if it is already in list then remove it and remove from list taxaInList
                else {
                  if (taxaInList[0] == tempVar) {
                    tempString = tempVar + ','
                  } else {
                    tempString = ',' + tempVar
                  }
                  divstringClass.innerHTML = divstringClass.innerHTML.replace(tempString, '')
                  taxaInList = stringRmArray(tempVar, taxaInList)
                  removal = true
                }
              }
            if (taxaInList.indexOf(tempVar) < 0 && removal == false) {
                taxaInList.push(tempVar)  // user to store all clicked taxa
              }
            existingTaxon.push(stringClass) // used to store previous string and for comparing with new one
          })
        }

          //* **** Clear selection button *****//
          // clear = false; //added to control the colors being triggered after clearing
        $('#taxaModalClear').click(function (event) {
            // clear = true;
          event.preventDefault()
          resetDisplayTaxaBox(idsArrays)

            // resets dropdown selections
          $('#orderList').selectpicker('deselectAll')
          $('#familyList').selectpicker('deselectAll')
          $('#genusList').selectpicker('deselectAll')
          $('#speciesList').selectpicker('deselectAll')

          slider.noUiSlider.set([min, max])
          node_color_reset(graphics, g, nodeColor, renderer)
          if (typeof showLegend !== 'undefined' && $('#scaleLegend').html() === '') {
            showLegend.style.display = 'none'
            showRerun.style.display = 'none'
            showGoback.style.display = 'none'
            document.getElementById('go_back').className += ' disabled'
            showDownload.style.display = 'none'
          } else {
            $('#colorLegendBox').empty()
            document.getElementById('taxa_label').style.display = 'none' // hide label
            showRerun.style.display = 'none'
            showGoback.style.display = 'none'
            document.getElementById('go_back').className += ' disabled'
            showDownload.style.display = 'none'
          }
        })
      })

        //* **** Submit button for taxa filter *****//

        // perform actions when submit button is clicked.

      $('#taxaModalSubmit').click(function (event) {
        noLegend = false // sets legend to hidden state by default
        event.preventDefault()
          // now processes the current selection
        var species_query = document.getElementById('p_Species').innerHTML,
          genus_query = document.getElementById('p_Genus').innerHTML,
          family_query = document.getElementById('p_Family').innerHTML,
          order_query = document.getElementById('p_Order').innerHTML
        var selectedSpecies = species_query.replace('Species: ', '').split(',').filter(Boolean),
          selectedGenus = genus_query.replace('Genus: ', '').split(',').filter(Boolean),
          selectedFamily = family_query.replace('Family: ', '').split(',').filter(Boolean),
          selectedOrder = order_query.replace('Order: ', '').split(',').filter(Boolean)

          //* *** Alert for taxa filter ****//
          // print alert if no filters are selected
        counter = 0 // counts the number of taxa type that has not been selected

        var alertArrays = {'order': selectedOrder, 'family': selectedFamily, 'genus': selectedGenus, 'species': selectedSpecies}
        var divAlert = document.getElementById('alertId')
        var Alert = false
        for (i in alertArrays) {
          if (alertArrays[i][0] == 'No filters applied') {
            Alert = true
            counter = 4  // counter used to check if more than one dropdown has selected options
          } else if (alertArrays[i] != '') {
              counter = counter + 1
            }
        }
        if (Alert == true) {
          divAlert.style.display = 'block'
          showLegend.style.display = 'none' // removes legend when this warning is raised
          Alert = false
        }
          // control the alertClose button

        $('#alertClose').click(function () {
          $('#alertId').hide()  // hide this div
        })

          // auto hide after 5 seconds without closing the div

        window.setTimeout(function () { $('#alertId').hide() }, 5000)

          //* *** End Alert for taxa filter ****//

          // make tmpselectedGenus an associative array since it is the base of family and order arrays

        assocFamilyGenus = {}
        assocOrderGenus = {}

          // appends genus to selectedGenus according with the family and order for single-color selection
          // also appends to associative arrays for family and order for multi-color selection
        $.each(dict_genera, function (genus, pair) {
          var family = pair[0]
          var order = pair[1]
          if (selectedFamily.indexOf(family) >= 0) {
            selectedGenus.push(genus)
            if (!(family in assocFamilyGenus)) {
                assocFamilyGenus[family] = []
                assocFamilyGenus[family].push(genus)
              } else {
                assocFamilyGenus[family].push(genus)
              }
          } else if (selectedOrder.indexOf(order) >= 0) {
              selectedGenus.push(genus)
              if (!(order in assocOrderGenus)) {
                assocOrderGenus[order] = []
                assocOrderGenus[order].push(genus)
              } else {
                assocOrderGenus[order].push(genus)
              }
            }
        })

          // renders the graph for the desired taxon if more than one taxon type is selected
        var store_lis = '' // a variable to store all <li> generated for legend
        var firstIteration = true // bolean to control the upper taxa level (order or family)

          // first restores all nodes to default color
        node_color_reset(graphics, g, nodeColor, renderer)

        if (counter > 1 && counter <= 4) {
          g.forEachNode(function (node) {
            var nodeUI = graphics.getNodeUI(node.id)
            var species = node.data.species.split('>').slice(-1).toString()
            var genus = species.split(' ')[0]
              // checks if genus is in selection
            if (selectedGenus.indexOf(genus) >= 0) {
                nodeUI.color = 0xf71735
                nodeUI.backupColor = nodeUI.color
                changed_nodes.push(node.id)
              }
              // checks if species is in selection
            else if (selectedSpecies.indexOf(species) >= 0) {
                nodeUI.color = 0xf71735
                nodeUI.backupColor = nodeUI.color
                changed_nodes.push(node.id)
              }
          })
          renderer.rerender()
          store_lis = '<li class="centeredList"><button class="jscolor btn btn-default" style="background-color:#f71735"></button>&nbsp;multi-level selected taxa</li>'
            // displays alert
            // first check if filters are applied in order to avoid displaying when there are no filters
          for (i in alertArrays) {
            if (alertArrays[i][0] != 'No filters applied') {
                var divAlert = document.getElementById('alertId_multi')
                divAlert.style.display = 'block'
                // control the alertClose button
                $('#alertClose_multi').click(function () {
                  $('#alertId_multi').hide()  // hide this div
                })
                // auto hide after 5 seconds without closing the div
                window.setTimeout(function () { $('#alertId_multi').hide() }, 5000)
              }
          }
        }
          // renders the graph for the desired taxon if one taxon type is selected
          // allows for different colors between taxa of the same level
        else if (counter == 1) {
            // first cycle between all the arrays to find which one is not empty
          for (array in alertArrays) {
              // selects the not empty array
            if (alertArrays[array] != '' && firstIteration == true) {
                var currentSelection = alertArrays[array]
                // performs the actual interaction for color picking and assigning
                for (i in currentSelection) {
                  // orders //
                  if (alertArrays['order'] != '') {
                    var tempArray = assocOrderGenus[currentSelection[i]]
                    // executres node function for family and orders
                    store_lis = node_coloring_taxa(tempArray, g, graphics, store_lis, currentSelection)
                  }
                  // families //
                  else if (alertArrays['family'] != '') {
                    var tempArray = assocFamilyGenus[currentSelection[i]]
                    // executres node function for family and orders
                    store_lis = node_coloring_taxa(tempArray, g, graphics, store_lis, currentSelection)
                  }

                  // genus and species //
                  else if (alertArrays['genus'] != '' || alertArrays['species'] != '') {
                    currentColor = color[i].replace('#', '0x')
                    style_color = 'background-color:' + color[i]
                    store_lis = store_lis + '<li class="centeredList"><button class="jscolor btn btn-default" style=' + style_color + '></button>&nbsp;' + currentSelection[i] + '</li>'
                    // cycles nodes
                    g.forEachNode(function (node) {
                      var nodeUI = graphics.getNodeUI(node.id)
                      var species = node.data.species.split('>').slice(-1).toString()
                      var genus = species.split(' ')[0]
                      // checks if genus is in selection
                      if (currentSelection[i] == genus) {
                        nodeUI.color = currentColor
                        nodeUI.backupColor = nodeUI.color
                        changed_nodes.push(node.id)
                      }
                      // checks if species is in selection
                      else if (currentSelection[i] == species) {
                        nodeUI.color = currentColor
                        nodeUI.backupColor = nodeUI.color
                        changed_nodes.push(node.id)
                      }
                    })
                  }
                  renderer.rerender()
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
          showLegend = document.getElementById('colorLegend') // global variable to be reset by the button reset-filters
          showLegend.style.display = 'block'
          document.getElementById('taxa_label').style.display = 'block' // show label
          $('#colorLegendBox').empty()
          $('#colorLegendBox').append(store_lis +
              '<li class="centeredList"><button class="jscolor btn btn-default" style="background-color:#666370" ></button>&nbsp;unselected</li>')
          showRerun = document.getElementById('Re_run')
          showGoback = document.getElementById('go_back')
          showDownload = document.getElementById('download_ds')
          showRerun.style.display = 'block'
          showGoback.style.display = 'block'
          showDownload.style.display = 'block'
        }
      })

        //* ************//
        //* ***READS****//
        //* ************//

      $('#fileSubmit').click(function (event) {
        event.preventDefault()
        $('#loading').show()
        setTimeout(function () {
          list_gi = read_coloring(list_gi, g, graphics, renderer)
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

      //* ********* ***//
      //* * Assembly **//
      //* ********* ***//
      $('#assemblySubmit').click(function (event) {
        event.preventDefault()
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
        var readMode = false
        color_legend(readMode)
        document.getElementById('reset-links').disabled = ''
      })

      $('#reset-links').click(function (event) {
        event.preventDefault()
        document.getElementById('distance_label').style.display = 'none' // hide label
        if ($('#colorLegendBox').html() === '') {
          $('#scaleLegend').empty()
          showLegend = document.getElementById('colorLegend') // global variable to be reset by the button reset-filters
          showLegend.style.display = 'none'
        } else {
          $('#scaleLegend').empty()
        }
        setTimeout(function () {
          reset_link_color(g, graphics, renderer)
        }, 100)
        document.getElementById('reset-links').disabled = 'disabled'
      })

        //* ***********************//
        //* ***Fast Form filter****//
        //* ***********************//

        // Form search box utils

        // then applying autocomplete function
      $(function () {
        $('#formValueId').autocomplete({
          source: list_gi
        })
      })

        //* ********************//
        //* ***Length filter****//
        //* ********************//

        //* * slider button and other options **//

        // sets the limits of buttons and slider

      var min = Math.min.apply(null, list_lengths),
        max = Math.max.apply(null, list_lengths)

        // generates and costumizes slider itself
      var slider = document.getElementById('slider')

      noUiSlider.create(slider, {
        start: [min, max],
        behaviour: 'snap',   // snaps the closest slider
        connect: true,
        range: {
          'min': min,
          'max': max
        },
        format: wNumb({
          decimals: 0
        })
      })

        // event handler for slider
        // trigger only if clicked to avoid looping through the nodes again
      $('#length_filter').click(function (event) {
        slider.noUiSlider.on('set', function (event) {
          var slider_max = slider.noUiSlider.get()[1],
            slider_min = slider.noUiSlider.get()[0]
          g.forEachNode(function (node) {
            var node_length = node.data.seq_length.split('>').slice(-1).toString()
            var nodeUI = graphics.getNodeUI(node.id)
            if (parseInt(node_length) < parseInt(slider_min) || parseInt(node_length) > parseInt(slider_max)) {
                nodeUI.color = 0xcdc8b1 // shades nodes
              } else if (parseInt(node_length) >= parseInt(slider_min) || parseInt(node_length) <= parseInt(slider_max)) {
                nodeUI.color = nodeUI.backupColor // return nodes to original color
              }
          })
          renderer.rerender()
        })
      })

        // inputs mins and maxs for slider
      var inputMin = document.getElementById('slider_input_min'),
        inputMax = document.getElementById('slider_input_max'),
        inputs = [inputMin, inputMax]
      slider.noUiSlider.on('update', function (values, handle) {
        inputs[handle].value = values[handle]
      })

      function setSliderHandle (i, value) {
        var r = [null, null]
        r[i] = value
        slider.noUiSlider.set(r)
      }

        // Listen to keydown events on the input field.
      inputs.forEach(function (input, handle) {
        input.addEventListener('change', function () {
          setSliderHandle(handle, this.value)
        })

        input.addEventListener('keydown', function (e) {
          var values = slider.noUiSlider.get()
          var value = Number(values[handle])

            // [[handle0_down, handle0_up], [handle1_down, handle1_up]]
          var steps = slider.noUiSlider.steps()

            // [down, up]
          var step = steps[handle]

          var position

            // 13 is enter,
            // 38 is key up,
            // 40 is key down.
          switch (e.which) {
            case 13:
              setSliderHandle(handle, this.value)
              break

            case 38:

                // Get step to go increase slider value (up)
              position = step[1]

                // false = no step is set
              if (position === false) {
                  position = 1
                }

                // null = edge of slider
              if (position !== null) {
                  setSliderHandle(handle, value + position)
                }

              break

            case 40:

              position = step[0]

              if (position === false) {
                  position = 1
                }

              if (position !== null) {
                  setSliderHandle(handle, value - position)
                }
              break
          }
        })
      })

        // resets the slider
      $('#reset-sliders').click(function (event) {
        slider.noUiSlider.set([min, max])
        node_color_reset(graphics, g, nodeColor, renderer)
        if (typeof showLegend !== 'undefined' && $('#scaleLegend').html() === '') {
          showLegend.style.display = 'none'
          showRerun.style.display = 'none'
          showGoback.style.display = 'none'
          document.getElementById('go_back').className += ' disabled'
          showDownload.style.display = 'none'
          document.getElementById('read_label').style.display = 'none' // hide label
          $('#readLegend').empty()
        } else {
          $('#colorLegendBox').empty()
          document.getElementById('taxa_label').style.display = 'none' // hide label
          showRerun.style.display = 'none'
          showGoback.style.display = 'none'
          document.getElementById('go_back').className += ' disabled'
          showDownload.style.display = 'none'
          document.getElementById('read_label').style.display = 'none' // hide label
          $('#readLegend').empty()
        }
        resetDisplayTaxaBox(idsArrays)

          // resets dropdown selections
        $('#orderList').selectpicker('deselectAll')
        $('#familyList').selectpicker('deselectAll')
        $('#genusList').selectpicker('deselectAll')
        $('#speciesList').selectpicker('deselectAll')
      })
        // runs the re run operation for the selected species
      $('#Re_run').click(function (event) {
          //* * Loading Screen goes on **//
        show_div(
            // removes nodes
            actual_removal(g, graphics, nodeColor, renderer, layout)
          )
          // removes disabled from go_back button
        document.getElementById('go_back').className = document.getElementById('go_back').className.replace(/(?:^|\s)disabled(?!\S)/g, '')
      })

        // returns to the initial tree by reloading the page
      $('#go_back').click(function (event) {
        console.log('returning to main')
        window.location.reload()   // a temporary fix to go back to full dataset
      })
    }
  })

    //* ***********************************************//
    // control the infile input and related functions //
    //* ***********************************************//

  handleFileSelect('infile', '#file_text', function (new_read_json) {
    read_json = new_read_json
  })

  handleFileSelect('assemblyfile', '#assembly_text', function (new_assembly_json) {
    assembly_json = new_assembly_json
  })

  //* ****************************** *//
  //      Menu Button controls       //
  //* ****************************** *//

  $('#menu-toggle').on('click', function (e) {
    if (first_click_menu == true) {
      $('#menu-toggle').css({'color': '#fff'})
      first_click_menu = false
    } else {
      $('#menu-toggle').css({'color': '#999999'})
      first_click_menu = true
    }
  })
}
