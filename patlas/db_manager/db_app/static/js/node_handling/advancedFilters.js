/**
 * Function that controls if a selector is being clicked for the first time
 * or if it is being deselected in order to allow to use other selectors
 * from the same level. For example, this prevents that multiple taxa selectors
 * are used at the same time
 * @param {boolean|String} lastTaxaSelector - The variable that controls the
 * last selector that was clicked. When nothing is selected it is false,
 * otherwise it will store the string with the last element that was clicked.
 * @param {Object} e - The object with the event
 * @param {Array} arrayOfSelectors - An array with all the ids of the selectors
 * to control.
 * @returns {boolean|String}
 */
const controlFiltersSameLevel = (lastTaxaSelector, e, arrayOfSelectors) => {

  // if lastTaxaSelector is false then disable all other selectors than the one
  //being clicked
  if (lastTaxaSelector === false) {
    for (const selector of arrayOfSelectors) {
      if (selector !== e.target.id) {
        $(`#${selector}`).prop("disabled", true)
      }
    }
    lastTaxaSelector = e.target.id
  } else {
    // otherwise just remove the disabled property.
    lastTaxaSelector = false
    for (const selector of arrayOfSelectors) {
      $(`#${selector}`).prop("disabled", false)
    }
  }

  // returns the state of lastTaxaSelector
  return lastTaxaSelector
}


const mapRequest = (requestConst) => {
  requestList = []
  if (requestConst !==  false) {
    requestConst.map( (request) => {
      requestList.push(request.plasmid_id)
    })
  }
  return requestList
}


const commonArrayEntries = async (arrayOfArrays) => {
  // let returnList = []
  let concatArray = []

  // concatenates all the arrays given to this function
  for (const arr of arrayOfArrays)
    if (arr !== false)
      concatArray = concatArray.concat(arr)

  //now store all accessions that have multiple entries in concatArray
  let returnList = concatArray.filter( (elem, pos, arr) => {
    return arr.indexOf(elem) !== pos
  })
  // remove duplicated entries in the case many filters are applied
  // (more than two)
  returnList = returnList.filter( (elem, pos, arr) => {
      return arr.indexOf(elem) === pos
    })

  return returnList
}

const parseQueriesIntersection = async (g, graphics, renderer,
                                        objectOfSelections) => {

  // first parse the multitude of taxa entries and resistance entries available
  const taxa = (objectOfSelections.order.length > 0) ? objectOfSelections.order
    : (objectOfSelections.family.length > 0) ? objectOfSelections.family
      : (objectOfSelections.genus.length > 0) ? objectOfSelections.genus
        : (objectOfSelections.species.length > 0) ? objectOfSelections.species
          : false

  const res = (objectOfSelections.card.length > 0) ? objectOfSelections.card
    : (objectOfSelections.resfinder.length > 0) ? objectOfSelections.resfinder
      : false

  const taxaQueryResults = (taxa === objectOfSelections.species) ?
    await speciesRequest(g, graphics, renderer, taxa[0], false) :
    (taxa !== false) ?
      await taxaRequest(g, graphics, renderer, taxa[0], false) :
      false


  const resHandle = (res !== false) ?
    await resRequest(g, graphics, renderer, res[0], false) : false


  const pfHandle = (objectOfSelections.pfinder.length > 0) ?
    await pfRequest(g, graphics, renderer, objectOfSelections.pfinder[0],
      false) : false


  const virHandle = (objectOfSelections.virulence.length > 0) ?
    await virRequest(g, graphics, renderer, objectOfSelections.virulence[0],
      false) : false

  const listTaxa = mapRequest(taxaQueryResults)
  const listRes = mapRequest(resHandle)
  const listPf = mapRequest(pfHandle)
  const listVir = mapRequest(virHandle)

  tempList = await commonArrayEntries([listTaxa, listRes, listPf, listVir])

  // console.log(listTaxa, listRes, listPf, listVir)

  console.log(tempList)

  colorNodes(g, graphics, renderer, tempList, 0xff1c00)
  return tempList
}
