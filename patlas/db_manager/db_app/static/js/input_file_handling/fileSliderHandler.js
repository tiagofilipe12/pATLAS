// function to slide to right
const slideToRight = (read_json, readIndex, g, list_gi, graphics, renderer) => {
  if (readIndex < Object.values(read_json).length || readIndex > 0) {
    // if readIndex is max value already then return to 0 to allow cycling
    (readIndex !== Object.values(read_json).length - 1) ?
    readIndex += 1 : readIndex = 0
    const nextFile = JSON.parse(Object.values(read_json)[readIndex])
    readColoring(g, list_gi, graphics, renderer, nextFile)
  }
  return readIndex
}

const slideToLeft = (read_json, readIndex, g, list_gi, graphics, renderer) => {
  if (readIndex < Object.values(read_json).length || readIndex > 0) {
    // if readIndex is 0 then it should get the max value possible to allow
    // cycling
    (readIndex !== 0) ?
      readIndex -= 1 : readIndex = Object.values(read_json).length - 1
    const nextFile = JSON.parse(Object.values(read_json)[readIndex])
    readColoring(g, list_gi, graphics, renderer, nextFile)
  }
  return readIndex
}