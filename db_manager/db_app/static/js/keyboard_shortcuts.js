// keyboard shortcuts using mousetrap.min.js from https://craig.is/killing/mice//

// keyboard shortcut for length filter
Mousetrap.bind("shift+l", () => {
  document.getElementById("length_filter").click()
})

// keyboard shortcut for taxa filter
Mousetrap.bind("shift+t", () => {
  document.getElementById("taxa_filter").click()
})

// keyboard shortcut for taxa filter
Mousetrap.bind("shift+d", () => {
  document.getElementById("distances_filter").click()
})

// keyboard shortcut for taxa filter
Mousetrap.bind("shift+i", () => {
  document.getElementById("reads_filter").click()
})

// keyboard shortcut for play/pause rendering
Mousetrap.bind("shift+p", () => {
  document.getElementById("playpauseButton").click()
})

// keyboard shortcut for reset all filters
Mousetrap.bind("shift+r", () => {
  document.getElementById("reset-sliders").click()
})
