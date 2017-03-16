function toggle_manager(toggle_status){
  console.log(toggle_status)
  //if node mode on disable dropdown and retrieve an alert whenever the dropdown is clicked in this instance
  if (toggle_status == true){
    document.getElementById("filter_dropdown").className += " disabled";
    $('.dropdown-toggle').attr('data-toggle','');
    $('#filter_dropdown').click(function(event){
      $('#alertId_node').show();
        // control the alertClose_node button
      $('#alertClose_node').click(function() {
        $('#alertId_node').hide();  // hide this div
      });
        // closes alert after 5 secs
      window.setTimeout(function() { $("#alertId_node").hide(); }, 5000);
    });    
  }
  // if node mode is off enables dropdown
  else{
  	// needed to control the click function of the button and the trigger of the alert
  	$('#filter_dropdown').click(function(event){
  		$('#alertId_node').hide();
  	});
    document.getElementById("filter_dropdown").className=document.getElementById("filter_dropdown").className.replace( /(?:^|\s)disabled(?!\S)/g , '' );
    $('.dropdown-toggle').attr('data-toggle','dropdown');
  }
}

