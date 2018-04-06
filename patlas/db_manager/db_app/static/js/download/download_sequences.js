/**
 * Function to handle multiple downloads and split download files into
 * several files. This function is only triggered if download sequences are
 * more than 100. This was a wrapper to avoid rejection from NCBI when
 * queries are too big (>100).
 * @param {Array} acc - an array that has all the accessions to download
 * from NCBI
 * @param {string} dbType - string with the database type to query in NCBI
 * eutils. E.g. "nuccore"
 * @param {string} exportType - string with the type of export to made. E.g.
 * "fasta"
 */
const multiDownload = (acc, dbType, exportType) => {

  const link = document.createElement("a")
  link.style.display = "none"
  const chunk = acc.splice(0, 100)
  const url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db" +
    "=" + dbType + "&id=" + chunk.toString() + "&rettype=" + exportType + "&retmode=text"

  // link.setAttribute("download", "patlas_download.txt")
  link.href = url
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // since NCBI efetch is rejecting multiple queries at the same time
  setTimeout( () => {
    if (acc.length > 0) {
      multiDownload(acc, dbType, exportType)
    }
  }, 4000)
}

/**
 * function that handles if multiple outputs or a single output is generated
 * @param {Array} accList - an array of all the accessions to be downloaded
 */
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
    multiDownload(accList, dbType, exportType)
    //window.setTimeout( () => { $("#alertId").hide() }, 10000)
  }
}

/**
 * this just downloads the selected sequences
 * @param {Array} listAcc - an array of all the accession number to be
 * downloaded
 */
const downloadSeq = (listAcc) => {
  // used map instead of list comprehensions because the latter is not
  // available in google chrome
  const acc = listAcc.map((uniqueAcc) => {
    return uniqueAcc.split("_").splice(0,2).join("_")
  })
  // function that handles if multiple outputs or a single output is generated
  downloadTypeHandler(acc)
}

/**
 * A function that allow to get all the accesion numbers to be downloaded
 * from colors of the nodes (green)
 * @param {Object} g - vivagraph graph object that stores functions for graph
 * @param {Object} graphics - vivagraph graphics functions
 */
const downloadSeqByColor = (g, graphics) => {
  let tempListAccessions = []
  g.forEachNode( (node) => {
    const currentNodeUI = graphics.getNodeUI(node.id)
    if (currentNodeUI.color === "0x" + "#fa5e00".replace("#", "")) {
      tempListAccessions.push(node.id.split("_").splice(0,2).join("_"))
    }
  })
  // function that handles if multiple outputs or a single output is generated
  downloadTypeHandler(tempListAccessions)
}
