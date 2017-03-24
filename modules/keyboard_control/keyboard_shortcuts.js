// keyboard shortcuts using mousetrap.min.js from https://craig.is/killing/mice//

// keyboard shortcut for length filter
Mousetrap.bind("shift+l", function(e){
  document.getElementById('length_filter').click();
});

// keyboard shortcut for taxa filter
Mousetrap.bind("shift+t", function(e){
  document.getElementById('taxa_filter').click();
});

// keyboard shortcut for taxa filter
Mousetrap.bind("shift+i", function(e){
  document.getElementById('reads_filter').click();
});

// keyboard shortcut for play/pause rendering
Mousetrap.bind("shift+p", function(e){
  $('#playpauseButton').click();
});

// keyboard shortcut for reset all filters
Mousetrap.bind("shift+r", function(e){
  $('#reset-sliders').click();
});