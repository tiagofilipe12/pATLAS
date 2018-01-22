/**
 * Function to handle the assembly import file. Function became legacy,
 * since assembly import is no longer used as an independent node
 * @param {Array} listGi - An array of all accession numbers represented
 * with nodes in pATLAS.
 * @param {Object} assemblyFile - Stores all the files as keys and values as
 * @param {Object} g - graph related functions that iterate through nodes
 * and links.
 * @param {Object} graphics - vivagraph functions related with node and link
 * data.
 * @param {Array} masterReadArray - The array that will store everything
 * that passes the cutoffs, which in this case it will be everything
 * imported by assemblyJson
 * @param {Array} listGiFilter - Array that stores the selected nodes that
 * is used in many other features throughout pATLAS.
 * @returns {Array} listGiFilter - Array that stores the selected nodes that
 * is used in many other features throughout pATLAS.
 */
// const assembly = (listGi, assemblyFile, g, graphics, masterReadArray, listGiFilter) => {
//   // iterate through all entries in assembly file
//   for (const i in assemblyFile) {
//     if (assemblyFile.hasOwnProperty(i)) {
//       const controlArray = []
//       const fileEntries = JSON.parse(assemblyFile[i])
//       // for each file adds a node for each file
//       g.addNode(i, {
//         sequence: "<span style='color:#468499'>Accession:" +
//         " </span>" + i,
//         //species:"<font color='#468499'>Species:
//         // </font>" + species,
//         seqLength: "<span" +
//         " style='color:#468499'>Sequence length:" +
//         " </span>" + "N/A",
//         logLength: 10
//       })
//       const nodeUI = graphics.getNodeUI(i)
//       nodeUI.backupColor = nodeUI.color
//       nodeUI.color = 0xC70039
//       // iterate each accession number
//       for (const i2 in fileEntries) {
//         if (fileEntries.hasOwnProperty(i2)) {
//           // if not in masterReadArray then add it
//           if (masterReadArray.indexOf(i2) < 0 && fileEntries[i2] >= 0.9) {
//             // cutOffParser()
//             masterReadArray.push(i2)
//             controlArray.push(i2)
//           }
//         }
//       }
//       // for each file iterate through all nodes
//       g.forEachNode( (node) => {
//         if (controlArray.indexOf(node.id) > -1) {
//           g.addLink(i, node.id, {distance: JSON.parse(assemblyFile[i])[node.id]})
//           // add percentage information to node
//           node.data["percentage"] = (JSON.parse(assemblyFile[i])[node.id])
//             .toFixed(2).toString()
//           // change the color of linked nodes
//           const nodeUI2 = graphics.getNodeUI(node.id)
//           nodeUI2.backupColor = nodeUI.color
//           nodeUI2.color = 0xFF5733
//           // add to listGiFilter
//           listGiFilter.push(node.id)
//         }
//       })
//     }
//   }
//   // control all related divs
//
//   $("#assemblyLegend").empty()
//     .append(
//       "<li class=\"centeredList\"><button class=\"jscolor btn btn-default\"" +
//       " style=\"background-color:#C70039\" ></button>&nbsp;contigs</li>",
//       "<li class=\"centeredList\"><button class=\"jscolor btn btn-default\"" +
//       " style=\"background-color:#FF5733\" ></button>&nbsp;significant" +
//       " links</li>",
//       "<li class=\"centeredList\"><button class=\"jscolor btn btn-default\"" +
//       " style=\"background-color:#666370\" ></button>&nbsp;others</li>"
//     )
//
//   let showRerun = document.getElementById("Re_run")
//   let showGoback = document.getElementById("go_back")
//   let showDownload = document.getElementById("download_ds")
//   let showTable = document.getElementById("tableShow")
//   let heatMap = document.getElementById("heatmapButtonTab")
//   let showLegend = document.getElementById("colorLegend")
//   let plotButton = document.getElementById("plotButton")
//   showRerun.style.display = "block"
//   showGoback.style.display = "block"
//   showDownload.style.display = "block"
//   showTable.style.display = "block"
//   heatMap.style.display = "block"
//   showLegend.style.display = "block"
//
//   plotButton.style.display = "block"
//   $("#readString").empty()
//   $("#assemblyLabel").show()
//   // renderer.run()
//   return listGiFilter
// }
