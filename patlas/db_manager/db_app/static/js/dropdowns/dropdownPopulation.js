/*globals getArrayTaxa, getArrayRes, getArrayPf, getArrayVir,
singleDropdownPopulate, filterDisplayer*/

const listOrders = [],
  listFamilies = [],
  listGenera = [],
  listSpecies = []

/**
 * Part of the code that populates all taxa associated dropdowns, both in
 * browse --> taxa and browse --> advanced multiple
 */

// if (firstInstace === true && pageReload === false) {
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

  // clickable <li> and control of displayer of current filters
  const classArray = [".OrderClass", ".FamilyClass", ".GenusClass", ".SpeciesClass"]
  for (let i = 0; i < classArray.length; i++) {
    $(classArray[i]).on("click", function() {
      // fill panel group displaying current selected taxa filters //
      const stringClass = this.className.split(" ")[0].slice(0, -5)
      const tempVar = this.lastChild.innerHTML

      // checks if a taxon is already in display
      const divStringClass = "#p_" + stringClass
      
      filterDisplayer(tempVar, stringClass, divStringClass)
    })
  }
})
// }

/**
 * Part of the code that populates the resistance dropdowns available through
 * browse --> resistances and browse --> advanced multiple
 */
// if (firstInstace === true && pageReload === false) {
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
  singleDropdownPopulate("#resList", listRes, "ResfinderClass")

  // populate the menus for intercection filters
  singleDropdownPopulate("#resCardList2", listCard, false)
  singleDropdownPopulate("#resResfinderList2", listRes, false)


  const classArray = [".CardClass", ".ResfinderClass"]
  for (let i = 0; i < classArray.length; i++) {
    $(classArray[i]).on("click", function() {
      // fill panel group displaying current selected taxa filters //
      const stringClass = this.className.split(" ")[0].slice(0, -5)
      const tempVar = this.lastChild.innerHTML

      // checks if a taxon is already in display
      const divStringClass = "#p_" + stringClass

      filterDisplayer(tempVar, stringClass, divStringClass)
    })
  }
})
// }


/**
 * Code that gests plasmidfinder dropdowns populated. Both through browse -->
 * Plasmid Families and browse --> advanced multiple
 */
// if (firstInstace === true && pageReload === false) {
getArrayPf().done((json) => {
  // first parse the json input file
  const listPF = []
  // iterate over the file
  $.each(json, (accession, entry) => {
    const geneEntries = entry.gene
    for (let i in geneEntries) {
      if (geneEntries.hasOwnProperty(i)) {
        if (listPF.indexOf(geneEntries[i]) < 0) {
          listPF.push(geneEntries[i])
        }
      }
    }
  })

  // populate the menus for plasmid finder filter
  singleDropdownPopulate("#plasmidFamiliesList", listPF, "PlasmidfinderClass")

  // populate the menus for the intercection filters
  singleDropdownPopulate("#pfList2", listPF, false)

  $(".PlasmidfinderClass").on("click", function() {
    // fill panel group displaying current selected taxa filters //
    const stringClass = this.className.split(" ")[0].slice(0, -5)
    const tempVar = this.lastChild.innerHTML
    // checks if a taxon is already in display
    const divStringClass = "#p_" + stringClass

    filterDisplayer(tempVar, stringClass, divStringClass)
  })
})
// }


/**
 * Code that gets the virulence dropdowns populated, both through browse -->
 * virulence or browse --> advanced multiple
 */
// if (firstInstace === true && pageReload === false) {
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
  singleDropdownPopulate("#virList", listVir, "VirulenceClass")

  // populate the menus for the intercection filters
  singleDropdownPopulate("#virList2", listVir, false)

  $(".VirulenceClass").on("click", function() {
    // fill panel group displaying current selected taxa filters //
    const stringClass = this.className.split(" ")[0].slice(0, -5)
    const tempVar = this.lastChild.innerHTML
    // checks if a taxon is already in display
    const divStringClass = "#p_" + stringClass

    filterDisplayer(tempVar, stringClass, divStringClass)
  })
})
// }
