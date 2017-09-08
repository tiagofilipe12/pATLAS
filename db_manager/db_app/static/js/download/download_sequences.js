const downloadSeq = (listAcc) => {
  const dbType = "nuccore"
  const acc = [for (x of listAcc) x.split("_").splice(0,2).join("_")]  //turns
  // array of
  // accesions into a string
  console.log(acc)
  const exportType = "fasta"
  // in fact there is a two variables that are not required yet for this
  // dbType and exportType but they are part of a much general function and
  // perhaps they will be useful in the future.
  const url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db" +
"=" + dbType + "&id=" + acc + "&rettype=" + exportType + "&retmode=json&version=2.0"
  console.log(url)
  // creates an element that is triggered by the execution of the function
  const link = document.createElement("a")
  link.download = "test.fas"
  link.href = url
  document.body.appendChild(link)
  link.click()
  // removes link in the end of each function execution
  document.body.removeChild(link)
  delete link
}