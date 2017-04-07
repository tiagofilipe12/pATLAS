// will cancel reader when defined... so during handleFileSelect
function abortRead(reader) {
  console.log("canceled reading of file")  
  // cancels the loading it self
  document.getElementById("file_text").value = "";
  read_json="";
}

// function to handle ONE file at a time (per button)
function handleFileSelect(infile_id,text_id, callback) {
  console.log(infile_id)
  console.log(text_id)
  document.getElementById(infile_id).addEventListener('change', function(e){
    console.log("reading file")
    first_file=true; //bollean to check the existance of a first file
    var files = e.target.files; // FileList object
    console.log(files[0].name)
    // append fle name to text fomr displaying current selection
    
    // checks if it is a json file extension 
    if (!files[0].name.includes('.json')){
      console.log("error file is not a json")
      alert("File extension not supported. Only '.json' files are supported.");
    }
    else{
      // append the filename to the form
      $(text_id).val(files[0].name)
      //opens the instance of the reader
      var reader = new FileReader();

      reader.onload = function(f){
        read_json = callback(this.result);
      };
      
      reader.readAsText(files[0]);
    }
  }, false);
}

// function that controls checkbox
//function validate(id_string){
//  if (document.getElementById(id_string).checked && first_file==true){
//    console.log("stuff")
    // removes attribute that prevents click to open dialog
//    document.getElementById("2nd_file_dialog").removeAttribute("onclick");
//    document.getElementById("span_2ndFile").removeAttribute("disabled");
//    document.getElementById("file_text2").removeAttribute("disabled");
    //document.getElementById("span_2ndFile").disabled = false;
//  }
//  else {
//    console.log("success too");
    // adds the attribute that prevents click from opening the dialog again
//    document.getElementById("2nd_file_dialog").setAttribute("onclick","return false");
//    document.getElementById("span_2ndFile").setAttribute("disabled","disabled");
//    document.getElementById("file_text2").setAttribute("disabled","disabled");
    //document.getElementById("span_2ndFile").disabled = true;
//  }
//}