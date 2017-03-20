// function to repopulate #displayCurrentBox
idsArrays = ['p_Order', 'p_Family', 'p_Genus', 'p_Species']; //global variable
function resetDisplayTaxaBox(idsArrays){
  for (var x=0;x<idsArrays.length;x++){
    // empty field
    $('#'+idsArrays[x]).empty();
    // reset to default of html
    $('#'+idsArrays[x]).append(idsArrays[x].replace("p_","") + ": No filters applied");
    // resets the lists and checkers for the panel
    firstInstance = true;
    existingTaxon = [];
    taxaInList = [];
  }
}