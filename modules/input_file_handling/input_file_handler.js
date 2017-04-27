// will cancel reader when defined... so during handleFileSelect
function abortRead(reader) {
  console.log("canceled reading of file")  
  // cancels the loading it self
  document.getElementById("file_text").value = "";
  read_json="";
}

// function to handle ONE file at a time (per button)
//infile_id refers to the button id and text_id referes to the text form that reads the file
function handleFileSelect(infile_id,text_id, callback) {
  document.getElementById(infile_id).addEventListener('change', function(e){
    first_file=true; //bollean to check the existance of a first file
    var files = e.target.files; // FileList object
    // append fle name to text fomr displaying current selection
    
    // checks if it is a json file extension 
    if (!files[0].name.includes('.json')){
      alert("File extension not supported. Only '.json' files are supported.");
    }
    else{
      // append the filename to the form
      $(text_id).val(files[0].name)
      //opens the instance of the reader
      var reader = new FileReader();

      reader.onload = function(f){
        callback(this.result);
      };

      reader.readAsText(files[0]);
    }
  }, false);
}