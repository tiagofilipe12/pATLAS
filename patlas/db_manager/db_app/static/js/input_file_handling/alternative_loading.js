/**
 * Function that triggers the alternative loading
 */
const alternativeLoading = () => {
  $("#loading-image").click(function (e) {
    $("#loading-image").hide()
    $("#loading-image-alt").show()
  })
}
