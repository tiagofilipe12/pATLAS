/*globals */

/**
 * A function to save files to output
 * @param {String} fileName - the string that will be the file name
 * @param {String} typeOfFile - The type of data to be saved. It can be for
 * example "data:application/json;charset=utf-8" or "text/plain;charset=utf-8"
 * @param {Array} textToExport - The array of elements to be saved to file
 */
const fileDownloader = (fileName, typeOfFile, textToExport) => {

  console.log(typeOfFile, textToExport)

  const file = new Blob(textToExport, {type: textToExport})

  FileSaver.saveAs(file, fileName)
}

const importProject = () => {
  // TODO add function to control import
}