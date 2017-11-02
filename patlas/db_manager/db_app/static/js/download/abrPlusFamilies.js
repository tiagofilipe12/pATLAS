// this function is intended to use in single query instances such as
// popup_description button
const resGetter = (nodeId) => {
  $.get("api/getresistances/", {"accession": nodeId}, (data, status) => {
    // first we need to gather all information in a format that may be
    // passed to jquery to append to popup_descriptions div
    // set of arrays for card db
    const queryArrayCardGenes = []
    const queryArrayCardAccession = []
    const queryArrayCardCoverage = []
    const queryArrayCardIdentity = []
    const queryArrayCardRange = []

    // set of arrays for resfinder db
    const queryArrayResfinderGenes = []
    const queryArrayResfinderAccession = []
    const queryArrayResfinderCoverage = []
    const queryArrayResfinderIdentity = []
    const queryArrayResfinderRange = []

    // totalLength array corresponds to gene names
    const totalLenght = data.json_entry.gene.replace(/['u\[\] ]/g, '').split(',')
    const acessionList = data.json_entry.accession.replace(/['u\[\] ]/g, '').split(',')
    const coverageList = data.json_entry.coverage.replace(/['u\[\] ]/g, '').split(',')
    const databaseList = data.json_entry.database.replace(/['u\[\] ]/g, '').split(',')
    const identityList = data.json_entry.identity.replace(/['u\[\] ]/g, '').split(',')
    const rangeList = data.json_entry.seq_range.replace("[[", "[").replace("]]", "]").split("],")
    for (let i in totalLenght) {
      const num = (parseFloat(i) + 1).toString()
      const rangeEntry = (rangeList[i].indexOf("]") > -1) ? rangeList[i].replace(" ", "") : rangeList[i] + "]"
      console.log(totalLenght[i], acessionList[i], coverageList[i], databaseList[i], identityList[i], rangeEntry)
      if (databaseList[i].indexOf("card") > -1) {
        queryArrayCardGenes.push(num + ": " + totalLenght[i])
        queryArrayCardAccession.push(num + ": " + acessionList[i])
        queryArrayCardCoverage.push(num + ": " + coverageList[i])
        queryArrayCardIdentity.push(num + ": " + identityList[i])
        queryArrayCardRange.push(num + ": " + rangeEntry)
      } else if (databaseList[i].indexOf("resfinder") > -1) {
        queryArrayResfinderGenes.push(num + ": " + totalLenght[i])
        queryArrayResfinderAccession.push(num + ": " + acessionList[i])
        queryArrayResfinderCoverage.push(num + ": " + coverageList[i])
        queryArrayResfinderIdentity.push(num + ": " + identityList[i])
        queryArrayResfinderRange.push(num + ": " + rangeEntry)
      } else {
        console.log("error: database unknown - ", databaseList[i])
      }
    }
    // then actually add it to popup_description div
    $("#popup_description").append(
       "<div style='border-top: 3px solid #4588ba; position: relative; top:" +
      " 40px; margin-bottom: 40px;'>" +
      "</div>" +
      //"<div>" +
      //"<br />" +
      "<div'>Card database" +
      "<br />" +
      "<font color='#468499'>gene: </font>" + queryArrayCardGenes.toString() +
      "<br />" +
      "<font color='#468499'>accession: </font>" + queryArrayCardAccession.toString() +
      "<div>Matching resistance genees information</div>" +
      "<font color='#468499'>coverage: </font>" + queryArrayCardCoverage.toString() +
      "<br />" +
      "<font color='#468499'>identity: </font>" + queryArrayCardIdentity.toString() +
      "<br />" +
      "<font color='#468499'>range: </font>" + queryArrayCardRange.toString() +
      "<br />" +
      "</div>" //+
      // "<div>Resfinder database" +
      // "<br />" +
      // "<font color='#468499'>Species: </font>" + speciesName +
      // "<br />" +
      // "</div>"

    )
  })
  // returns false in order to tell to not duplicate the info if clicking too
  // many times in this resButton
  // popup_description sets it again to true in order to get the above code
  // again
  return false
}