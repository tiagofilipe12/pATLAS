/**
 * This function generated an hash for a given string
 * @param {String} string
 * @returns {number} - hash
 */
const hashCode = (string) => {
  let hash = 0
  if (string.length === 0) {return hash}
  for (let i = 0; i < string.length; i++) {
    const char = string.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash
}

/**
 * This function takes two strings to make an hash that results in the
 * multiplication of
 * their hashes. Values may be negative. example string1 == node and
 * string2 == linkedNode. This is used to avoid the addition of duplicated links
 * @param {String} string1 - an accession number
 * @param {String} string2 - another accession number
 * @returns {number} - hashed value
 */
const makeHash = (string1, string2) => {
  const final = hashCode(string1) * hashCode(string2)
  return final
}