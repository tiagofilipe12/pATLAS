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
  for (i in urlArray) {
    window.open(urlArray[i])
  }
}


const downloadSeq = (listAcc) => {
  // TODO this function is being executed twice! WHY?
  const dbType = "nuccore"
  const exportType = "fasta"
  // used map instead of list comprehensions because the latter is not
  // available in google chrome
  const acc = listAcc.map((uniqueAcc) => {return uniqueAcc.split("_").splice(0,2).join("_")})
  // if number of sequences is less than 100
  if (acc.length <= 100) {
    // in fact there is a two variables that are not required yet for this
    // dbType and exportType but they are part of a much general function and
    // perhaps they will be useful in the future.
    const url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db" +
      "=" + dbType + "&id=" + acc.toString() + "&rettype=" + exportType + "&retmode=text"
    // opens a new window for the download
    window.open(url)
  } else { // when the number of sequences to download is more than 100
    $("#alertNCBI").show()  // hide this div
    // function for multiple download
    multiDownload(acc, dbType, exportType, fireMultipleDownloads)
    //window.setTimeout( () => { $("#alertId").hide() }, 10000)
  }
}
