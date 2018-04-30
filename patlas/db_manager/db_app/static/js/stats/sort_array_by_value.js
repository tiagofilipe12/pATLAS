/**
 * Function that enables to sort an array by its values and count the number
 * of occurrences of repetitive elements in array
 * @param {Array} startingArray - The array to be sorted
 * @returns {Array} finalArray - The array with the sorted entries in
 * descending order
 */
const arraytByValue = (startingArray) => {
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

  // puts every instance of this object into an array with a pair array for
  // each entry in object
  const sortable = []
  for (const x in arrayToObject ) {
    if ({}.hasOwnProperty.call(arrayToObject, x)) {
      sortable.push([x, arrayToObject[x]])
    }
  }

  // sorts array by second element in every pairs array
  sortable.sort(function(a, b) {
    return b[1] - a[1]
  })

  // then puts everything in a final array with only species
  const finalArray = []

  for (const pair in sortable) {
    if ({}.hasOwnProperty.call(sortable, pair)) {
      const speciesName = sortable[pair][0]
      const occurrences = sortable[pair][1]
      // needs to be pushed as many times as the occurrences value
      for (let i = 0; i < occurrences; i++) {
        finalArray.push(speciesName)
      }
    }
  }
  return finalArray
}