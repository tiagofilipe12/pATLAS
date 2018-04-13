/* globals readFilejson */

// will cancel reader when defined... so during handleFileSelect
/**
 * Function that cancel reader, which basically deletes the file to be
 * loaded from the form
 * @return {String} - empty string to assign to file loaded file variable
 */
const abortRead = () => {
  // cancels the loading it self
  document.getElementById("file_text").value = ""
  return ""
}

// function to handle ONE file at a time (per button)
// infile_id refers to the button id and text_id referes to the text form that reads the file
/**
 * Function to handle one file at a time (per button).
 * @param {String} infileId - button id that loads the file
 * @param {String} textId - text form that reads the file id
 * @param {Function} callback - callback function to be executed after
 * reading this function, i.e., after reading all files
 */
const handleFileSelect = (infileId, textId, callback) => {
  document.getElementById(infileId).addEventListener("change", (e) => {
    let arrayOfObj = {}
    const files = e.target.files // FileList object
    // append fle name to text fomr displaying current selection
    for (const file of files) {
      const fileName = file.name
      // checks if it is a json file extension
      if (!file.name.includes(".json")) {
        alert("File extension not supported. Only '.json' files are supported.")
      } else {
        // append the filename to the form
        $(textId).val(files[0].name)
        // opens the instance of the reader
        const reader = new FileReader()

        reader.onload = function (f) {
          arrayOfObj[fileName] = this.result
        }

        reader.readAsText(file)
      }
    }
    callback(arrayOfObj)
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
