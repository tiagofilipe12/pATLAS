/*globals getArrayTaxa, getArrayRes, getArrayPf, getArrayVir,
singleDropdownPopulate, filterDisplayer, fileMode, requestResults,
currentSample, getArrayMetal*/

// start 4 arrays one for each taxonomic level that will be populated by
// getArrayTaxa function
const listOrders = [],
  listFamilies = [],
  listGenera = [],
  listSpecies = []

/**
 * Part of the code that populates all taxa associated dropdowns, both in
 * browse --> taxa and browse --> advanced multiple
 */
getArrayTaxa().done((json) => {
  $.each(json, (sps, other) => {    // sps aka species
    const species = sps.split("_").join(" ")
    const genus = other[0]
    const family = other[1]
    const order = other[2]

    if (listGenera.indexOf(genus) < 0) {
      listGenera.push(genus)
    }
    if (listFamilies.indexOf(family) < 0) {
      listFamilies.push(family)
    }
    if (listOrders.indexOf(order) < 0) {
      listOrders.push(order)
    }
    if (listSpecies.indexOf(species) < 0) {
      listSpecies.push(species)
    }
  })

  // populate the menus for taxa filters
  singleDropdownPopulate("#orderList", listOrders, "OrderClass")
  singleDropdownPopulate("#familyList", listFamilies, "FamilyClass")
  singleDropdownPopulate("#genusList", listGenera, "GenusClass")
  singleDropdownPopulate("#speciesList", listSpecies, "SpeciesClass")

  // populate the menus for the intersection filters
  singleDropdownPopulate("#orderList2", listOrders, false)
  singleDropdownPopulate("#familyList2", listFamilies, false)
  singleDropdownPopulate("#genusList2", listGenera, false)
  singleDropdownPopulate("#speciesList2", listSpecies, false)

})


/**
 * Part of the code that populates the resistance dropdowns available through
 * browse --> resistances and browse --> advanced multiple
 */
getArrayRes().done( (json) => {
  const listCard = [],
    listRes = []
  // iterate over the file
  $.each(json, (accession, entry) => {
    const databaseEntries = entry.database
    const geneEntries = entry.gene
    for (let i in databaseEntries) {
      if (databaseEntries.hasOwnProperty(i)) {
        if (databaseEntries[i] === "card" && listCard.indexOf(geneEntries[i]) < 0) {
          listCard.push(geneEntries[i])
        } else {
          if (listRes.indexOf(geneEntries[i]) < 0) {
            listRes.push(geneEntries[i])
          }
        }
      }
    }
  })

  // populate the menus for resistance filters
  singleDropdownPopulate("#cardList", listCard, "CardClass")
  singleDropdownPopulate("#resfinderList", listRes, "ResfinderClass")

  // populate the menus for intercection filters
  singleDropdownPopulate("#resCardList2", listCard, false)
  singleDropdownPopulate("#resResfinderList2", listRes, false)

})

/**
 * Code that gests plasmidfinder dropdowns populated. Both through browse -->
 * Plasmid Families and browse --> advanced multiple
 */
getArrayPf().done((json) => {
  // first parse the json input file
  const listPF = []
  // iterate over the file
  $.each(json, (accession, entry) => {
    const geneEntries = entry.gene
    for (let i of geneEntries) {

      //TODO this should be removed once plasmidefinder abricate is used - listPF.push(i), everything else should be ignored
      const length_split = i.split("_")
      const parsed_i = length_split
        .slice(0, length_split.length - 1)
        .join("_")
        // replace every _NC in the end
        .replace(/\_NC$/, "")
        // then remove _ in the end of the plasmidfinder gene name
        .replace(/\_$/, "")

      // checks if entry is already in listPF and if so doesn't populate the
      // dropdown.
      if (listPF.indexOf(parsed_i) < 0) {
        listPF.push(parsed_i)
      }
    }
  })

  // populate the menus for plasmid finder filter
  singleDropdownPopulate("#plasmidFinderList", listPF, "PlasmidFinderClass")

  // populate the menus for the intercection filters
  singleDropdownPopulate("#pfList2", listPF, false)
})

/**
 * Code that gets the virulence dropdowns populated, both through browse -->
 * virulence or browse --> advanced multiple
 */
getArrayVir().done( (json) => {
  // first parse the json input file
  const listVir = []
  // iterate over the file
  $.each(json, (accession, entry) => {
    const geneEntries = entry.gene
    for (let i in geneEntries) {
      if (geneEntries.hasOwnProperty(i)) {
        if (listVir.indexOf(geneEntries[i]) < 0) {
          listVir.push(geneEntries[i])
        }
      }
    }
  })

  // populate the menus virulence filters
  singleDropdownPopulate("#virulenceList", listVir, "VirulenceClass")

  // populate the menus for the intersection filters
  singleDropdownPopulate("#virList2", listVir, false)
})

/**
 * Code that gets the metal resistance dropdowns populated, both through browse
 * --> metal or browse --> advanced multiple
 */
getArrayMetal().done( (json) => {
  // first parse the json input file
  const listMetal = []
  // iterate over the file
  $.each(json, (accession, entry) => {
    const geneEntries = entry.gene
    for (let i in geneEntries) {
      if (geneEntries.hasOwnProperty(i)) {
        if (listMetal.indexOf(geneEntries[i]) < 0) {
          listMetal.push(geneEntries[i])
        }
      }
    }
  })

  // populate the menus virulence filters
  singleDropdownPopulate("#metalList", listMetal, "MetalClass")

  // populate the menus for the intersection filters
  singleDropdownPopulate("#metalList2", listMetal, false)
})

/**
 * Function that populates the samples dropdown, selecting the first sample in
 * the sampleObject.arrayOfFiles by default that can then be changed by the
 * user.
 * @param {Object} sampleObject - An object containing the arrayOfFiles and
 * arrayOfObj
 * @param {String} type - The id of the div in which the sample was dragged or
 * imported from form.
 */
const dropdownSample = (sampleObject, type) => {
  // variable that will look for the id of the modal body that contains both the
  // text input and the select
  const parentModalBody = $(type).parent().parent().parent().attr("id")
  // variable that will fetch the desired select
  const selectMenu = $(`#${parentModalBody} .row .sampleDropdown .selectpicker`)
    .attr("id", `${type.replace("#", "")}_samples`)

  // forces the respective dropdown to be emptied each time a new file is
  // imported
  selectMenu.find("option").remove().end()

  // populates the dropdown of the modal in which the sample is being imported
  singleDropdownPopulate(selectMenu, sampleObject.arrayOfFiles, "samplesClass")
  // by default selects the first sample in the array in the dropdown
  selectMenu.selectpicker("val", sampleObject.arrayOfFiles[0])
}

/**
 * Function to make a correspondence between the slider buttons for each sample
 * imported and the respective dropdowns where they were imported
 */
const selectSampleDropdownProgrammatically = () => {
  // these divs ids come from the above function in which selectMenu gets an id
  const correspondenceDivs = {
    "assembly": "#assembly_text_samples",
    "mapping": "#file_text_samples",
    "mash_screen": "#file_text_mash_samples",
    "consensus": "#consensus_text_samples"
  }

  $(`${correspondenceDivs[fileMode]}`).selectpicker("val", currentSample)

  if (requestResults) {
    // checks if requests are being used or other dropdowns from file selections
    // this checks if the dropdown has no selection and if so it doesn't update
    // currentSample
    if ($("#sampleDropdownRequests").selectpicker("val") !== ""){
      $("#sampleDropdownRequests").selectpicker("val", currentSample)
    }
  }
}
