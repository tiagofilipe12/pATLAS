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

const resPopupPopulate = (queryArrayCardGenes, queryArrayCardAccession,
                          queryArrayCardARO, queryArrayCardCoverage,
                          queryArrayCardIdentity, queryArrayCardRange,
                          queryArrayResfinderGenes, queryArrayResfinderAccession,
                          queryArrayResfinderCoverage, queryArrayResfinderIdentity,
                          queryArrayResfinderRange) => {
  $("#cardGenePopSpan").html(queryArrayCardGenes.toString().replace(/["]+/g, ""))
  $("#cardGenbankPopSpan").html(queryArrayCardAccession.toString())
  $("#cardAroPopSpan").html(queryArrayCardARO.toString())
  $("#cardCoveragePopSpan").html(queryArrayCardCoverage.toString())
  $("#cardIdPopSpan").html(queryArrayCardIdentity.toString())
  $("#cardRangePopSpan").html(queryArrayCardRange.toString())

  $("#resfinderGenePopSpan").html(queryArrayResfinderGenes.toString().replace(/["]+/g, ""))
  $("#resfinderGenbankPopSpan").html(queryArrayResfinderAccession.toString())
  $("#resfinderCoveragePopSpan").html(queryArrayResfinderCoverage.toString())
  $("#resfinderIdPopSpan").html(queryArrayResfinderIdentity.toString())
  $("#resfinderRangePopSpan").html(queryArrayResfinderRange.toString())
}

// this function is intended to use in single query instances such as
// popup_description button
const resGetter = (nodeId) => {
  $.post("api/getresistances/", {"accession": JSON.stringify([nodeId])}, (data, status) => {
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
      const totalLenght = data[0].json_entry.gene.replace(/['u\[\] ]/g, "").split(",")
      const acessionList = data[0].json_entry.accession.replace(/['u\[\] ]/g, "").split(",")
      const coverageList = data[0].json_entry.coverage.replace(/['u\[\] ]/g, "").split(",")
      const databaseList = data[0].json_entry.database.replace(/['u\[\] ]/g, "").split(",")
      const identityList = data[0].json_entry.identity.replace(/['u\[\] ]/g, "").split(",")
      const rangeList = data[0].json_entry.seq_range.replace("[[", "[").replace("]]", "]").split("],")
      const aroList = data[0].json_entry.aro_accession.replace(/['u\[\] ]/g, "").split(",")

      // variables to control the numbering of each database entry
      let num = 0
      let num2 = 0

      for (const i in totalLenght) {
        if ({}.hasOwnProperty.call(totalLenght, i)) {
          const rangeEntry = (rangeList[i].indexOf("]") > -1) ?
            rangeList[i].replace(" ", "").replace(", ", ":") :
            (rangeList[i] + "]").replace(", ", ":")
          if (databaseList[i].indexOf("card") > -1) {
            num = num + 1
            const numString = num.toString()
            queryArrayCardGenes.push(" " + numString + ": " + totalLenght[i])
            // card retrieves some odd numbers after the accession... that
            // prevent to form a linkable item to genbank
            queryArrayCardAccession.push(" " + numString + ": " +
              makeItClickable(acessionList[i].split(":")[0]))
            queryArrayCardCoverage.push(" " + numString + ": " + coverageList[i])
            queryArrayCardIdentity.push(" " + numString + ": " + identityList[i])
            queryArrayCardRange.push(" " + numString + ": " + rangeEntry)
            queryArrayCardARO.push(" " + numString + ": " +  makeCardClickable(aroList[i]))
          } else {
            num2 = num2 + 1
            const numString2 = num2.toString()
            queryArrayResfinderGenes.push(" " + numString2 + ": " + totalLenght[i])
            queryArrayResfinderAccession.push(" " + numString2 + ": " +
              makeItClickable(acessionList[i]))
            queryArrayResfinderCoverage.push(" " + numString2 + ": " + coverageList[i])
            queryArrayResfinderIdentity.push(" " + numString2 + ": " + identityList[i])
            queryArrayResfinderRange.push(" " + numString2 + ": " + rangeEntry)
          }
        }
      }
      // then actually add it to popup_description div
      resPopupPopulate(queryArrayCardGenes, queryArrayCardAccession,
        queryArrayCardARO, queryArrayCardCoverage,
        queryArrayCardIdentity, queryArrayCardRange,
        queryArrayResfinderGenes, queryArrayResfinderAccession,
        queryArrayResfinderCoverage, queryArrayResfinderIdentity,
        queryArrayResfinderRange)
    } catch (error) {
      document.getElementById("alertId_db").childNodes[0].nodeValue = "Warning!" +
        " This sequence has no Resistance information available in database."
      $("#alertId_db").show()
      $("#alertClose_db").click( () => {
        $("#alertId_db").hide()  // hide this div
      })
      resPopupPopulate("N/A", "N/A", "N/A", "N/A", "N/A", "N/A", "N/A", "N/A",
        "N/A", "N/A", "N/A")
      // hides the div after 5 seconds
      window.setTimeout( () => { $("#alertId_db").hide() }, 5000)
    }

  })
  // returns false in order to tell to not duplicate the info if clicking too
  // many times in this resButton
  // popup_description sets it again to true in order to get the above code
  // again
  return false
}

const pfPopupPopulate = (queryArrayPFGenes, queryArrayPFAccession,
                         queryArrayPFCoverage, queryArrayPFIdentity,
                         queryArrayPFRange) => {

  $("#pfGenePopSpan").html(queryArrayPFGenes.toString().replace(/["]+/g, ""))
  $("#pfGenbankPopSpan").html(queryArrayPFAccession.toString())
  $("#pfCoveragePopSpan").html(queryArrayPFCoverage.toString())
  $("#pfIdentityPopSpan").html(queryArrayPFIdentity.toString())
  $("#pfRangePopSpan").html(queryArrayPFRange.toString())
}

const plasmidFamilyGetter = (nodeId) => {
  // here in this function there is no need to parse the
  // data.json_entry.database entry since it is a single database
  $.post("api/getplasmidfinder/", {"accession": JSON.stringify([nodeId])}, (data, status) => {
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
      const totalLength = data[0].json_entry.gene.replace(/['u\[\] ]/g, "").split(",")
      const accessionList = data[0].json_entry.accession.replace(/['u\[\] ]/g, "").split(",")
      const coverageList = data[0].json_entry.coverage.replace(/['u\[\] ]/g, "").split(",")
      const identityList = data[0].json_entry.identity.replace(/['u\[\] ]/g, "").split(",")
      const rangeList = data[0].json_entry.seq_range.replace("[[", "[").replace("]]", "]").split("],")
      for (const i in totalLength) {
        if ({}.hasOwnProperty.call(totalLength, i)) {
          const num = (parseFloat(i) + 1).toString()
          const rangeEntry = (rangeList[i].indexOf("]") > -1) ?
            rangeList[i].replace(" ", "").replace(",", ":") :
            (rangeList[i] + "]").replace(", ", ":")
          queryArrayPFGenes.push(" " + num + ": " + totalLength[i])
          // card retrieves some odd numbers after the accession... that
          // prevent to form a linkable item to genbank
          queryArrayPFAccession.push(" " + num + ": " +
            makeItClickable(accessionList[i].split(":")[0]))
          queryArrayPFCoverage.push(" " + num + ": " + coverageList[i])
          queryArrayPFIdentity.push(" " + num + ": " + identityList[i])
          queryArrayPFRange.push(" " + num + ": " + rangeEntry)
        }
      }
      // then actually add it to popup_description div
      pfPopupPopulate(queryArrayPFGenes, queryArrayPFAccession,
        queryArrayPFCoverage, queryArrayPFIdentity, queryArrayPFRange)
    } catch (error) {
      document.getElementById("alertId_db").childNodes[0].nodeValue = "Warning!" +
        " This sequence has no PlasmidFinder information available in database."
      $("#alertId_db").show()
      $("#alertClose_db").click( () => {
        $("#alertId_db").hide()  // hide this div
      })
      pfPopupPopulate("N/A", "N/A", "N/A", "N/A", "N/A")
      // hides the div after 5 seconds
      window.setTimeout( () => { $("#alertId_db").hide() }, 5000)
    }
  })
}

const virPopupPopulate = (queryArrayVirGenes, queryArrayVirAccession,
                         queryArrayVirCoverage, queryArrayVirIdentity,
                         queryArrayVirRange) => {

  $("#virGenePopSpan").html(queryArrayVirGenes.toString().replace(/["]+/g, ""))
  $("#virGenbankPopSpan").html(queryArrayVirAccession.toString())
  $("#virCoveragePopSpan").html(queryArrayVirCoverage.toString())
  $("#virIdentityPopSpan").html(queryArrayVirIdentity.toString())
  $("#virRangePopSpan").html(queryArrayVirRange.toString())
}

const virulenceGetter = (nodeId) => {
  // here in this function there is no need to parse the
  // data.json_entry.database entry since it is a single database
  $.post("api/getvirulence/", {"accession": JSON.stringify([nodeId])}, (data, status) => {
    // first we need to gather all information in a format that may be
    // passed to jquery to append to popup_descriptions div
    // set of arrays for card db
    const queryArrayVirGenes = []
    const queryArrayVirAccession = []
    const queryArrayVirCoverage = []
    const queryArrayVirIdentity = []
    const queryArrayVirRange = []

    try{
      // totalLength array corresponds to gene names
      const totalLength = data[0].json_entry.gene.replace(/['u\[\] ]/g, "").split(",")
      const accessionList = data[0].json_entry.accession.replace(/['u\[\] ]/g, "").split(",")
      const coverageList = data[0].json_entry.coverage.replace(/['u\[\] ]/g, "").split(",")
      const identityList = data[0].json_entry.identity.replace(/['u\[\] ]/g, "").split(",")
      const rangeList = data[0].json_entry.seq_range.replace("[[", "[").replace("]]", "]").split("],")
      for (const i in totalLength) {
        if ({}.hasOwnProperty.call(totalLength, i)) {
          const num = (parseFloat(i) + 1).toString()
          const rangeEntry = (rangeList[i].indexOf("]") > -1) ?
            rangeList[i].replace(" ", "").replace(",", ":") :
            (rangeList[i] + "]").replace(", ", ":")
          queryArrayVirGenes.push(" " + num + ": " + totalLength[i])
          // card retrieves some odd numbers after the accession... that
          // prevent to form a linkable item to genbank
          queryArrayVirAccession.push(" " + num + ": " +
            makeItClickable(accessionList[i].split(":")[0]))
          queryArrayVirCoverage.push(" " + num + ": " + coverageList[i])
          queryArrayVirIdentity.push(" " + num + ": " + identityList[i])
          queryArrayVirRange.push(" " + num + ": " + rangeEntry)
        }
      }
      // then actually add it to popup_description div
      virPopupPopulate(queryArrayVirGenes, queryArrayVirAccession,
        queryArrayVirCoverage, queryArrayVirIdentity, queryArrayVirRange)
    } catch (error) {
      document.getElementById("alertId_db").childNodes[0].nodeValue = "Warning!" +
        " This sequence has no Virulence information available in database."
      $("#alertId_db").show()
      $("#alertClose_db").click( () => {
        $("#alertId_db").hide()  // hide this div
      })
      virPopupPopulate("N/A", "N/A", "N/A", "N/A", "N/A")
      // hides the div after 5 seconds
      window.setTimeout( () => { $("#alertId_db").hide() }, 5000)
    }
  })
}