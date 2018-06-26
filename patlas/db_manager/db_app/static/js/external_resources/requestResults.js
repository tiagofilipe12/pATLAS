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
  if (request_results) {
    fileMode = request_results.fileType

    if (fileMode === "mapping") {
      readFilejson = request_results.files
    }
    // TODO add fileMode for the other imports

    $("#welcomeModal").modal("hide")
    $("#redundancyModal").modal()

  }
  // else {
  //   console.log("no requested results")
  //   return false
  // }
}