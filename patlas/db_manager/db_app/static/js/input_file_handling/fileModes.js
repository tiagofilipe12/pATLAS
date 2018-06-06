/*globals fileChecks, resetAllNodes, hideAllOtherPlots, readColoring,
pushToMasterReadArray, hideDivsFileInputs, assemblyJson,
previousTableList, readFilejson, nodeColor, listGi, fileChecks,
masterReadArray, selector, areaSelection, showDiv, mashJson, assemblyJson,
listGiFilter, typeOfProject*/

const mappingHighlight = (g, graphics, renderer) => {

  // feeds the first file
  const readString = (typeof Object.values(readFilejson)[0] === "string") ?
    JSON.parse(Object.values(readFilejson)[0]) : Object.values(readFilejson)[0]

  masterReadArray = []

  fileChecks(readString)

  if (mashJson !== false) {
    // masterReadArray = []
    assemblyJson = false
    // readFilejson = mashJson // converts mashJson into readFilejson to
    // const readString = JSON.parse(Object.values(mashJson)[0])
    // fileChecks(readString)
    $("#fileNameDiv").html(Object.keys(mashJson)[0])
      .show()

    // it and use the same function (readColoring)
    resetAllNodes(graphics, g, nodeColor, renderer)
    previousTableList = []
    // transform selector object that handles plots and hide their
    // respective divs
    Object.keys(selector).map((el) => {
      selector[el].state = false
    })
    hideAllOtherPlots()
    areaSelection = false

    showDiv().then( () => {
      const outputList = readColoring(g, listGi, graphics, renderer, readString)
      listGi = outputList[0]
      listGiFilter = outputList[1]

      // adds mash screen queries to the typeOfProject
      typeOfProject["mashscreen"] = readFilejson

      masterReadArray = pushToMasterReadArray(readFilejson)

      hideDivsFileInputs()
    })

  } else if (assemblyJson !== false) {

    // const readString = JSON.parse(Object.values(assemblyJson)[0])
    // fileChecks(readString)
    $("#fileNameDiv").html(Object.keys(assemblyJson)[0])
      .show()
    // masterReadArray = []
    // readFilejson = assemblyJson
    resetAllNodes(graphics, g, nodeColor, renderer)
    previousTableList = []
    // transform selector object that handles plots and hide their
    // respective divs
    Object.keys(selector).map( (el) => { selector[el].state = false })
    hideAllOtherPlots()
    areaSelection = false
    $("#loading").show()
    showDiv().then( () => {
      const outputList = readColoring(g, listGi, graphics, renderer, readString)
      listGi = outputList[0]
      listGiFilter = outputList[1]

      // adds mash screen queries to the typeOfProject
      typeOfProject["assembly"] = readFilejson

      masterReadArray = pushToMasterReadArray(readFilejson)

      hideDivsFileInputs()

    })

  } else if (readFilejson !== false) {
    // masterReadArray = []
    assemblyJson = false
    // // feeds the first file
    // const readString = (typeof Object.values(readFilejson)[0] === "string") ?
    //   JSON.parse(Object.values(readFilejson)[0]) : Object.values(readFilejson)[0]
    // const readString = Object.values(readFilejson)[0]

    // fileChecks(readString)
    $("#fileNameDiv").html(readString)
      .show()

    resetAllNodes(graphics, g, nodeColor, renderer)
    previousTableList = []
    // transform selector object that handles plots and hide their
    // respective divs
    Object.keys(selector).map((el) => {
      selector[el].state = false
    })
    hideAllOtherPlots()
    areaSelection = false
    // $("#loading").show()
    showDiv().then( () => {
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
