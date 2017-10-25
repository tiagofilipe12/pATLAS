// controls the display of bootstrap progress bar given a total of
// iterations to be made (range) and the current iteration (X)
const progressBarControl = (x, range) => {
  // converts the value to a percentage
  const percentage = ((x * 100) / range).toFixed(0)
  // change innerHTML for this div
  document.getElementById("actualProgress").innerHTML = percentage.toString() + "% complete"
  // change the bar shape according with the progress
  $("#actualProgress").attr("aria-valuenow", percentage.toString()).css("width", percentage.toString() + "%")
}