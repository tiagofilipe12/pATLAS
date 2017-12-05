// function to slide to right
const slideToRight = (readJson, readIndex, g, list_gi, graphics, renderer) => {
  if (readIndex < Object.values(readJson).length || readIndex > 0) {
    // if readIndex is max value already then return to 0 to allow cycling
    (readIndex !== Object.values(readJson).length - 1) ?
    readIndex += 1 : readIndex = 0
    // change div containing naming of the file
    $("#fileNameDiv").html(Object.keys(readJson)[readIndex])
    const nextFile = JSON.parse(Object.values(readJson)[readIndex])
    const listGiFilter = readColoring(g, list_gi, graphics, renderer, nextFile)
    return [readIndex, listGiFilter]
  }
}
// function to slide to left
const slideToLeft = (readJson, readIndex, g, list_gi, graphics, renderer) => {
  if (readIndex < Object.values(readJson).length || readIndex > 0) {
    // if readIndex is 0 then it should get the max value possible to allow
    // cycling
    (readIndex !== 0) ?
      readIndex -= 1 : readIndex = Object.values(readJson).length - 1
    // change div containing naming of the file
    $("#fileNameDiv").html(Object.keys(readJson)[readIndex])
    const nextFile = JSON.parse(Object.values(readJson)[readIndex])
    const listGiFilter = readColoring(g, list_gi, graphics, renderer, nextFile)
    return [readIndex, listGiFilter]
  }
}