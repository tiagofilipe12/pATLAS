const multiDownload = (acc, dbType, exportType, cb) => {
  const link = document.createElement("a")
  link.style.display = "none"
  let urlArray = []
  while (acc.length > 0) {
    const chunk = acc.splice(0, 100)
    const url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db" +
      "=" + dbType + "&id=" + chunk.toString() + "&rettype=" + exportType + "&retmode=text"
    //console.log(url)
    urlArray.push(url)
  }
  cb(urlArray)
}

const fireMultipleDownloads = (urlArray) => {
  for (let i in urlArray) {
    window.open(urlArray[i])
  }
}

// function that handles if multiple outputs or a single output is generated
const downloadTypeHandler = (accList) => {
  const dbType = "nuccore"
  const exportType = "fasta"
  if (accList.length <= 100) {
    // in fact there is a two variables that are not required yet for this
    // dbType and exportType but they are part of a much general function and
    // perhaps they will be useful in the future.
    const url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db" +
      "=" + dbType + "&id=" + accList.toString() + "&rettype=" + exportType + "&retmode=text"
    // opens a new window for the download
    window.open(url)
  } else { // when the number of sequences to download is more than 100
    $("#alertNCBI").show()  // hide this div
    // function for multiple download
    multiDownload(accList, dbType, exportType, fireMultipleDownloads)
    //window.setTimeout( () => { $("#alertId").hide() }, 10000)
  }
}

// this just downloads the selected sequences
const downloadSeq = (listAcc) => {
  // used map instead of list comprehensions because the latter is not
  // available in google chrome
  const acc = listAcc.map((uniqueAcc) => {return uniqueAcc.split("_").splice(0,2).join("_")})
  // function that handles if multiple outputs or a single output is generated
  downloadTypeHandler(acc)
}

const downloadSeqByColor = (g, graphics) => {
  let tempListAccessions = []
  g.forEachNode(function (node) {
    const currentNodeUI = graphics.getNodeUI(node.id)
    if (currentNodeUI.color === 0xFFA500ff) { tempListAccessions.push(node.id.split("_").splice(0,2).join("_")) }
  })
  // function that handles if multiple outputs or a single output is generated
  downloadTypeHandler(tempListAccessions)
}
