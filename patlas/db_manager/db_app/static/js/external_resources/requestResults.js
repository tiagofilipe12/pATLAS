/*globals assemblyJson, mashJson, readFilejson, fileMode, pageReload,
singleDropdownPopulate*/

/**
 * Function that parses the results coming from external requests. If the
 * variable passed to this function is a JSON object then it will render a
 * proper visualization of the results. If that is not the case it will not
 * render results but a pATLAS instance.
 * @param {Object} requestResults - The JSON object that is send by the
 * database to the current URL
 */
const parseRequestResults = (requestResults) => {
  // this parsing assumes that the 'type' and 'samples' keys are present in
  // requestResults, which is handled by the `show_highlighted_results` view
  if (requestResults) {
    $("#requestModalShow").show()
    fileMode = requestResults.type

    // empties dropdown if it is already populated to avoid duplicates
    // forces the respective dropdown to be emptied each time a new file is
    // imported
    $("#sampleDropdownRequests").find("option").remove().end()

    // populates the sample dropdown for the request modal
    singleDropdownPopulate("#sampleDropdownRequests",
      Object.keys(requestResults.samples), "samplesClass")

    // By default it will select the first sample in array
    $("#sampleDropdownRequests").selectpicker("val", Object.keys(requestResults.samples)[0])

    if (fileMode === "mapping") {
      readFilejson = requestResults.samples
      $("#mappingCutOff").show()
    } else if (fileMode === "mash_screen") {
      mashJson = requestResults.samples
      $("#mashScreenCutOff").show()
    } else if (fileMode === "assembly") {
      assemblyJson = requestResults.samples
      $("#assemblyCutOff").show()
    }

    // hide welcome modal and display the import request modal for the user
    // to select cutoffs and options associated with the type of import
    $("#welcomeModal").modal("hide")
    $("#importRequest").modal()
  }
  // else statement is not required because it is used for the default page
  // render
}
