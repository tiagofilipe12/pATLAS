const assembly = (listGi, assemblyFile, g, graphics, renderer) => {
  //console.log(assembly_json)
  // removes everything within []
  const readMode = true
  const firstObj = Object.keys(assemblyFile)[0] //TODO for now just accepts the
  // first
  // object
  console.log(assemblyFile[firstObj])
  const assemblyJson = JSON.parse(assemblyFile[firstObj])
  console.log(assemblyJson)
  // iterate through all entries in assembly file
  for (const i in assemblyJson) {
    const gi = i
    const perc = parseFloat(assemblyJson[i])
    const newPerc = rangeConverter(perc, 0.9, 1, 0, 1)  //range now is
    // limited to 0.9 the default cutoff set for mash dist
    const readColor = chroma.mix("lightsalmon", "maroon", newPerc).hex().replace("#", "0x")
    const scale = chroma.scale(["lightsalmon", "maroon"])
    palette(scale, 20, readMode)
    node_iter(g, readColor, gi, graphics, perc)
    listGiFilter.push(gi)
  }
  // control all related divs
  let showRerun = document.getElementById("Re_run")
  let showGoback = document.getElementById("go_back")
  let showDownload = document.getElementById("download_ds")
  let showTable = document.getElementById("tableShow")
  showRerun.style.display = "block"
  showGoback.style.display = "block"
  showDownload.style.display = "block"
  showTable.style.display = "block"
  renderer.run()
  return listGiFilter
}
