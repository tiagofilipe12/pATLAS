const Resize = (e) => {

  const setMaxHeight = ($("#colorLegend .panel .panel-body").innerHeight() >=
    $("#couve-flor").height() * 0.9) ?
    "90%" :
    $("#colorLegend .panel .panel-body").innerHeight() +
    $("#colorLegend .panel .panel-heading").height()

  $("#colorLegend").css("max-height", setMaxHeight)
  $("#colorLegend").css("width", ($("#colorLegend").width() - e.clientX + $("#colorLegend").offset().left) + "px")
    .css("height", ($("#colorLegend").height() - e.clientY + $("#colorLegend").offset().top) + "px")
}
const stopResize = (e) => {
  window.removeEventListener("mousemove", Resize, false)
  window.removeEventListener("mouseup", stopResize, false)
}

const initResize = (e) => {
  window.addEventListener("mousemove", Resize, false)
  window.addEventListener("mouseup", stopResize, false)
}