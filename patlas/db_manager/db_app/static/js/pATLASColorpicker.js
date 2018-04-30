/**
 * This function sets the color in the input form available in sizeRatio and
 * sharedHashes modals. By default the color is the same but other color may be
 * set by the user.
 */
$(function () {
  $("#cp4, #cp5").colorpicker({
    color: "#a85713",
    format: "hex"
  })
})
