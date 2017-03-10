// load JSON file
function getArray(){
  return $.getJSON('example.json');   // change the input file name
}
// load JSON file with taxa dictionary
function getArray_taxa(){
  return $.getJSON('taxa_tree.json');   // change the input file name
}


// initiates vivagraph main functions  
function onLoad() {
    var list=[];   // list to store references already ploted as nodes
    var list_lengths=[] // list to store the lengths of all nodes
    var list_species =[] // lists all species
    var list_genera = [] //list all genera
    var g = Viva.Graph.graph();

    getArray().done(function(json){
      $.each(json, function(sequence_info,dict_dist){
        // next we need to retrieve each information type independently
        var sequence = sequence_info.split("_").slice(0,2).join("_");
        var species = sequence_info.split("_").slice(2,4).join(" ");
        // added to check for errors in database regarding species characterization
        if (species[0] == " "){
          var species = sequence_info.split("_").slice(3,4) + " sp";
        }
        // and continues
        var genus = sequence_info.split("_").slice(2,3).join(" ");
        var seq_length = sequence_info.split("_").slice(-1).join("");
        var log_length = Math.log(parseInt(seq_length)); //ln seq length
        list_lengths.push(seq_length); // appends all lengths to this list
        list_species.push(species); //appends all species to this list
        list_genera.push(genus)
        //checks if sequence is not in list to prevent adding multiple nodes for each sequence
        if (list.indexOf(sequence) < 0) {    
          g.addNode(sequence_info,{sequence:"<font color='#468499'>seq_id: </font>"+ sequence,
                              species:"<font color='#468499'>Species: </font>"+species,
                              seq_length: "<font color='#468499'>seq_length: </font>"+seq_length,
                              log_length: log_length 
          });
          list.push(sequence_info);
          }
          // loops between all arrays of array pairing sequence and distances
        for (var i = 0; i < dict_dist.length; i++){
          var pairs = dict_dist[i];
          var reference_info = pairs[0];  //stores references in a unique variable
          var distance = pairs[1];   //stores distances in a unique variable
          g.addLink(sequence_info,reference_info,distance);
        };
      });
      // previously used to check the number of nodes provided
      var layout = Viva.Graph.Layout.forceDirected(g, {
          springLength : 30,
          springCoeff : 0.0001,
          dragCoeff : 0.01,
          gravity : -1.2,
          theta : 1
      });
      precompute(1500, renderGraph);
      function precompute(iterations, callback) {
          // let's run 10 iterations per event loop cycle:
        var i = 0;
        while (iterations > 0 && i < 10) {
          layout.step();
          iterations--;
          i++;
        }
        //processingElement.innerHTML = 'Layout precompute: ' + iterations;
        if (iterations > 0) {
          setTimeout(function () {
              precompute(iterations, callback);
          }, 0); // keep going in next even cycle
        } else {
          // we are done!
          callback();
        }
      }
      // Sets parameters to be passed to WebglCircle in order to change 
      // node shape, setting color and size.
      var nodeColor = 0x666370; // hex rrggbb
      min_nodeSize = 2; // a value that assures that the node is 
      //displayed without incresing the size of big nodes too much  

      //* Starts graphics renderer *//
      function renderGraph(){
          var graphics = Viva.Graph.View.webglGraphics();
          //** block #1 for node customization **//
          // first, tell webgl graphics we want to use custom shader
          // to render nodes:
          var circleNode = buildCircleNodeShader();
          graphics.setNodeProgram(circleNode);
          // second, change the node ui model, which can be understood
          // by the custom shader:
          graphics.node(function (node) {
            nodeSize = min_nodeSize * node.data.log_length
            return new WebglCircle(nodeSize, nodeColor);
          });

          //** END block #1 for node customization **//
          var renderer = Viva.Graph.View.renderer(g, {
              layout   : layout,
              graphics : graphics,
              container: document.getElementById('couve-flor')
          });                      
          renderer.run();

          //*************//
          //***ZOOMING***//
          //*************//

          // opens events in webgl such as mouse hoverings or clicks

          $('#zoom_in').click(function (e) {
              e.preventDefault();
              renderer.zoomIn();
          });
          $('#zoom_out').click(function (e) {
              e.preventDefault();
              renderer.zoomOut();
          });

          //**************//
          //*** EVENTS ***//
          //**************//

          var events = Viva.Graph.webglInputEvents(graphics, g);
          store_nodes=[];  //list used to store nodes
          // changes the color of node and links (and respective linked nodes) of this node when clicked
          events.click(function (node) {
            store_nodes.push(node.id);
            change_color=true;
            console.log('Single click on node: ' + node.id);
            var nodeUI = graphics.getNodeUI(node.id);
            // statement when node and linked nodes are still in default color
            if (nodeUI.color == nodeColor) {    
              color_to_use=[0xc89933,0x000000FF,0x7c3912];
            }
            // statement when linked node is selected
            else if(nodeUI.color == 0x7c3912){
              color_to_use=[0xc89933,0x000000FF,0x7c3912];
            }
            // statement when node is shaded
            else if(nodeUI.color == 0xcdc8b1){
              color_to_use=[0xc89933,0x000000FF,0x7c3912];
            }
            // statement do deselect node and linked nodes
            else {
              // resets the color of node and respective links (and linked nodes) if it was previously checked (on click)
              color_to_use=[nodeColor,0xb3b3b3ff,nodeColor];
            }
            nodeUI.color = color_to_use[0];
            g.forEachLinkedNode(node.id, function(linkedNode, link){
              var linkUI = graphics.getLinkUI(link.id);                            
              linkUI.color=color_to_use[1];
              //console.log(linkedNode.id)
              var linked_nodeUI = graphics.getNodeUI(linkedNode.id);
              if (linked_nodeUI.color != 0xc89933) {
                linked_nodeUI.color = color_to_use[2];
              }
            });
            renderer.rerender();
          });

          //** mouse hovering on nodes **//
          events.mouseEnter(function (node, e) {
            nodeUI_1 = graphics.getNodeUI(node.id);
            var domPos = {
              x: nodeUI_1.position.x,
              y: nodeUI_1.position.y
            };
            // And ask graphics to transform it to DOM coordinates:
            graphics.transformGraphToClientCoordinates(domPos);
            domPos.x = (domPos.x + nodeUI_1.size) + 'px';
            domPos.y = (domPos.y) + 'px';
            $('#popup_description').empty();
            $('#popup_description').append("<div>"+
                                            node.data.sequence+
                                            "<br />"+
                                            node.data.species+
                                            "<br />"+
                                            node.data.seq_length+
                                            "</div>");
            $('#popup_description').css({'padding': '10px 10px 10px 10px', 
                                        'border':'1px solid grey', 
                                        'border-radius': '10px', 
                                        'background-color':'white',
                                        'display':'block', 
                                        'left':domPos.x, 
                                        'top':domPos.y, 
                                        'position':'fixed', 
                                        'z-index':2
                                        });
            //console.log('Mouse entered node: ' + node.id);
          }).mouseLeave(function (node) {
            $('#popup_description').css({'display':'none'});
            //console.log('Mouse left node: ' + node.id);
          });
          //** mouse hovering block end **//                        
        renderer.rerender();
        // by default the animation on forces is paused since 
        // it may be computational intensive for old computers
        renderer.pause(); 

        //** Loading Screen goes off **//
        document.getElementById('loading').style.visibility="hidden";
        document.getElementById('couve-flor').style.visibility="visible";

        //***************//
        //*** BUTTONS ***//
        //***************//

        // Button to reset selection of nodes
        $('#refreshButton').on('click', function(e) {
          color_to_use=[nodeColor,0xb3b3b3ff,nodeColor];
          for (id in store_nodes) {
            var nodeUI = graphics.getNodeUI(store_nodes[id]);  
            nodeUI.color =color_to_use[0]
            g.forEachLinkedNode(store_nodes[id], function(linkedNode, link){
              var linkUI = graphics.getLinkUI(link.id);                            
              linkUI.color=color_to_use[1];
              var linked_nodeUI = graphics.getNodeUI(linkedNode.id);
              linked_nodeUI.color = color_to_use[2];
            });                          
          }
          renderer.rerender();
          });

        // Buttons to control force play/pause using bootstrap navigation bar
        var paused = true;
        $('#playpauseButton').on('click', function(e) {
          $('#playpauseButton').empty();
          if (paused == true) {                          
              renderer.resume();
              $('#playpauseButton').append('<span class="glyphicon glyphicon-pause"></span>')
              paused = false;
            }
          else {     
              renderer.pause();
              $('#playpauseButton').append('<span class="glyphicon glyphicon-play"></span>')
              paused = true;
            }
          });

        // Form and button for search box
        changed_nodes = [];
        $('#submitButton').click(function(event){
          var query = $('#formValueId').val()
          console.log("search query: "+ query);
          event.preventDefault();
          g.forEachNode(function (node) {
            var nodeUI = graphics.getNodeUI(node.id);
            var species = node.data.species.split(">").slice(-1).toString();
            if (species == query){
              nodeUI.color = 0xf71735;
              changed_nodes.push(node.id);
            }
          });
          renderer.rerender();
        });
        // Button to clear the selected nodes by form
        $('#clearButton').click(function(event){
          g.forEachNode(function (node) {
            var nodeUI = graphics.getNodeUI(node.id);
            if (changed_nodes.indexOf(node.id) >= 0){
              nodeUI.color = nodeColor; 
            }                       
          });
          renderer.rerender();
        });

        //*******************//
        //****Taxa Filter****//
        //*******************//

        // list with unique species in dataset
        var uniqueArray_species = list_species.filter(function(item, pos) {
            return list_species.indexOf(item) == pos;
        });
        // then sort it
        var sortedArray_species = uniqueArray_species.sort();
        // search by specific genera //

        // first get a list with unique array entries for genera
        var uniqueArray_genera = list_genera.filter(function(item, pos) {
            return list_genera.indexOf(item) == pos;
        });
        // then sort it
        var sortedArray_genera = uniqueArray_genera.sort();


        // load json taxa_tree.json if button is clicked by user//
        var list_orders = [],
            list_families = [],
            dict_genera = {};
        getArray_taxa().done(function(json){
          $.each(json, function(genus,other){
            family = other[0]
            order = other[1]
            dict_genera[genus]=[family,order]; //append the list to this dict to be used later
            if (sortedArray_genera.indexOf(genus) >= 0){
              if (list_families.indexOf(family) < 0){
                list_families.push(family);
              }
              if (list_orders.indexOf(order) < 0){
                list_orders.push(order);
              }
            }
          });

          //sort families and orders alphabetically

          var sortedArray_order = list_orders.sort(),
              sortedArray_family = list_families.sort();
        
          //append all order present in dataset
          var storeOrderId = [],
              storeFamilyId = [],
              storeGenusId = [],
              storeSpeciesId = [];
          for (var i = 0; i < sortedArray_order.length; i++){
            var order_tag = "order" + sortedArray_order[i];
            var orderId = "id='" + order_tag +"'";
            storeOrderId.push(order_tag);
            $('#orderList').append("<li class='OrderClass'><a href='#' "+ orderId +">"+
                                    sortedArray_order[i] +
                                    "</a></li>");
          }
          $('#orderList').append("<li class='OrderClass'><a href='#' id='otherId' > \
                                    <em>Other</em></a></li>");
          storeOrderId.push("id=otherId");
          //append all families present in dataset
          for (var i = 0; i < sortedArray_family.length; i++){
            var family_tag = "family" + sortedArray_family[i];
            var familyId = "id='" +family_tag+"'";
            storeFamilyId.push(family_tag);
            $('#familyList').append("<li class='FamilyClass'><a href='#'"+ familyId +">"+
                                    sortedArray_family[i] +
                                    "</a></li>");
          }
          $('#familyList').append("<li class='FamilyClass'><a href='#' id='otherId' > \
                                    <em>Other</em></a></li>");
          storeFamilyId.push("id=otherId"); 
          //append all genera present in dataset
          for (var i = 0; i < sortedArray_genera.length; i++){
            var genus_tag = "genus" + sortedArray_genera[i];
            var genusId = "id='" + genus_tag  + "'";
            storeGenusId.push(genus_tag);
            $('#genusList').append("<li class='GenusClass'><a href='#'"+ genusId +">"+
                                    sortedArray_genera[i] +
                                    "</a></li>");
          }
          //append all species present in dataset
          for (var i = 0; i < sortedArray_species.length; i++){
            var species_tag = "genus" + sortedArray_species[i];
            var speciesId = "id='" + species_tag + "'";
            storeSpeciesId.push(speciesId);
            $('#speciesList').append("<li class='SpeciesClass'><a href='#'"+ speciesId +">"+
                                    sortedArray_species[i] +
                                    "</a></li>");
          }          

          // clickable <li> and control of displayer of current filters
          firstInstance = true; //global variable
          existingTaxon = [],   //global variable
              taxaInList = [];   //global variable
          var classArray = ['.OrderClass', '.FamilyClass', '.GenusClass', '.SpeciesClass'];
          idsArrays = ['p_Order', 'p_Family', 'p_Genus', 'p_Species']; //global variable
          for (var i = 0; i<classArray.length; i++){
            $(classArray[i]).on('click', function(e){
              // empties the text in this div for the first intance
              if (firstInstance == true){                
                for (var x=0;x<idsArrays.length;x++){
                  $('#'+idsArrays[x]).empty()
                }
                firstInstance = false
              }
              // fill panel group displaying current selected taxa filters //
              var stringClass = this.className.slice(0,-5)
              var tempVar = this.firstChild.innerHTML
              
              // checks if a taxon is already in display
              var divstringClass = document.getElementById("p_"+stringClass);
              if (existingTaxon.indexOf(stringClass) < 0) {
                divstringClass.innerHTML = stringClass +": "+ tempVar;
              }
              else {
                if (taxaInList.indexOf(tempVar) < 0){
                  divstringClass.innerHTML = divstringClass.innerHTML +", " +tempVar;
                }
              }
              if (taxaInList.indexOf(tempVar) < 0){
                taxaInList.push(tempVar);  //user to store all clicked taxa
              }
              existingTaxon.push(stringClass); //used to store previous string and for comparing with new one
            });
          }

          //***** Clear selection button *****//
          clear = false; //added to control the colors being triggered after clearing
          $('#taxaModalClear').click(function(event){
            clear = true;
            event.preventDefault();
            for (var x=0;x<idsArrays.length;x++){
              // empty field
              $('#'+idsArrays[x]).empty()
              // reset to default of html
              $('#'+idsArrays[x]).append(idsArrays[x].replace("p_","") + ": No filters applied")
              // resets the lists and checkers for the panel
              firstInstance = true;
              existingTaxon = [];
              taxaInList = [];
            }
          });
        });
        
        //***** Submit button for taxa filter *****//

        //perform actions when submit button is clicked. 

        noLegend = false // sets legend to hidden state by default

        $('#taxaModalSubmit').click(function(event){
          event.preventDefault();
          // now processes the current selection              
          var species_query = document.getElementById("p_Species").innerHTML,
              genus_query = document.getElementById("p_Genus").innerHTML,
              family_query = document.getElementById("p_Family").innerHTML,
              order_query = document.getElementById("p_Order").innerHTML;
          var selectedSpecies = species_query.replace("Species: ", "").split(", ").filter(Boolean),
              selectedGenus = genus_query.replace("Genus: ", "").split(", ").filter(Boolean),
              selectedFamily = family_query.replace("Family: ", "").split(", ").filter(Boolean),
              selectedOrder = order_query.replace("Order: ", "").split(", ").filter(Boolean);



          //**** Alert for taxa filter ****//
          // print alert if no filters are selected
          counter = 0 // counts the number of taxa type that has not been selected

          var alertArrays = {"order": selectedOrder, "family": selectedFamily, "genus": selectedGenus, "species": selectedSpecies};
          var divAlert = document.getElementById('alertId');
          var Alert = false;
          for (i in alertArrays){
            if (alertArrays[i][0] == "No filters applied"){
              Alert = true;
              counter = 4  //counter used to check if more than one dropdown has selected options
            }
            else if (alertArrays[i] != ""){
              counter = counter + 1;
            }
          }
          if (Alert == true){
            divAlert.style.display = "block";
            Alert = false;
          }
          // control the alertClose button

          $('#alertClose').click(function() {
             $('#alertId').hide();  // hide this div
          });

          // auto hide after 5 seconds without closing the div

          window.setTimeout(function() { $("#alertId").hide(); }, 5000);

          //**** End Alert for taxa filter ****//

          //make tmpselectedGenus an associative array since it is the base of family and order arrays

          assocFamilyGenus = {};
          assocOrderGenus = {};

          // appends genus to selectedGenus according with the family and order for single-color selection
          // also appends to associative arrays for family and order for multi-color selection
          $.each(dict_genera, function(genus,pair){
            var family = pair[0];
            var order = pair[1];
            if (selectedFamily.indexOf(family) >= 0 ){
              selectedGenus.push(genus);
              if (!(family in assocFamilyGenus)){
                assocFamilyGenus[family] = [];
                assocFamilyGenus[family].push(genus);
              }
              else{
                assocFamilyGenus[family].push(genus);
              }

            }
            else if (selectedOrder.indexOf(order) >= 0){
              selectedGenus.push(genus);
              if (!(order in assocOrderGenus)){
                assocOrderGenus[order] = [];
                assocOrderGenus[order].push(genus);
              }
              else{
                assocOrderGenus[order].push(genus);
              }
            }         
            
          });

          // create color pallete
          //color = d3.schemeCategory20;

          // helper function to color according with family and order
          function node_coloring_taxa(tempArray){
            currentColor = color[i].replace('#', '0x');
            style_color = "background-color:" + color[i];
            store_lis = store_lis + '<li class="centeredList"><span class="squareLegend" style=' + style_color + '></span>&nbsp;' + currentSelection[i] + '</li>';
            for (gen in tempArray){
              //cycles nodes
              g.forEachNode(function (node) {
                var nodeUI = graphics.getNodeUI(node.id);
                var species = node.data.species.split(">").slice(-1).toString();
                var genus = species.split(" ")[0];
                //checks if genus is in selection
                if (tempArray[gen] == genus){
                  nodeUI.color = currentColor;
                  changed_nodes.push(node.id);
                }
              });
            }
          }           

          //renders the graph for the desired taxon if more than one taxon type is selected
          var store_lis = "" // a variable to store all <li> generated for legend
          var firstIteration = true; // bolean to control the upper taxa level (order or family)
          if (counter > 1 && counter < 4){
            g.forEachNode(function (node) {
              var nodeUI = graphics.getNodeUI(node.id);
              var species = node.data.species.split(">").slice(-1).toString();
              var genus = species.split(" ")[0];
              //checks if genus is in selection
              if (selectedGenus.indexOf(genus) >= 0){
                nodeUI.color = 0xf71735;
                changed_nodes.push(node.id);
              }
              //checks if species is in selection
              else if (selectedSpecies.indexOf(species) >= 0){
                nodeUI.color = 0xf71735;
                changed_nodes.push(node.id);
              }
            });
            renderer.rerender();
            store_lis= '<li class="centeredList"><span class="squareLegend" style="background-color:#f71735" ></span>&nbsp;multi-level selected taxa</li>';
            // displays alert
            // first check if filters are applied in order to avoid displaying when there are no filters
            for (i in alertArrays){
              if (alertArrays[i][0] != "No filters applied"){
                var divAlert = document.getElementById('alertId_multi');
                divAlert.style.display = "block";
                // control the alertClose button
                $('#alertClose_multi').click(function() {
                    $('#alertId_multi').hide();  // hide this div
                });
                // auto hide after 5 seconds without closing the div
                window.setTimeout(function() { $("#alertId_multi").hide(); }, 5000);
              }
            }
          }
          //renders the graph for the desired taxon if one taxon type is selected
          //allows for different colors between taxa of the same level
          else if(counter == 1){
            // first cycle between all the arrays to find which one is not empty
            for (array in alertArrays) {
              // selects the not empty array
              if (alertArrays[array] != "" && firstIteration == true) {
                var currentSelection = alertArrays[array];
                // performs the actual interaction for color picking and assigning
                for (i in currentSelection){
                  // orders //                    
                  if (alertArrays["order"] != ""){
                    var tempArray = assocOrderGenus[currentSelection[i]]; 
                    // executres node function for family and orders
                    node_coloring_taxa(tempArray);                     
                  }
                  // families //
                  else if (alertArrays["family"] != ""){
                    var tempArray = assocFamilyGenus[currentSelection[i]];
                    // executres node function for family and orders
                    node_coloring_taxa(tempArray);  
                  }
                
                  // genus and species //
                  else if (alertArrays["genus"] != "" || alertArrays["species"] != ""){
                    currentColor = color[i].replace('#', '0x');
                    style_color = "background-color:" + color[i];
                    store_lis = store_lis + '<li class="centeredList"><span class="squareLegend" style=' + style_color + '></span>&nbsp;' + currentSelection[i] + '</li>';
                    //cycles nodes
                    g.forEachNode(function (node) {
                      var nodeUI = graphics.getNodeUI(node.id);
                      var species = node.data.species.split(">").slice(-1).toString();
                      var genus = species.split(" ")[0];
                      //checks if genus is in selection
                      if (currentSelection[i] == genus){
                        nodeUI.color = currentColor;
                        changed_nodes.push(node.id);
                      }
                      // checks if species is in selection
                      else if (currentSelection[i]==species){
                        nodeUI.color = currentColor;
                        changed_nodes.push(node.id);
                      }
                    });
                  }
                  renderer.rerender();
                }
                firstIteration = false; // stops getting lower levels
              }
            }
          }
          // used to control if no selection was made avoiding to display the legend
          else{
            noLegend = true
          }
            // show legend //
          if (noLegend == false) {
            showLegend = document.getElementById('colorLegend'); // global variable to be reset by the button reset-filters
            showLegend.style.display = "block";
            $('#colorLegendBox').empty();
            $('#colorLegendBox').append(store_lis + 
              '<li class="centeredList"><span class="squareLegend" style="background-color:#666370" ></span>&nbsp;unselected</li>')
            showRerun = document.getElementById('Re_run'); // rerun 
            showRerun.style.display = "block";
          }
        });

        //************************//
        //****Fast Form filter****//
        //************************//

        // Form search box utils

        // then applying autocomplete function
        $(function () {
          $('#formValueId').autocomplete({
            source: sortedArray_species
          });
        });

        //*********************//
        //****Length filter****//
        //*********************//

        //** slider button and other options **//

        // sets the limits of buttons and slider

        var min = Math.min.apply(null, list_lengths),
            max = Math.max.apply(null, list_lengths);

        //generates and costumizes slider itself
        var slider = document.getElementById('slider');

        noUiSlider.create(slider, {
          start: [min, max],
          behaviour: 'snap',   //snaps the closest slider
          connect: true,
          range: {
            'min': min,
            'max': max
          },
          format: wNumb({
            decimals: 0,
          }),
        });

        //event handler for slider
        slider.noUiSlider.on('set', function (event) {
          var slider_max = slider.noUiSlider.get()[1],
              slider_min = slider.noUiSlider.get()[0];
          g.forEachNode(function (node) {
            var node_length = node.data.seq_length.split(">").slice(-1).toString();
            var nodeUI = graphics.getNodeUI(node.id);
            if (parseInt(node_length) < parseInt(slider_min) || parseInt(node_length) > parseInt(slider_max)){
              nodeUI.color = 0xcdc8b1; // shades nodes
            }
            else if (parseInt(node_length) >= parseInt(slider_min) || parseInt(node_length) <= parseInt(slider_max)){
              nodeUI.color = nodeColor; //return nodes to original color
            }
          });
          renderer.rerender();
        });

        // inputs mins and maxs for slider
        var inputMin = document.getElementById("slider_input_min"),
            inputMax = document.getElementById("slider_input_max"),
            inputs = [inputMin, inputMax]
        slider.noUiSlider.on('update', function(values,handle ) {
          inputs[handle].value = values[handle];
        });

        function setSliderHandle(i, value) {
          var r = [null,null];
          r[i] = value;
          slider.noUiSlider.set(r);
        }

        // Listen to keydown events on the input field.
        inputs.forEach(function(input, handle) {

          input.addEventListener('change', function(){
            setSliderHandle(handle, this.value);
          });

          input.addEventListener('keydown', function( e ) {

            var values = slider.noUiSlider.get();
            var value = Number(values[handle]);

            // [[handle0_down, handle0_up], [handle1_down, handle1_up]]
            var steps = slider.noUiSlider.steps();

            // [down, up]
            var step = steps[handle];

            var position;

            // 13 is enter,
            // 38 is key up,
            // 40 is key down.
            switch ( e.which ) {

              case 13:
                setSliderHandle(handle, this.value);
                break;

              case 38:

                // Get step to go increase slider value (up)
                position = step[1];

                // false = no step is set
                if ( position === false ) {
                  position = 1;
                }

                // null = edge of slider
                if ( position !== null ) {
                  setSliderHandle(handle, value + position);
                }

                break;

              case 40:

                position = step[0];

                if ( position === false ) {
                  position = 1;
                }

                if ( position !== null ) {
                  setSliderHandle(handle, value - position);
                }
                break;
            }
          });
        });

        // resets the slider
        $('#reset-sliders').click(function(event){
          slider.noUiSlider.set([min, max]);
          showLegend.style.display = "none";
          showRerun.style.display = "none";
          for (var x=0;x<idsArrays.length;x++){
            // empty field
            $('#'+idsArrays[x]).empty()
            // reset to default of html
            $('#'+idsArrays[x]).append(idsArrays[x].replace("p_","") + ": No filters applied")
            // resets the lists and checkers for the panel
            firstInstance = true;
            existingTaxon = [];
            taxaInList = [];
          }
        });
        // resets colors of selection
        $('#taxaModalClear').click(function(event){
          if (clear = true ){
            slider.noUiSlider.set([min, max]);
            showLegend.style.display = "none";
            showRerun.style.display = "none";
            clear = false;
          }
        });


      }          
    });
}
//** block #2 for node customization **//
// Lets start from the easiest part - model object for node ui in webgl
function WebglCircle(size, color) {
    this.size = size;
    this.color = color;
}
// Next comes the hard part - implementation of API for custom shader
// program, used by webgl renderer:
function buildCircleNodeShader() {
    // For each primitive we need 4 attributes: x, y, color and size.
    var ATTRIBUTES_PER_PRIMITIVE = 4,
        nodesFS = [
        'precision mediump float;',
        'varying vec4 color;',
        'void main(void) {',
        '   if ((gl_PointCoord.x - 0.5) * (gl_PointCoord.x - 0.5) + (gl_PointCoord.y - 0.5) * (gl_PointCoord.y - 0.5) < 0.25) {',
        '     gl_FragColor = color;',
        '   } else {',
        '     gl_FragColor = vec4(0);',
        '   }',
        '}'].join('\n'),
        nodesVS = [
        'attribute vec2 a_vertexPos;',
        // Pack color and size into vector. First element is color, second - size.
        // Since it's floating point we can only use 24 bit to pack colors...
        // thus alpha channel is dropped, and is always assumed to be 1.
        'attribute vec2 a_customAttributes;',
        'uniform vec2 u_screenSize;',
        'uniform mat4 u_transform;',
        'varying vec4 color;',
        'void main(void) {',
        '   gl_Position = u_transform * vec4(a_vertexPos/u_screenSize, 0, 1);',
        '   gl_PointSize = a_customAttributes[1] * u_transform[0][0];',
        '   float c = a_customAttributes[0];',
        '   color.b = mod(c, 256.0); c = floor(c/256.0);',
        '   color.g = mod(c, 256.0); c = floor(c/256.0);',
        '   color.r = mod(c, 256.0); c = floor(c/256.0); color /= 255.0;',
        '   color.a = 1.0;',
        '}'].join('\n');
    var program,
        gl,
        buffer,
        locations,
        utils,
        nodes = new Float32Array(64),
        nodesCount = 0,
        canvasWidth, canvasHeight, transform,
        isCanvasDirty;
    return {
        /**
          * Called by webgl renderer to load the shader into gl context.
          */
        load : function (glContext) {
            gl = glContext;
            webglUtils = Viva.Graph.webgl(glContext);
            program = webglUtils.createProgram(nodesVS, nodesFS);
            gl.useProgram(program);
            locations = webglUtils.getLocations(program, ['a_vertexPos', 'a_customAttributes', 'u_screenSize', 'u_transform']);
            gl.enableVertexAttribArray(locations.vertexPos);
            gl.enableVertexAttribArray(locations.customAttributes);
            buffer = gl.createBuffer();
        },
        /**
          * Called by webgl renderer to update node position in the buffer array
          *
          * @param nodeUI - data model for the rendered node (WebGLCircle in this case)
          * @param pos - {x, y} coordinates of the node.
          */
        position : function (nodeUI, pos) {
            var idx = nodeUI.id;
            nodes[idx * ATTRIBUTES_PER_PRIMITIVE] = pos.x;
            nodes[idx * ATTRIBUTES_PER_PRIMITIVE + 1] = -pos.y;
            nodes[idx * ATTRIBUTES_PER_PRIMITIVE + 2] = nodeUI.color;
            nodes[idx * ATTRIBUTES_PER_PRIMITIVE + 3] = nodeUI.size;
        },
        /**
          * Request from webgl renderer to actually draw our stuff into the
          * gl context. This is the core of our shader.
          */
        render : function() {
            gl.useProgram(program);
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, nodes, gl.DYNAMIC_DRAW);
            if (isCanvasDirty) {
                isCanvasDirty = false;
                gl.uniformMatrix4fv(locations.transform, false, transform);
                gl.uniform2f(locations.screenSize, canvasWidth, canvasHeight);
            }
            gl.vertexAttribPointer(locations.vertexPos, 2, gl.FLOAT, false, ATTRIBUTES_PER_PRIMITIVE * Float32Array.BYTES_PER_ELEMENT, 0);
            gl.vertexAttribPointer(locations.customAttributes, 2, gl.FLOAT, false, ATTRIBUTES_PER_PRIMITIVE * Float32Array.BYTES_PER_ELEMENT, 2 * 4);
            gl.drawArrays(gl.POINTS, 0, nodesCount);
        },
        /**
          * Called by webgl renderer when user scales/pans the canvas with nodes.
          */
        updateTransform : function (newTransform) {
            transform = newTransform;
            isCanvasDirty = true;
        },
        /**
          * Called by webgl renderer when user resizes the canvas with nodes.
          */
        updateSize : function (newCanvasWidth, newCanvasHeight) {
            canvasWidth = newCanvasWidth;
            canvasHeight = newCanvasHeight;
            isCanvasDirty = true;
        },
        /**
          * Called by webgl renderer to notify us that the new node was created in the graph
          */
        createNode : function (node) {
            nodes = webglUtils.extendArray(nodes, nodesCount, ATTRIBUTES_PER_PRIMITIVE);
            nodesCount += 1;
        },
        /**
          * Called by webgl renderer to notify us that the node was removed from the graph
          */
        removeNode : function (node) {
            if (nodesCount > 0) { nodesCount -=1; }
            if (node.id < nodesCount && nodesCount > 0) {
                // we do not really delete anything from the buffer.
                // Instead we swap deleted node with the "last" node in the
                // buffer and decrease marker of the "last" node. Gives nice O(1)
                // performance, but make code slightly harder than it could be:
                webglUtils.copyArrayPart(nodes, node.id*ATTRIBUTES_PER_PRIMITIVE, nodesCount*ATTRIBUTES_PER_PRIMITIVE, ATTRIBUTES_PER_PRIMITIVE);
            }
        },
        /**
          * This method is called by webgl renderer when it changes parts of its
          * buffers. We don't use it here, but it's needed by API (see the comment
          * in the removeNode() method)
          */
        replaceProperties : function(replacedNode, newNode) {},
    };
}
