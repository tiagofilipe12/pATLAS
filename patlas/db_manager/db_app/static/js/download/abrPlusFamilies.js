// function to turn string into a clickable link ... useful for accession
// numbers
const makeItClickable = (string) => {
  return "<a href='https://www.ncbi.nlm.nih.gov/nuccore/" +
    string + "' target='_blank'>" + string + "</a>"
}

// const googleIt = (string) => {
//   return "<a target='_blank'" +
//     " href='http://www.google.com/search?q=" + string +
//     "%20site:https://card.mcmaster.ca'>" + string + "</a>"
// }

const makeCardClickable = (string) => {
  // TODO this should be refactored to include direct card entry
  return "<a href='https://card.mcmaster.ca/aro/" +
    string.replace("ARO:", "") + "' target='_blank'>" + string + "</a>"
}

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
    const queryArrayCardARO = []

    // set of arrays for resfinder db
    const queryArrayResfinderGenes = []
    const queryArrayResfinderAccession = []
    const queryArrayResfinderCoverage = []
    const queryArrayResfinderIdentity = []
    const queryArrayResfinderRange = []

    try {
      // totalLength array corresponds to gene names
      const totalLenght = data.json_entry.gene.replace(/['u\[\] ]/g, "").split(",")
      const acessionList = data.json_entry.accession.replace(/['u\[\] ]/g, "").split(",")
      const coverageList = data.json_entry.coverage.replace(/['u\[\] ]/g, "").split(",")
      const databaseList = data.json_entry.database.replace(/['u\[\] ]/g, "").split(",")
      const identityList = data.json_entry.identity.replace(/['u\[\] ]/g, "").split(",")
      const rangeList = data.json_entry.seq_range.replace("[[", "[").replace("]]", "]").split("],")
      const aroList = data.json_entry.aro_accession.replace(/['u\[\] ]/g, "").split(",")

      // consts to control the numbering of each database entry
      let num = 0
      let num2 = 0

      for (const i in totalLenght) {
        if ({}.hasOwnProperty.call(totalLenght, i)) {
          const rangeEntry = (rangeList[i].indexOf("]") > -1) ? rangeList[i].replace(" ", "") : rangeList[i] + "]"
          if (databaseList[i].indexOf("card") > -1) {
            num = num + 1
            const numString = num.toString()
            queryArrayCardGenes.push(numString + ": " + totalLenght[i])
            // card retrieves some odd numbers after the accession... that
            // prevent to form a linkable item to genbank
            queryArrayCardAccession.push(numString + ": " +
              makeItClickable(acessionList[i].split(":")[0]))
            queryArrayCardCoverage.push(numString + ": " + coverageList[i])
            queryArrayCardIdentity.push(numString + ": " + identityList[i])
            queryArrayCardRange.push(numString + ": " + rangeEntry)
            queryArrayCardARO.push(numString + ": " +  makeCardClickable(aroList[i]))
          } else {
            num2 = num2 + 1
            const numString2 = num2.toString()
            queryArrayResfinderGenes.push(numString2 + ": " + totalLenght[i])
            queryArrayResfinderAccession.push(numString2 + ": " +
              makeItClickable(acessionList[i]))
            queryArrayResfinderCoverage.push(numString2 + ": " + coverageList[i])
            queryArrayResfinderIdentity.push(numString2 + ": " + identityList[i])
            queryArrayResfinderRange.push(numString2 + ": " + rangeEntry)
          }
        }
      }
      // then actually add it to popup_description div
      $("#popup_description").append(
        "<div style='border-top: 3px solid #4588ba; position: relative; top:" +
        " 40px; margin-bottom: 40px;'>" +
        "</div>" +
        "<div'>Card database" +
        "<br />" +
        "<font color='#468499'>Gene name: </font>" + queryArrayCardGenes.toString() +
        "<br />" +
        "<font color='#468499'>Genbank accession: </font>" + queryArrayCardAccession.toString() +
        "<br />" +
        "<font color='#468499'>ARO accessions: </font>" + queryArrayCardARO.toString() +
        "<div>Matching resistance genes information</div>" +
        "<font color='#468499'>Coverage: </font>" + queryArrayCardCoverage.toString() +
        "<br />" +
        "<font color='#468499'>Identity: </font>" + queryArrayCardIdentity.toString() +
        "<br />" +
        "<font color='#468499'>Range in plasmid: </font>" + queryArrayCardRange.toString() +
        "<br />" +
        "</div>" +
        "<div style='border-top: 3px solid #4588ba; position: relative; top:" +
        " 40px; margin-bottom: 40px;'>" +
        "</div>" +
        "<div'>ResFinder database" +
        "<br />" +
        "<font color='#468499'>Gene name: </font>" + queryArrayResfinderGenes.toString() +
        "<br />" +
        "<font color='#468499'>Genbank accession: </font>" + queryArrayResfinderAccession.toString() +
        "<div>Matching resistance genees information</div>" +
        "<font color='#468499'>Coverage: </font>" + queryArrayResfinderCoverage.toString() +
        "<br />" +
        "<font color='#468499'>Identity: </font>" + queryArrayResfinderIdentity.toString() +
        "<br />" +
        "<font color='#468499'>Range in plasmid: </font>" + queryArrayResfinderRange.toString() +
        "<br />" +
        "</div>"
      )
    } catch (error) {
      document.getElementById("alertId_db").childNodes[0].nodeValue = "Warning!" +
        " This sequence has no Resistance information available in database."
      $("#alertId_db").show()
      $("#alertClose_db").click( () => {
        $("#alertId_db").hide()  // hide this div
      })
    }

  })
  // returns false in order to tell to not duplicate the info if clicking too
  // many times in this resButton
  // popup_description sets it again to true in order to get the above code
  // again
  return false
}

const plasmidFamilyGetter = (nodeId) => {
  // here in this function there is no need to parse the
  // data.json_entry.database entry since it is a single database
  $.get("api/getplasmidfinder/", {"accession": nodeId}, (data, status) => {
    // first we need to gather all information in a format that may be
    // passed to jquery to append to popup_descriptions div
    // set of arrays for card db
    const queryArrayPFGenes = []
    const queryArrayPFAccession = []
    const queryArrayPFCoverage = []
    const queryArrayPFIdentity = []
    const queryArrayPFRange = []

    try{
      // totalLength array corresponds to gene names
      const totalLength = data.json_entry.gene.replace(/['u\[\] ]/g, "").split(",")
      const accessionList = data.json_entry.accession.replace(/['u\[\] ]/g, "").split(",")
      const coverageList = data.json_entry.coverage.replace(/['u\[\] ]/g, "").split(",")
      const identityList = data.json_entry.identity.replace(/['u\[\] ]/g, "").split(",")
      const rangeList = data.json_entry.seq_range.replace("[[", "[").replace("]]", "]").split("],")
      for (const i in totalLength) {
        if ({}.hasOwnProperty.call(totalLength, i)) {
          const num = (parseFloat(i) + 1).toString()
          const rangeEntry = (rangeList[i].indexOf("]") > -1) ? rangeList[i].replace(" ", "") : rangeList[i] + "]"
          queryArrayPFGenes.push(num + ": " + totalLength[i])
          // card retrieves some odd numbers after the accession... that
          // prevent to form a linkable item to genbank
          queryArrayPFAccession.push(num + ": " +
            makeItClickable(accessionList[i].split(":")[0]))
          queryArrayPFCoverage.push(num + ": " + coverageList[i])
          queryArrayPFIdentity.push(num + ": " + identityList[i])
          queryArrayPFRange.push(num + ": " + rangeEntry)
        }
      }
      // then actually add it to popup_description div
      $("#popup_description").append(
        "<div style='border-top: 3px solid #4588ba; position: relative; top:" +
        " 40px; margin-bottom: 40px;'>" +
        "</div>" +
        "<div'>PlasmidFinder database" +
        "<br />" +
        // TODO replace font with <span style="color:#000000">0001100000101101100011</span>
        "<font color='#468499'>Gene name: </font>" + queryArrayPFGenes.toString() +
        "<br />" +
        "<font color='#468499'>Genbank Accession: </font>" + queryArrayPFAccession.toString() +
        "<div>Matching resistance genes information</div>" +
        "<font color='#468499'>Coverage: </font>" + queryArrayPFCoverage.toString() +
        "<br />" +
        "<font color='#468499'>Identity: </font>" + queryArrayPFIdentity.toString() +
        "<br />" +
        "<font color='#468499'>Range in plasmid: </font>" + queryArrayPFRange.toString() +
        "<br />" +
        "</div>"
      )
    } catch (error) {
      document.getElementById("alertId_db").childNodes[0].nodeValue = "Warning!" +
        " This sequence has no PlasmidFinder information available in database."
      $("#alertId_db").show()
      $("#alertClose_db").click( () => {
        $("#alertId_db").hide()  // hide this div
      })
    }
  })
}