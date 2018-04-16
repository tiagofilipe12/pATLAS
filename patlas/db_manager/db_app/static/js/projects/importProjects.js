/*globals FileSaver, iterateArrays, selectedFilter, filterDisplayer,
 readFilejson, mashJson, assemblyJson, consensusJson*/

/**
 * A function to save files to output
 * @param {String} fileName - the string that will be the file name
 * @param {String} typeOfFile - The type of data to be saved. It can be for
 * example "data:application/json;charset=utf-8" or "text/plain;charset=utf-8"
 * @param {Array} textToExport - The array of elements to be saved to file
 */
const fileDownloader = (fileName, typeOfFile, textToExport) => {

  const file = new Blob(textToExport, {type: typeOfFile})

  FileSaver.saveAs(file, fileName)
}


/**
 * Function to parse the current view to be displayed by the project. It can be
 * used for initial import of the project or for further views cycling
 * @param {Object} importedFileProject - The json file containing all the
 * project entries
 * @param {String} view - The string that checks the view that is requested by
 * the user, through the dropdown menu
 * @returns {Object|Array}
 */
const importProject = (importedFileProject, view) => {
  // get first imported project
  // TODO in the future this should receive a single project?
  const firstProject = JSON.parse(
    importedFileProject[Object.keys(importedFileProject)[0]]
  )


  for (const k in firstProject) {
    if (firstProject[k] === false) {
      // disables options from the two dropdowns by using the classes that
      // match the k value
      $(`.${k}`).prop("disabled", true)
      $("#viewList, #viewList2").selectpicker("refresh")
    }
  }

  return firstProject[view]
}


/**
 * The objective of this function is to populate the respective displayers in
 * each menu and trigger the event for the selected view
 * @param {Object|Array} projectInitialView - This object stores the selections
 * saved to the project. It can be an array in the case of plasmidfinder and
 * virulence, but for everything else it is an object.
 * @param {String} view - The variable that stores the information of the view
 * that is being requested by the user.
 * @returns {Promise<void>}
 */
const setProjectView = async (projectInitialView, view) => {

  // instance when view is resistance or taxa or results imports -
  // projectInitialView will be an object
  if (projectInitialView.constructor !== Array) {

    // if taxa or resistance do this...
    if (view === "taxa" || view === "resistance") {

      // iterate through each taxa level
      for (let k in projectInitialView) {

        if (projectInitialView.hasOwnProperty(k)) {
          const stringClass = k.charAt(0).toUpperCase() + k.slice(1)

          // iterate through the array of taxa selected within each taxa level to
          // append things to displayer in respective taxaModal
          for (const item in projectInitialView[k]) {
            if (projectInitialView[k].hasOwnProperty(item)) {
              filterDisplayer(projectInitialView[k][item], stringClass,
                `#p_${stringClass}`)
            }
          }
        }
      }

      // intersection and union also store an object therefore need a different
      // parsing
    } else if (view === "intersection" || view === "union") {

      // iterate through object to populate the dropdowns
      for (const key in projectInitialView) {

        // then each dropdown need to be selected according to the current
        // project selection
        if (key === "virulence") {
          $("#virList2").selectpicker("val", projectInitialView[key])
        }

        if (key === "card") {
          $("#resCardList2").selectpicker("val", projectInitialView[key])
        }

        if (key === "resfinder") {
          $("#resResfinderList2").selectpicker("val", projectInitialView[key])
        }

        if (key === "pfinder") {
          $("#pfList2").selectpicker("val", projectInitialView[key])
        }

        if (key === "species") {
          $("#speciesList2").selectpicker("val", projectInitialView[key])
        }

        if (key === "genus") {
          $("#genusList2").selectpicker("val", projectInitialView[key])
        }

        if (key === "family") {
          $("#familyList2").selectpicker("val", projectInitialView[key])
        }

        if (key === "order") {
          $("#orderList2").selectpicker("val", projectInitialView[key])
        }
      }

      // after all dropwdowns have been selected accordingly with the project
      // selection, the respective click function must be triggered to highlight
      // on the graph
      if (view === "union") {
        $("#unionModalSubmit").click()
      } else {
        $("#intersectionsModalSubmit").click()
      }

      // there is also other instance where an object is saved and that is for
      // projects with saves from files (mapping, mashscreen, assembly and
      // consensus)
    } else {

      // the rational here is to save to the object that controls the
      // visualization of each result and trigger the event that colors
      // the nodes. TODO it is not possible to re-filter these results.
      if (view === "mapping") {

        // mapping results
        readFilejson = projectInitialView
        $("#fileSubmit").click()

      } else if (view === "mashscreen") {

        // mashscreen results
        mashJson = projectInitialView
        $("#fileSubmit_mash").click()

      } else if (view === "assembly") {

        // assembly results
        assemblyJson = projectInitialView
        $("#assemblySubmit").click()

      } else {

        // consensus results
        consensusJson = projectInitialView
        $("#consensusSubmit").click()

      }

    }

    // Also, some projects may save some arrays instead of objects. For instance,
    // projects with plasmidfinder and virulence selections
  } else {

    // iterate through the items in the array of queries to be made and populate
    // the menu displayer. This is used for both virulence and plasmidfinder.
    // TODO if for some reason this changes to an object it could be parsed similarly to what is done for resistances or taxa
    for (const item of projectInitialView) {
      const stringClass = view.charAt(0).toUpperCase() + view.slice(1)
      filterDisplayer(item, stringClass, `#p_${stringClass}`)
    }

  }

  // then make sure that dropdowns are also selected as well as displayers in
  // each modal
  // first for taxa related dropdowns
  if (view === "taxa") {

    for (const key in projectInitialView) {

      if (key === "species") {
        $("#speciesList").selectpicker("val", projectInitialView[key])
      }

      if (key === "genus") {
        $("#genusList").selectpicker("val", projectInitialView[key])
      }

      if (key === "family") {
        $("#familyList").selectpicker("val", projectInitialView[key])
      }

      if (key === "order") {
        $("#orderList").selectpicker("val", projectInitialView[key])
      }

    }

    $("#taxaModalSubmit").click()

    // then for resistance related dropdowns
  } else if (view === "resistance") {

    for (const key in projectInitialView) {

      if (key === "card") {
        $("#cardList").selectpicker("val", projectInitialView[key])
      }

      if (key === "resfinder") {
        $("#resList").selectpicker("val", projectInitialView[key])
      }

    }

    $("#resSubmit").click()

    // for plasmidfinder dropdown
  } else if (view === "plasmidfinder") {

    $("#plasmidFamiliesList").selectpicker("val", projectInitialView)

    $("#pfSubmit").click()

    // and for virulence dropdown
  } else if (view === "virulence") {

    $("#virList").selectpicker("val", projectInitialView)

    $("#virSubmit").click()

  }

}
