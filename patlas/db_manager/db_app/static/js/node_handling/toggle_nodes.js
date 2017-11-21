const toggle_manager = (toggle_status) => {
  // TODO change this to change the behavior of this button
  // if node mode on disable dropdown and retrieve an alert whenever the dropdown is clicked in this instance
  if (toggle_status === true) {
    document.getElementById("toggle-event").className += " disabled"
    $(".dropdown-toggle").attr("data-toggle", "")
    $("#formValueId").attr("placeholder", "Search plasmid name")
  }
  // if node mode is off enables dropdown
  else {
    document.getElementById("toggle-event").className =
      document.getElementById("toggle-event").className.replace(/(?:^|\s)disabled(?!\S)/g, "")
    $(".dropdown-toggle").attr("data-toggle", "dropdown")
    $("#formValueId").attr("placeholder", "Search accession number")
  }
}

// function that iterates all nodes and when it finds a match recenters the dom
const centerToggleQuery = (g, graphics, renderer, query) => {
  g.forEachNode( (node) => {
    const nodeUI = graphics.getNodeUI(node.id)
    const sequence = node.data.sequence.split(">")[3].split("<")[0]
    // console.log(sequence)
    //nodeUI = graphics.getNodeUI(node.id)
    const x = nodeUI.position.x,
      y = nodeUI.position.y
    if (sequence === query) {
      // centers graph visualization in a given node, searching for gi
      renderer.moveTo(x, y)
    }
  })
}

// function to search plasmidnames when toggle is on
const toggleOnSearch = (g, graphics, renderer) => {
  const query = $("#formValueId").val()
  $.get("api/getplasmidname/", {"plasmid_name": query})
    .then( (results) => {
      const centerAccession = results.plasmid_id
      centerToggleQuery(g, graphics, renderer, centerAccession)
    })
}