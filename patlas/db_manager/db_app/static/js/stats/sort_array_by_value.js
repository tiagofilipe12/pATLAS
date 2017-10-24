const arraytByValue = (startingArray) => {
  console.log("starting", startingArray)
  let arrayToObject = {}
  // first put every element into a dictionary or object to count the number
  // of occurrences.
  for (const entry in startingArray) {
    if ({}.hasOwnProperty.call(startingArray, entry)) {
      const currentEntry = startingArray[entry]
      if (!(currentEntry in arrayToObject)) {
        arrayToObject[currentEntry] = 1
      } else {
        arrayToObject[currentEntry] = arrayToObject[currentEntry] + 1
      }
    }
  }
  // then parse this object to generate a new array with the desired
  // ascending order
  console.log(arrayToObject)
}