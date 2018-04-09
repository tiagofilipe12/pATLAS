/*globals typeOfProject*/

const importProject = () => {

}

const exportProject = () => {

  textToExport = JSON.stringify(typeOfProject)

  let csvContent = "data:application/json;charset=utf-8," + textToExport

  const encodedUri = encodeURI(csvContent)

  const link = document.createElement("a")
  link.setAttribute("href", encodedUri)
  link.setAttribute("download", "pATLAS_project.json")
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

}