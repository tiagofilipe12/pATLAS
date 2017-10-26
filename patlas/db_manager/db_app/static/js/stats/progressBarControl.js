// controls the display of bootstrap progress bar given a total of
// iterations to be made (range) and the current iteration (X)
const progressBarControl = (x, range) => {
  // TODO there is something fishy here, after some interactions it changes from
  // TODO % to px... which is weird
  const greyBarWidth = $("#progressBar").width()
  // const greenBarWidth = $("#actualProgress").width()

  // converts percentage value to the desired range
  const percentageConversion = rangeConverter(x, 0, range, 0, greyBarWidth).toFixed(0)

  // this tries converts to a string the range conversion whether it is a
  // value in % or in px. if px it normalizes to the size of the progressBar
  // width (when empty) and if in % it just converts it to a string and adds %
  const finalPercentageConversion = ($("#progressBar").css("width").indexOf("px") > -1) ?
    ((percentageConversion / greyBarWidth) * 100).toFixed(0).toString() + "%" :
    percentageConversion.toString() + "%"

  console.log("percentage after function", finalPercentageConversion)
  // example log: percentage after function 99%

  $("#actualProgress").text(finalPercentageConversion + " complete")
  $("#actualProgress").css("width", finalPercentageConversion)

  // TODO after setting everything to a percentage above here it reports px.
  // Why?
  console.log("end", $("#actualProgress").css("width"))
  // example log: end 489.828125px
  // note that example logs are for the same iteration, In this case
  // greyBarWidth is 770px for 100%.
}