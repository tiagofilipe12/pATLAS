/* globals Mousetrap, initCallback */

// keyboard shortcuts using mousetrap.min.js from https://craig.is/killing/mice//

/**
 * function for keyboard shortcut to save file with node positions
 * This is only useful if devel is true and should be disabled by default
 * for users
 */
Mousetrap.bind("shift+ctrl+space", () => {
  console.log("coco")
  initCallback(g, layout, devel)
})

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
