// will cancel reader when defined... so during handleFileSelect
const abortRead = (reader) => {
  console.log("canceled reading of file")
  // cancels the loading it self
  document.getElementById("file_text").value = ""
  read_json = ""
}

// function to handle ONE file at a time (per button)
// infile_id refers to the button id and text_id referes to the text form that reads the file
const handleFileSelect = (infileId, textId, callback) => {
  document.getElementById(infileId).addEventListener("change", function (e) {
    let arrayOfObj = {}
    const files = e.target.files // FileList object
    console.log("files", files)
    // append fle name to text fomr displaying current selection
    for (const file of files) {
      const fileName = file.name
      // checks if it is a json file extension
      if (!file.name.includes(".json")) {
        alert("File extension not supported. Only '.json' files are supported.")
      } else {
        // append the filename to the form
        $(textId).val(files[0].name) // TODO handle this
        // opens the instance of the reader
        const reader = new FileReader()

        reader.onload = function (f) {
          arrayOfObj[fileName] = this.result
        }

        reader.readAsText(file)
      }
    }
    console.log("arrayObj", arrayOfObj)
    callback(arrayOfObj)
  }, false)
}
