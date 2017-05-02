function assembly (assembly_json, g, graphics, renderer) {
  console.log(assembly_json)
    // removes everything within []
  var assemblyString = assembly_json.replace(/[{}"[ ]/g, '').split('],')
    // this gets the contig name
  contig_name = assemblyString[0].split(':')[0]
  g.addNode(contig_name, {sequence: "<font color='#468499'>seq_id: </font>" + contig_name, log_length: 10}
                      )
  // change the color of the input node
  var nodeUI = graphics.getNodeUI(contig_name)
  nodeUI.color = 0xff2100
  console.log(contig_name)
  console.log(assemblyString)
  for (string in assemblyString) {
    if (string == 0) {
      node_entry = assemblyString[string].split(':')[1]
    } else {
      node_entry = assemblyString[string]
    }
    var accession = node_entry.split('_').slice(0, 2).join('_')
    var dist = node_entry.split(',')[1]
    console.log(accession)
    g.addLink(contig_name, accession, dist)
  }
  // control all related divs
  showRerun = document.getElementById('Re_run')
  showGoback = document.getElementById('go_back')
  showDownload = document.getElementById('download_ds')
  showRerun.style.display = 'block'
  showGoback.style.display = 'block'
  showDownload.style.display = 'block'
  renderer.run()
}
