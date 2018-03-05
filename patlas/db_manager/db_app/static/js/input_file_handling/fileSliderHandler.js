/* globals readColoring, fileChecks */

// function to slide to right
/**
 * Function to slide files to rightmost file in array
 * @param readJson
 * @param readIndex
 * @param g
 * @param listGi
 * @param graphics
 * @param renderer
 * @returns {*[]}
 */
const slideToRight = (readJson, readIndex, g, listGi, graphics, renderer) => {
  if (readIndex < Object.values(readJson).length || readIndex > 0) {
    // if readIndex is max value already then return to 0 to allow cycling
    (readIndex !== Object.values(readJson).length - 1) ?
    readIndex += 1 : readIndex = 0
    // change div containing naming of the file
    $("#fileNameDiv").html(Object.keys(readJson)[readIndex])
    const nextFile = JSON.parse(Object.values(readJson)[readIndex])
    fileChecks(nextFile)
    const listGiFilter = readColoring(g, listGi, graphics, renderer, nextFile)
    return [readIndex, listGiFilter]
  }
}
// function to slide to left
const slideToLeft = (readJson, readIndex, g, listGi, graphics, renderer) => {
  if (readIndex < Object.values(readJson).length || readIndex > 0) {
    // if readIndex is 0 then it should get the max value possible to allow
    // cycling
    (readIndex !== 0) ?
      readIndex -= 1 : readIndex = Object.values(readJson).length - 1
    // change div containing naming of the file
    $("#fileNameDiv").html(Object.keys(readJson)[readIndex])
    const nextFile = JSON.parse(Object.values(readJson)[readIndex])
    fileChecks(nextFile)
    const listGiFilter = readColoring(g, listGi, graphics, renderer, nextFile)
    return [readIndex, listGiFilter]
  }
}