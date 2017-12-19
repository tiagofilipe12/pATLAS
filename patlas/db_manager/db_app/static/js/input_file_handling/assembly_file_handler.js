const assembly = (listGi, assemblyFile, g, graphics, masterReadArray, listGiFilter) => {
  // iterate through all entries in assembly file
  for (const i in assemblyFile) {
    if (assemblyFile.hasOwnProperty(i)) {
      const controlArray = []
      const fileEntries = JSON.parse(assemblyFile[i])
      // for each file adds a node for each file
      g.addNode(i, {
        sequence: "<span style='color:#468499'>Accession:" +
        " </span>" + i,
        //species:"<font color='#468499'>Species:
        // </font>" + species,
        seq_length: "<span" +
        " style='color:#468499'>Sequence length:" +
        " </span>" + "N/A",
        log_length: 10
      })
      const nodeUI = graphics.getNodeUI(i)
      nodeUI.backupColor = nodeUI.color
      nodeUI.color = 0xC70039
      // iterate each accession number
      for (const i2 in fileEntries) {
        if (fileEntries.hasOwnProperty(i2)) {
          // if not in masterReadArray then add it
          if (masterReadArray.indexOf(i2) < 0 && fileEntries[i2] >= 0.9) {
            // TODO hardcoded to 0.9 but it should use something like
            // cutOffParser()
            masterReadArray.push(i2)
            controlArray.push(i2)
          }
        }
      }
      // for each file iterate through all nodes
      g.forEachNode( (node) => {
        if (controlArray.indexOf(node.id) > -1) {
          g.addLink(i, node.id, {distance: JSON.parse(assemblyFile[i])[node.id]})
          // add percentage information to node
          node.data["percentage"] = (JSON.parse(assemblyFile[i])[node.id])
            .toFixed(2).toString()
          // change the color of linked nodes
          const nodeUI2 = graphics.getNodeUI(node.id)
          nodeUI2.backupColor = nodeUI.color
          nodeUI2.color = 0xFF5733
          // add to listGiFilter
          listGiFilter.push(node.id)
        }
      })
    }
  }
  // control all related divs

  $("#assemblyLegend").empty()
  $("#assemblyLegend").append(
    "<li class=\"centeredList\"><button class=\"jscolor btn btn-default\"" +
    " style=\"background-color:#C70039\" ></button>&nbsp;contigs</li>",
    "<li class=\"centeredList\"><button class=\"jscolor btn btn-default\"" +
    " style=\"background-color:#FF5733\" ></button>&nbsp;significant" +
    " links</li>",
    "<li class=\"centeredList\"><button class=\"jscolor btn btn-default\"" +
    " style=\"background-color:#666370\" ></button>&nbsp;others</li>"
  )

  let showRerun = document.getElementById("Re_run")
  let showGoback = document.getElementById("go_back")
  let showDownload = document.getElementById("download_ds")
  let showTable = document.getElementById("tableShow")
  let showLegend = document.getElementById("colorLegend")
  showRerun.style.display = "block"
  showGoback.style.display = "block"
  showDownload.style.display = "block"
  showTable.style.display = "block"
  showLegend.style.display = "block"
  $("#readString").empty()
  $("#assemblyLabel").show()
  // renderer.run()
  return listGiFilter
}
