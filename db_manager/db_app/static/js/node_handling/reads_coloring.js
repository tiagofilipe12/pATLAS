// single read displayer
// This function colors each node present in input read json file
const read_coloring = (g, list_gi, graphics, renderer) => {
  const readMode = true
  const readString = read_json.replace(/[{}" ]/g, '').split(',')
  let listGiFilter = []
  for (string in readString) {
    gi = readString[string].split(':')[0].replace(' ', '')
    listGiFilter.push(gi)
    perc = parseFloat(readString[string].split(':')[1].replace(' ', ''))
    if (list_gi.indexOf(gi) <= -1) {
      g.addNode(gi, {sequence: "<font color='#468499'>Accession: </font><a " +
      "href='https://www.ncbi.nlm.nih.gov/nuccore/" + gi.split('_').slice(0,2).join('_') + "' target='_blank'>" + gi + '</a>',
        log_length: 10
        // percentage: "<font color='#468499'>percentage: </font>" + perc
      })
      list_gi.push(gi)
    }
    // perc = parseFloat(readString[string].split(":")[1].replace(" ",""));
    if (document.getElementById('check_file').checked) {
      if (perc >= 0.5) {
        // perc values had to be normalized to the percentage value between 0
        // and 1
        read_color = chroma.mix('#eacc00', 'maroon', (perc - 0.5) * 2).hex()
        .replace('#', '0x')
      } else {
        read_color = chroma.mix('blue', '#eacc00', perc * 2).hex()
        .replace('#', '0x')
      }
      scale = chroma.scale(['blue', '#eacc00', 'maroon'])
      palette(scale, 20, readMode)
    } else {
      newPerc = rangeConverter(perc, cutoffParser(), 1, 0, 1)
      read_color = chroma.mix('lightsalmon', 'maroon', newPerc).hex().replace('#', '0x')
      scale = chroma.scale(['lightsalmon', 'maroon'])
      palette(scale, 20, readMode)
    }
    node_iter(g, read_color, gi, graphics, perc)
  }
  // control all related divs
  let showRerun = document.getElementById('Re_run')
  let showGoback = document.getElementById('go_back')
  let showDownload = document.getElementById('download_ds')
  showRerun.style.display = 'block'
  showGoback.style.display = 'block'
  showDownload.style.display = 'block'
  renderer.rerender()
  $('#loading').hide()
  return list_gi, listGiFilter
}

// function to iterate through nodes
const node_iter = (g, read_color, gi, graphics, perc) => {
  g.forEachNode( (node) => {
    // when filter removes all nodes and then adds them again. Looks like g
    // was somehow affected.
    // if statement added for parsing singletons into the graph visualization
    if (node.id.indexOf('singleton') > -1) {
      nodeGI = node.id.split('_').slice(1, 4).join('_')
    } else {
      nodeGI = node.id.split('_').slice(0, 3).join('_')
    }
    const nodeUI = graphics.getNodeUI(node.id)

    if (gi === nodeGI) {
      nodeUI.color = read_color
      nodeUI.backupColor = nodeUI.color
      node.data['percentage'] =  perc.toFixed(2).toString()
    }
  })
}

///////////////////
// link coloring //
///////////////////

const link_coloring = (g, graphics, renderer) => {
  g.forEachLink( (link) => {
    const dist = link.data * 10
    const linkUI = graphics.getLinkUI(link.id)
    if (document.getElementById('colorForm').value === 'Green color scheme' || document.getElementById('colorForm').value === '') {
      link_color = chroma.mix('#65B661', '#CAE368', dist).hex().replace('#', '0x') + 'FF'
    } else if (document.getElementById('colorForm').value === 'Blue color' +
      ' scheme') {
      link_color = chroma.mix('#025D8C', '#73C2FF', dist).hex().replace('#', '0x') + 'FF'
    } else if (document.getElementById('colorForm').value === 'Red color' +
      ' scheme') {
      link_color = chroma.mix('#4D0E1C', '#E87833', dist).hex().replace('#', '0x') + 'FF'
    }

    // since linkUI seems to use alpha in its color definition we had to set alpha to 100%
    // opacity by adding "FF" at the end of color string
    linkUI.color = link_color
  })
  renderer.rerender()
  $('#loading').hide()
}

// option to return links to their default color
const reset_link_color = (g, graphics, renderer) => {
  g.forEachLink(function (link) {
    const linkUI = graphics.getLinkUI(link.id)
    linkUI.color = 0xb3b3b3ff
  })
  renderer.rerender()
  $('#loading').hide()
}

// *** color scale legend *** //
// for distances
const color_legend = (readMode) => {
  if (document.getElementById('colorForm').value === 'Green color scheme' || document.getElementById('colorForm').value === '') {
    scale = chroma.scale(['#65B661', '#CAE368'])
  } else if (document.getElementById('colorForm').value === 'Blue color' +
    ' scheme') {
    scale = chroma.scale(['#025D8C', '#73C2FF'])
  } else if (document.getElementById('colorForm').value === 'Red color' +
    ' scheme') {
    scale = chroma.scale(['#4D0E1C', '#E87833'])
  }
  palette(scale, 20, readMode)
}

// get pallete
const palette = (scale, x, readMode) => { // x is the number of colors to the
// gradient
  showLegend = document.getElementById('colorLegend') // global variable to be reset by the button reset-filters
  showLegend.style.display = 'block'
  const tmpArray = new Array(x)// create an empty array with length x
  style_width = 100 / x
  // enters this statement for coloring the links and not the nodes
  if (readMode === 'undefined' || readMode !== true) {
    $('#scaleLegend').empty()
    // this loop should be reversed since the higher values will have a lighter color
    for (let i = tmpArray.length - 1; i >= 0; i--) {
      color_element = scale(i / x).hex()
      $('#scaleLegend').append('<span class="grad-step" style="background-color:' + color_element + '; width:' + style_width + '%"></span>')
    }
    $('#scaleLegend').append('<div class="header_taxa" id="min">0.1</div>')
    $('#scaleLegend').append('<div class="header_taxa" id="med">0.05</div>')
    $('#scaleLegend').append('<div class="header_taxa" id="max">0</div>')
    document.getElementById('distance_label').style.display = 'block' // show label
  } else { // here enters for coloring the reads
    $('#readLegend').empty()
    for (let i = 0; i < tmpArray.length; i++) {
      color_element = scale(i / x).hex()
      $('#readLegend').append('<span class="grad-step" style="background-color:' + color_element + '; width:' + style_width + '%"></span>')
    }
    $('#readLegend').append('<div class="header_taxa" id="min">0.6</div>')
    $('#readLegend').append('<div class="header_taxa" id="med">0.8</div>')
    $('#readLegend').append('<div class="header_taxa" id="max">1</div>')
    document.getElementById('read_label').style.display = 'block' // show label
  }
}

// convertes a given range to valies between c and 1
const rangeConverter = (x, oldMin, oldMax, newMin, newMax) => {
  // initial range is between 0 and 1
  // newMax should be 1
  // newMin should be the one that may change on user input and default
  // behavior should be 0.6--> this is done by cutoffParser()
  const y = (x - oldMin) * (newMax - newMin) / (oldMax - oldMin) + newMin
  return y
}

// function to get value from cutoffValue
const cutoffParser = () => {
  return ($("#cutoffValue").val() !== "") ? parseFloat($("#cutoffValue").val()) : 0.6
}
