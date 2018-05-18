/* globals readFilejson */

// will cancel reader when defined... so during handleFileSelect
/**
 * Function that cancel reader, which basically deletes the file to be
 * loaded from the form
 * @param {String} divToClean - the div that needs to be emptied
 * @return {String} - empty string to assign to file loaded file variable
 */
const abortRead = (divToClean) => {
  // cancels the loading it self
  document.getElementById(divToClean).value = ""
  return ""
}


/**
 * Function that promisifies the return of the object with all file names as keys
 * and file text entries as string
 * @param {Array} files - An array with the names of all files
 * @param {String} textId - the input element that will load the files.
 * @returns {Promise<{}>} - A promise which results contain the arrayOfObj
 * variable containing the dictionary of key as file names and values as
 * the text entries within the files.
 */
const loadFilesToObj = async (files, textId) => {

  let arrayOfObj = {}

  // append fle name to text form displaying current selection
  for (const file of files) {
    const fileName = file.name
    // checks if it is a json file extension
    if (!file.name.includes(".json")) {
      alert("File extension not supported. Only '.json' files are supported.")
    } else {
      // append the filename to the form
      if (files.length > 1) {
        $(textId).val(`${files.length.toString()} files imported`)
      } else {
        $(textId).val(file.name)
      }
      // opens the instance of the reader
      const reader = new FileReader()

      reader.onload = await function (f) {
        arrayOfObj[fileName] = this.result
      }

      await reader.readAsText(file)

    }
  }

  return arrayOfObj

}


/**
 * Function to handle one file at a time (per button).
 * @param {String} infileId - button id that loads the file
 * @param {String} textId - text form that reads the file id
 * @param {Function} callback - callback function to be executed after
 * reading this function, i.e., after reading all files
 */
const handleFileSelect = (infileId, textId, callback) => {
  document.getElementById(infileId).addEventListener("change", (e) => {

    const files = e.target.files // FileList object

    loadFilesToObj(files, textId).then( (results) => { callback(results) })

  }, false)
}


/**
 * Function to check if jsonObj is empty and warn the user for which entries
 * might be empty upon loading.
 * @param {Object} jsonObj - The object that collects all json files imported
 */
const fileChecks = (jsonObj) => {
  // raise a warning if no files were added
  if (jsonObj === false) {
    $("#alertId_noFiles").show()
  } else {
    // checks if there are any empty file
    if (Object.keys(jsonObj).length === 0 && jsonObj.constructor === Object) {
      $("#alertJsonFileText").html("<strong>Error!</strong> Current selected JSON" +
        " file is empty. No plasmids will be highlighted")
      $("#alertJsonFile").show()
    }
  }
}
