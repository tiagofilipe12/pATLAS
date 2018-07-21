/**
 * function that handles the requests to the database to generate a file
 * @param {Array} accList - an array of all the accessions to be downloaded
 */
const downloadTypeHandler = (accList) => {
  // window.open(`http://www.patlas.site/api/senddownload/?accession=${accList.join()}`)
  $.post("api/senddownload/", {"accessions": JSON.stringify(accList)},
    (data, status) => {
      if (status === "success") {
        console.log(data)
        console.log(window.location.hostname)
        // sets data to localhost instead of pATLAS when using local versions
        // otherwise maintains the request to patlas.site
        data = (window.location.hostname === "127.0.0.1") ?
            data.replace("http://www.patlas.site", "") : data
          
        // populates the alert when the download is ready
        $("#fillDownloadAlert").html(
          `Your download is ready: <a href=${data} target='_blank' 
style='color: #3c763d'><button class='btn btn-sm' 
style='background-color: #eeffe7; border-color: #3c763d;'><b>Click here!</b>
</button></a>`
        )

        // shows alert
        $("#alertDownload").show()
      }
    }
  )
}


/**
 * this just downloads the selected sequences
 * @param {Array} listAcc - an array of all the accession number to be
 * downloaded
 */
const downloadSeq = (listAcc) => {
  // used map instead of list comprehensions because the latter is not
  // available in google chrome
  const acc = listAcc.map((uniqueAcc) => {
    return uniqueAcc
  })
  // function that handles if multiple outputs or a single output is generated
  downloadTypeHandler(acc)
}


/**
 * A function that allow to get all the accesion numbers to be downloaded
 * from colors of the nodes (green)
 * @param {Object} g - vivagraph graph object that stores functions for graph
 * @param {Object} graphics - vivagraph graphics functions
 */
const downloadSeqByColor = (g, graphics) => {
  let tempListAccessions = []
  g.forEachNode( (node) => {
    const currentNodeUI = graphics.getNodeUI(node.id)
    if (currentNodeUI.color === "0x" + "#fa5e00".replace("#", "")) {
      tempListAccessions.push(node.id)
    }
  })
  // function that handles if multiple outputs or a single output is generated
  downloadTypeHandler(tempListAccessions)
}
