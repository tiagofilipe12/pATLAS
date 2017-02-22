// load JSON file
function getArray(){
      return $.getJSON('import_to_vivagraph01_l50.json');
}
// initiates vivagraph main functions  
function onLoad() {
    var list=[];   //list to store references already ploted as nodes
    var g = Viva.Graph.graph();
    getArray().done(function(json){
      $.each(json, function(sequence,dict_dist){
        if (list.indexOf(sequence) < 0) {    //checks if sequence is not in list to prevent adding multiple nodes for each sequence
          g.addNode(sequence,{sequence:"<font color='#468499'>seq_id: </font>"+ sequence,
                              species:"<font color='#468499'>Species: </font>"+"test",
                              seq_length: "<font color='#468499'>seq_length: </font>"+"1234"});
          list.push(sequence);
          }
          // loops between all arrays of array pairing sequence and distances
        for (var i = 0; i < dict_dist.length; i++){
          var pairs = dict_dist[i];
          var reference = pairs[0];  //stores references in a unique variable
          var distance = pairs[1];   //stores distances in a unique variable
          if (list.indexOf(reference) < 0) {    //checks if reference is not in list to prevent adding multiple nodes for each sequence
            g.addNode(reference,{sequence:"<font color='#468499'>seq_id: </font>"+ sequence, 
                                species:"<font color='#468499'>Species: </font>"+"test",
                                seq_length: "<font color='#468499'>seq_length: </font>"+"1234"}); 
            list.push(reference);
          }
          g.addLink(sequence,reference,distance);
        };
      });
      // previously used to check the number of nodes provided
      //console.log(list);
      var layout = Viva.Graph.Layout.forceDirected(g, {
          springLength : 30,
          springCoeff : 0.0001,
          dragCoeff : 0.01,
          gravity : -1.2,
          theta : 1
      });
      precompute(1000, renderGraph);
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
              //console.log(iterations);
              precompute(iterations, callback);
          }, 0); // keep going in next even cycle
        } else {
          // we are done!
          callback();
        }
      }
      // Sets parameters to be passed to WebglCircle in order to change 
      // node shape, setting color and size.
      var nodeColor = 0x31698a, // hex rrggbb
      nodeSize = 12;                  
      // Starts graphics render
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
              return new WebglCircle(nodeSize, nodeColor);
            });
          //** END block #1 for node customization **//
          var renderer = Viva.Graph.View.renderer(g, {
              layout   : layout,
              graphics : graphics,
              container: document.getElementById('couve-flor')
          });                      
          renderer.run();                      
          // opens events in webgl such as mouse hoverings or clicks
          var events = Viva.Graph.webglInputEvents(graphics, g);
          store_nodes=[];  //list used to store nodes
            // changes the color of node and links (and respective linked nodes) of this node when clicked
            events.click(function (node) {
              store_nodes.push(node.id);
              change_color=true;
              console.log('Single click on node: ' + node.id);
              var nodeUI = graphics.getNodeUI(node.id);
              color_to_use=nodeColor
              if (nodeUI.color == color_to_use) {
                default_link_color=nodeUI.color
                color_to_use=[0xe36e59,0xFF4500FF,0x854442];
              }
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
                linked_nodeUI.color = color_to_use[2];
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
              domPos.x = (domPos.x + nodeSize + nodeUI_1.size) + 'px';
              domPos.y = (domPos.y - 30)+ 'px';
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
          //*** BUTTONS ***//
          // Button to reset selection of nodes
          $('#refreshButton').on('click', function(e) {
            color_to_use=[nodeColor,0xb3b3b3ff,nodeColor];
            for (id in store_nodes) {
              console.log(id)
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
            if (paused == true) {                          
                renderer.resume();
                $('#playpauseButton').empty();
                $('#playpauseButton').append('<span class="glyphicon glyphicon-pause"></span>')
                paused = false;
              }                        
            else {                          
                renderer.pause();
                $('#playpauseButton').empty();
                $('#playpauseButton').append('<span class="glyphicon glyphicon-play"></span>')
                paused = true;
              }
            });
          //** Data button **//
          //$('#taxaButton').text("Filters");
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
