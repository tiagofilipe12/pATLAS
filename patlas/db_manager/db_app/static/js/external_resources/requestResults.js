/*globals assemblyJson, mashJson, readFilejson*/

/**
 * Function that parses the results coming from external requests. If the
 * variable passed to this function is a JSON object then it will render a
 * proper visualization of the results. If that is not the case it will not
 * render results but a pATLAS instance
 *
 * @param {Object} request_results - The JSON object that is send by the
 * database to the current URL
 */
const parseRequestResults = (request_results) => {
  // this parsing assumes that the 'type' and 'samples' keys are present in
  // request_results, which is handled by the `show_highlighted_results` view
  if (request_results) {
    $("#requestModalShow").removeAttr("disabled")
    fileMode = request_results.type

    if (fileMode === "mapping") {
      readFilejson = request_results.samples
      $("#mappingCutOff").show()
    } else if (fileMode === "mash_screen") {
      mashJson = request_results.samples
      $("#mashScreenCutOff").show()
    } else if (fileMode === "assembly") {
      assemblyJson = request_results.samples
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