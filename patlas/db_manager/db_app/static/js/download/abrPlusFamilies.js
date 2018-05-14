/*globals xRangePlotList, Highcharts*/

/**
 * Function that makes a given accession number clickable.
 * @param {String} desiredString - The string with the accession number.
 * @returns {String} - The a element to store the link.
 */
const makeItClickable = (desiredString) => {
  return "<a href='https://www.ncbi.nlm.nih.gov/nuccore/" +
    desiredString + "' target='_blank'>" + desiredString + "</a>"
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


/**
 * Function that parses the queryArrays with ranges
 * @param {Array} queryArrayRange - The array that contains the objects for each
 * queried annotation.
 * @param {Number} idx - The series index to pass, in the case the plot have more
 * than one annotation type.
 * @returns {Array} - returns an array that can be merged with other similar
 * array or fed to the highcharts series.data
 */
const generatePlotLengthData = (queryArrayRange, idx) => {

  let data = []

  if (queryArrayRange !== "N/A") {

    for (const entry of queryArrayRange) {
      data.push(
        {
          x: parseFloat(entry.range[0]),
          x2: parseFloat(entry.range[1]),
          y: idx,
          name: entry.genes
        }
      )
    }
  }

  return data

}


/**
 * Function that parses the query range array and make it available to display
 * in html div
 * @param {Array|String} queryArrayRange - The array to be queried and converted into
 * a string. This variable can be a string with "N/A" when no data is retrieved
 * from the database.
 * @returns {String} - returns a string capable of being read by the jquery
 * html() function.
 */
const getRangeToString = (queryArrayRange) => {

  // check if the array is empty and if so return the same value
  if (queryArrayRange === "N/A") {

    return "N/A"

  } else {
    // otherwise parse the array to return a single string
    return queryArrayRange.map((e, index) => {
      // returns per entry something like "1: [1000:2000]"
      return `${index + 1}: [${e.range.toString().replace(",", ":")}]`
    }).join(", ")

  }

}


/**
 * Function to construct the xrange plot
 * @param {Array} lenghtData - The array with the values to feed to the chart
 * data.
 */
const populateHighchartXrange = (lenghtData) => {

  Highcharts.chart("resistancePopupPlot", {
    chart: {
      type: "xrange",
      zoomType: "x",
      panKey: "ctrl",   //key used to navigate the graph when zoomed
      panning: true     // allow panning of the graph when zoomed
    },
    title: {
      text: "Resistance genes"
    },
    xAxis: {
      min: 0,
      // gets sequence length from this div
      max: parseFloat($("#lengthPop").html().split("</span>")[1])
    },
    yAxis: {
      title: {
        text: ""
      },
      categories: ["CARD", "ResFinder", "PFinder", "VFDB"],
      reversed: true,
      labels: {
        rotation: 270
      },
    },
    series: [{
      showInLegend: false,
      borderColor: "gray",
      pointWidth: 30,
      data: lenghtData,
      dataLabels: {
        formatter() {
          return this.point.name
        },
        enabled: true
      }
    }],
    credits: {
      enabled: false
    },
    tooltip: {
      formatter() {
        return `<br><b>gene name:</b> ${this.point.name}</br>
<br><b>range:</b> ${this.x.toString()} - ${this.x2.toString()}</br>
<br><b>database:</b> ${this.yCategory}</br></ul>`
      }
    }
  })

}


/**
 * Function to populate the resistance associated entries in the popup
 * @param {Array} queryArrayCardRange - Array with all the entries for the
 * CARD database.
 * @param {Array} queryArrayResfinderRange - Array with all the entries for the
 * ResFinder database
 * @returns {Promise<void>} - it really doesn't return anything relevant
 */
const resPopupPopulate = async (queryArrayCardRange,
                                queryArrayResfinderRange) => {

  $("#cardAroPopSpan").html(queryArrayCardRange.map( (e, index) => {
      return `${index + 1}: ${e.aro.toString()}`
    }).join(", ")
  )

  $("#cardGenePopSpan").html(queryArrayCardRange.map( (e, index) => {
      return `${index + 1}: ${e.genes.toString()}`
    }).join(", ")
  )

  $("#cardGenbankPopSpan").html(queryArrayCardRange.map( (e, index) => {
      return `${index + 1}: ${e.accessions.toString()}`
    }).join(", ")
  )

  $("#cardCoveragePopSpan").html(queryArrayCardRange.map( (e, index) => {
      return `${index + 1}: ${e.coverage.toString()}`
    }).join(", ")
  )
  $("#cardIdPopSpan").html(queryArrayCardRange.map( (e, index) => {
      return `${index + 1}: ${e.identity.toString()}`
    }).join(", ")
  )

  $("#cardRangePopSpan").html(getRangeToString(queryArrayCardRange))


  $("#resfinderGenePopSpan").html(queryArrayResfinderRange.map( (e, index) => {
      return `${index + 1}: ${e.genes.toString()}`
    }).join(", ")
  )

  $("#resfinderGenbankPopSpan").html(queryArrayResfinderRange.map( (e, index) => {
      return `${index + 1}: ${e.accessions.toString()}`
    }).join(", ")
  )

  $("#resfinderCoveragePopSpan").html(queryArrayResfinderRange.map( (e, index) => {
      return `${index + 1}: ${e.coverage.toString()}`
    }).join(", ")
  )
  $("#resfinderIdPopSpan").html(queryArrayResfinderRange.map( (e, index) => {
      return `${index + 1}: ${e.identity.toString()}`
    }).join(", ")
  )

  $("#resfinderRangePopSpan").html(getRangeToString(queryArrayResfinderRange))

  const cardLenghtData = await generatePlotLengthData(queryArrayCardRange, 0)
  const resFinderLengthData = await generatePlotLengthData(queryArrayResfinderRange, 1)

  xRangePlotList = xRangePlotList.concat(resFinderLengthData, cardLenghtData)

  await populateHighchartXrange(xRangePlotList)

  $("#resistancePopupPlot").show()

}


/**
 * This function is intended to use in a single query instances such as
 * popup_description button
 * @param {String} nodeId - The string with the accession number of the node
 * that was clicked.
 * @returns {boolean} - returns true, stating that this tab was already shown.
 * this avoids to duplicate the number of queries if for some reason the user
 * cycles between the tabs.
 */
const resGetter = (nodeId) => {
  $.post("api/getresistances/", {"accession": JSON.stringify([nodeId])}, (data, status) => {
    // first we need to gather all information in a format that may be
    // passed to jquery to append to popup_descriptions div
    // set of arrays for card db
    const queryArrayCardRange = []
    const queryArrayResfinderRange = []

    try {
      // totalLength array corresponds to gene names
      const totalLenght = data[0].json_entry.gene.replace(/['u\[\] ]/g, "").split(",")
      const accessionList = data[0].json_entry.accession.replace(/['u\[\] ]/g, "").split(",")
      const coverageList = data[0].json_entry.coverage.replace(/['u\[\] ]/g, "").split(",")
      const databaseList = data[0].json_entry.database.replace(/['u\[\] ]/g, "").split(",")
      const identityList = data[0].json_entry.identity.replace(/['u\[\] ]/g, "").split(",")
      const rangeList = data[0].json_entry.seq_range.replace("[[", "[").replace("]]", "]").split("],")
      const aroList = data[0].json_entry.aro_accession.replace(/['u\[\] ]/g, "").split(",")

      for (const i in totalLenght) {
        if ({}.hasOwnProperty.call(totalLenght, i)) {
          const rangeEntry = (rangeList[i].indexOf("]") > -1) ?
            rangeList[i].replace(/[\[\] ]/g, "").split(",") :
            (rangeList[i] + "]").replace(/[\[\] ]/g, "").split(",")

          if (databaseList[i].indexOf("card") > -1) {

            queryArrayCardRange.push( {
                "range": rangeEntry,
                "genes": totalLenght[i],
                "accessions": makeItClickable(accessionList[i].split(":")[0]),
                "coverage": coverageList[i],
                "identity": identityList[i],
                "aro": makeCardClickable(aroList[i])
              }
            )

          } else {

            queryArrayResfinderRange.push( {
                "range": rangeEntry,
                "genes": totalLenght[i],
                "accessions": makeItClickable(accessionList[i]),
                "coverage": coverageList[i],
                "identity": identityList[i]
              }
            )
          }
        }
      }
      // then actually add it to popup_description div
      resPopupPopulate(queryArrayCardRange,queryArrayResfinderRange)

    } catch (error) {

      console.log(error)
      document.getElementById("alertId_db").childNodes[0].nodeValue = "Warning!" +
        " This sequence has no Resistance information available in database."
      $("#alertId_db").show()
      $("#alertClose_db").click( () => {
        $("#alertId_db").hide()  // hide this div
      })

      $("#cardAroPopSpan, #cardGenePopSpan, #cardGenbankPopSpan, " +
        "#cardCoveragePopSpan, #cardIdPopSpan, #cardRangePopSpan," +
        "#resfinderGenePopSpan, #resfinderGenbankPopSpan," +
        "#resfinderCoveragePopSpan, #resfinderIdPopSpan, " +
        "#resfinderRangePopSpan").html("N/A")

      // hides the div after 5 seconds
      window.setTimeout( () => { $("#alertId_db").hide() }, 5000)
    }

  })

  return true
}


/**
 * This function populates the plasmid finder associated divs in the popup,
 * including the plot.
 * @param {Array} queryArrayPFRange - The array with all the entries to be
 * added to the divs.
 * @returns {Promise<void>}
 */
const pfPopupPopulate = async (queryArrayPFRange) => {

  $("#pfGenePopSpan").html(queryArrayPFRange.map( (e, index) => {
      return `${index + 1}: ${e.genes.toString()}`
    }).join(", ")
  )

  $("#pfGenbankPopSpan").html(queryArrayPFRange.map( (e, index) => {
      return `${index + 1}: ${e.accessions.toString()}`
    }).join(", ")
  )

  $("#pfCoveragePopSpan").html(queryArrayPFRange.map( (e, index) => {
      return `${index + 1}: ${e.coverage.toString()}`
    }).join(", ")
  )
  $("#pfIdentityPopSpan").html(queryArrayPFRange.map( (e, index) => {
      return `${index + 1}: ${e.identity.toString()}`
    }).join(", ")
  )


  $("#pfRangePopSpan").html(getRangeToString(queryArrayPFRange))


  const pfFinderLengthData = await generatePlotLengthData(queryArrayPFRange, 2)

  xRangePlotList = xRangePlotList.concat(pfFinderLengthData)

  await populateHighchartXrange(xRangePlotList)

  $("#resistancePopupPlot").show()
}


/**
 * Function to make the request for the plasmid finder entry after a node click
 * and selection of the tab Plasmid Finder in the popup.
 * @param {String} nodeId - The string with the accession number being queried/
 * clicked.
 * @returns {boolean} - returns true, stating that this tab was already shown.
 * this avoids to duplicate the number of queries if for some reason the user
 * cycles between the tabs.
 */
const plasmidFamilyGetter = (nodeId) => {
  // here in this function there is no need to parse the
  // data.json_entry.database entry since it is a single database
  $.post("api/getplasmidfinder/", {"accession": JSON.stringify([nodeId])}, (data, status) => {

    // first we need to gather all information in a format that may be
    // passed to jquery to append to popup_descriptions div
    // set of arrays for card db
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

          const rangeEntry = (rangeList[i].indexOf("]") > -1) ?
            rangeList[i].replace(/[\[\] ]/g, "").split(",") :
            (rangeList[i] + "]").replace(/[\[\] ]/g, "").split(",")

          queryArrayPFRange.push( {
              "range": rangeEntry,
              "genes": totalLength[i],
              "accessions": makeItClickable(accessionList[i].split(":")[0]),
              "coverage": coverageList[i],
              "identity": identityList[i]
            }
          )

        }
      }
      // then actually add it to popup_description div
      pfPopupPopulate(queryArrayPFRange)
    } catch (error) {
      document.getElementById("alertId_db").childNodes[0].nodeValue = "Warning!" +
        " This sequence has no PlasmidFinder information available in database."
      $("#alertId_db").show()
      $("#alertClose_db").click( () => {
        $("#alertId_db").hide()  // hide this div
      })

      $("#pfGenePopSpan, #pfGenbankPopSpan, #pfCoveragePopSpan, " +
        "#pfIdentityPopSpan, #pfRangePopSpan").html("N/A")

      // hides the div after 5 seconds
      window.setTimeout( () => { $("#alertId_db").hide() }, 5000)
    }
  })

  return true
}


/**
 * Function to populate the virulence associated divs available in the popup
 * menu
 * @param {Array} queryArrayVirRange - The array with the data to be displayed
 * in the popup, including plot
 * @returns {Promise<void>}
 */
const virPopupPopulate = async (queryArrayVirRange) => {

  $("#virGenePopSpan").html(queryArrayVirRange.map( (e, index) => {
      return `${index + 1}: ${e.genes.toString()}`
    }).join(", ")
  )

  $("#virGenbankPopSpan").html(queryArrayVirRange.map( (e, index) => {
      return `${index + 1}: ${e.accessions.toString()}`
    }).join(", ")
  )

  $("#virCoveragePopSpan").html(queryArrayVirRange.map( (e, index) => {
      return `${index + 1}: ${e.coverage.toString()}`
    }).join(", ")
  )
  $("#virIdentityPopSpan").html(queryArrayVirRange.map( (e, index) => {
      return `${index + 1}: ${e.identity.toString()}`
    }).join(", ")
  )

  $("#virRangePopSpan").html(getRangeToString(queryArrayVirRange))

  const virulenceLengthData = await generatePlotLengthData(queryArrayVirRange, 3)

  xRangePlotList = xRangePlotList.concat(virulenceLengthData)

  await populateHighchartXrange(xRangePlotList)

  $("#resistancePopupPlot").show()

}


/**
 * Function that makes the request for the clicked node, retrieving the clicked
 * node information for the annotated virulence genes.
 * @param {String} nodeId - The accession number being queried
 * @returns {boolean} - returns true, stating that this tab was already shown.
 * this avoids to duplicate the number of queries if for some reason the user
 * cycles between the tabs.
 */
const virulenceGetter = (nodeId) => {
  // here in this function there is no need to parse the
  // data.json_entry.database entry since it is a single database
  $.post("api/getvirulence/", {"accession": JSON.stringify([nodeId])}, (data, status) => {
    // first we need to gather all information in a format that may be
    // passed to jquery to append to popup_descriptions div
    // set of arrays for card db
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

          const rangeEntry = (rangeList[i].indexOf("]") > -1) ?
            rangeList[i].replace(/[\[\] ]/g, "").split(",") :
            (rangeList[i] + "]").replace(/[\[\] ]/g, "").split(",")
          queryArrayVirRange.push(
            {
              "range": rangeEntry,
              "genes": totalLength[i],
              "accessions": makeItClickable(accessionList[i].split(":")[0]),
              "coverage": coverageList[i],
              "identity": identityList[i]
            }
          )
        }
      }
      // then actually add it to popup_description div
      virPopupPopulate(queryArrayVirRange)
    } catch (error) {
      document.getElementById("alertId_db").childNodes[0].nodeValue = "Warning!" +
        " This sequence has no Virulence information available in database."
      $("#alertId_db").show()
      $("#alertClose_db").click( () => {
        $("#alertId_db").hide()  // hide this div
      })

      $("#virGenePopSpan, #virGenbankPopSpan, #virCoveragePopSpan," +
        "#virIdentityPopSpan, #virRangePopSpan").html("N/A")

      // hides the div after 5 seconds
      window.setTimeout( () => { $("#alertId_db").hide() }, 5000)
    }
  })

  return true
}