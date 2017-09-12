// this is a sketch of an hash function
// here it is used to match toId and fromId accessions for links in order to
// avoid the duplication of links.

const hashCode = (string) => {
  let hash = 0
  if (string.length === 0) return hash
  for (i = 0; i < string.length; i++) {
    char = string.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash
}

//takes two strings to make an hash that results in the sum of their hashes
// values may be negative... doesn't matter
// example string1 == node and string2 == linkedNode
const makeHash = (string1, string2) => {
  const final = hashCode(string1) + hashCode(string2)
  return final
}