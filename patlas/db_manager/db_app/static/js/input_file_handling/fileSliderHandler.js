// function to slide to right
const slideToRight = (read_json, readIndex) => {
  console.log(read_json)
  if (readIndex < JSON.parse(Object.values(read_json).length || readIndex > 0)) {
    readIndex += 1
    const nextFile = JSON.parse(Object.values(read_json)[readIndex])
  }
  return readIndex
}

const slideToLeft = (read_json, readIndex) => {
  console.log(read_json, JSON.parse(Object.values(read_json).length))
  if (readIndex < JSON.parse(Object.values(read_json).length || readIndex > 0)) {
    readIndex -= 1
    const nextFile = JSON.parse(Object.values(read_json)[readIndex])
  }
  return readIndex
}