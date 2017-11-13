const assembly = (listGi, assemblyJson, g, graphics, renderer) => {
  //console.log(assembly_json)
  // removes everything within []
  const assemblyString = assemblyJson.replace(/[{}"[ ]/g, "").split("],")
  // this gets the contig name
  const contigName = assemblyString[0].split(":")[0]
  g.addNode(contigName, {sequence: "<font color='#468499'>seq_id: </font>"
    + contigName, log_length: 10} )
  // change the color of the input node
  const nodeUI = graphics.getNodeUI(contigName)
  nodeUI.color = 0xff2100
  //console.log(contigName)
  //console.log(assemblyString)
  for (let string in assemblyString) {
    //if (string === 0) {
    //  const nodeEntry = assemblyString[string].split(':')[1]
    //} else {
    //  const nodeEntry = assemblyString[string]
    //}
    // redefinition of the above if statement
    const nodeEntry = (string === 0) ?  assemblyString[string].split(":")[1]
      : assemblyString[string]
    let accession = nodeEntry.split("_").slice(0, 2).join("_")
    const dist = nodeEntry.split(',')[1]
    if (accession in listGi) {
      g.addLink(contigName, accession, dist)
    } else {
      // links wont work because ncbi uses gis and not accessions
      g.addNode(accession, {sequence: "<font color='#468499'>seq_id: </font><a " +
      // accession has no version
      "href='https://www.ncbi.nlm.nih.gov/nuccore/" + accession + "' target='_blank'>" + accession + '</a>',
        log_length: 10
        // percentage: "<font color='#468499'>percentage: </font>" + perc
      })
      g.addLink(contigName, accession, dist)
      listGi.push(accession)
    }
  }
  // control all related divs
  let showRerun = document.getElementById("Re_run")
  let showGoback = document.getElementById("go_back")
  let showDownload = document.getElementById("download_ds")
  showRerun.style.display = "block"
  showGoback.style.display = "block"
  showDownload.style.display = "block"
  renderer.run()
}
