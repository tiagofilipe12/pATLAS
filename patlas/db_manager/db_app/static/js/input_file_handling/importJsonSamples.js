/**
 * load JSON file with mapping sample dictionary
 * @returns {Object} - return is an object that has as keys accessions and
 * as values coverage floats.
 */

const getArrayMapping = () => {
  return $.getJSON("/map_sample")
}

/**
 * load JSON file with mash screen sample dictionary
 * @returns {Object} - return is an object that has as keys accessions and
 * arrays with ANI and putative copy number.
 */

const getArrayMash = () => {
  return $.getJSON("/mash_sample")
}

/**
 * load JSON file with mash dist sample dictionary
 * @returns {Object} - return is an object that has as keys file names and
 * values an object with all significant links and its respective distances.
 */

const getArrayAssembly = async () => {
  const firstPromise = await $.getJSON("/ass_sample1")
  const secondPromise = await $.getJSON("/ass_sample2")
  return {
    "assembly_sample1": firstPromise,
    "assembly_sample2": secondPromise
  }
}
