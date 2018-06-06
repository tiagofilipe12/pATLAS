/*globals fileChecks, resetAllNodes, hideAllOtherPlots, readColoring,
pushToMasterReadArray, hideDivsFileInputs, assemblyJson,
previousTableList, readFilejson, nodeColor, listGi, fileChecks,
masterReadArray, selector, areaSelection, showDiv, mashJson, assemblyJson,
listGiFilter, typeOfProject*/


/**
 * Function that parses the nodes to be highlighted and handles the globals
 * required for posterior analysis or filters
 * @param {Object} g
 * @param {Object} graphics
 * @param {Object} renderer
 */
const mappingHighlight = (g, graphics, renderer) => {

  // feeds the first file
  const readString = (Object.keys(readFilejson).length === 0) ?
    false : (typeof Object.values(readFilejson)[0] === "string") ?
      JSON.parse(Object.values(readFilejson)[0]) : Object.values(readFilejson)[0]

  fileChecks(readString)

  masterReadArray = []

  resetAllNodes(graphics, g, nodeColor, renderer)

  previousTableList = []

  Object.keys(selector).map((el) => {
    selector[el].state = false
  })

  hideAllOtherPlots()

  areaSelection = false

  if (readString) {
    if (mashJson !== false) {

      assemblyJson = false

      $("#fileNameDiv").html(Object.keys(mashJson)[0])
        .show()

      showDiv().then(() => {
        const outputList = readColoring(g, listGi, graphics, renderer, readString)
        listGi = outputList[0]
        listGiFilter = outputList[1]

        // adds mash screen queries to the typeOfProject
        typeOfProject["mashscreen"] = readFilejson

        masterReadArray = pushToMasterReadArray(readFilejson)

        hideDivsFileInputs()
      })

    } else if (assemblyJson !== false) {

      $("#fileNameDiv").html(Object.keys(assemblyJson)[0])
        .show()

      showDiv().then(() => {
        const outputList = readColoring(g, listGi, graphics, renderer, readString)
        listGi = outputList[0]
        listGiFilter = outputList[1]

        // adds mash screen queries to the typeOfProject
        typeOfProject["assembly"] = readFilejson

        masterReadArray = pushToMasterReadArray(readFilejson)

        hideDivsFileInputs()

      })

    } else if (Object.keys(readFilejson).length > 0 || readFilejson !== false) {

      assemblyJson = false

      $("#fileNameDiv").html(Object.keys(readFilejson)[0])
        .show()

      showDiv().then(() => {
        // colors each node for first element of readFilejson
        const outLists = readColoring(g, listGi, graphics, renderer, readString)
        listGi = outLists[0]
        listGiFilter = outLists[1]

        // adds read queries to the typeOfProject
        typeOfProject["mapping"] = readFilejson

        masterReadArray = pushToMasterReadArray(readFilejson)

        hideDivsFileInputs()
      })

    } else {
      // alert user that file may be empty or there is no imported file at all
      fileChecks(readFilejson)
    }
  }
}
