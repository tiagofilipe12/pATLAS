/**
 * Small event that controls the opening of the side menu
 */
$("#menu-toggle").click( (e) => {
  e.preventDefault()
  $("#wrapper").toggleClass("toggled")
})
