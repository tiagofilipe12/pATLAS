// controls the display of bootstrap progress bar given a total of
// iterations to be made (range) and the current iteration (X)
const progressBarControl = (x, range) => {
  // converts the value to a percentage
  // TODO there is something fishy here, after some interactions it changes from
  // TODO % to px... which is weird
  console.log("total", $("#progressBar").css("width"))
  console.log(document.getElementById("actualProgress").offsetWidth)
  const percentage = ((x * 100) / range).toFixed(0)
  console.log("percentage", percentage)
  // const widthNew = ((percentage * 0.01) * parseFloat($("#progressBar").css("width").replace("px", ""))).toFixed(0).toString() + "px"
  // console.log("width", widthNew)
  // change innerHTML for this div
  document.getElementById("actualProgress").innerHTML = percentage + "% complete"
  // change the bar shape according with the progress
  // document.getElementById("actualProgress").setAttribute("aria-valuenow", percentage.toString())
  // $("#actualProgress").attr("aria-valuenow", percentage.toString())
  // document.getElementById("actualProgress").style.width = widthNew
  $("#actualProgress").css("width", percentage + "%")
  console.log($("#actualProgress").css("width"))
}