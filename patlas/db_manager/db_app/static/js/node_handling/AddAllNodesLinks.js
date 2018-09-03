/*globals listLengths, listGi, list, totalNumberOfLinks, counter */

const addAllNodes = async (g, json, layout) => {
  for (const i in json) {
    if (json.hasOwnProperty(i)) {
      const array = json[i]
      counter++
      const sequence = array.id
      const seqLength = array.length
      const logLength = Math.log(parseInt(seqLength))
      listLengths.push(seqLength)
      listGi.push(sequence)
      
      if (list.indexOf(sequence) < 0) {
        await g.addNode(sequence, {
          sequence: "<span style='color:#468499; font-weight: bold;'>Accession:" +
          " </span><a" +
          " href='https://www.ncbi.nlm.nih.gov/nuccore/" + sequence.split("_").slice(0, 2).join("_") + "' target='_blank'>" + sequence + "</a>",
          seqLength: "<span" +
          " style='color:#468499; font-weight: bold;'>Sequence length:" +
          " </span>" + seqLength,
          logLength
        })
        await list.push(sequence)
        await layout.setNodePosition(sequence, array.position.x, array.position.y)
      }
    }
  }
  // })
}

const addAllLinks = async (g, json) => {
  
  totalNumberOfLinks = json.length
  for (const i in json) {
    if (json.hasOwnProperty(i)) {
      const array = json[i]
      const sequence = array.parentId   // stores sequences
      const reference = array.childId  // stores references
      const distNSizes = array.distNSizes   // stores distances
      // and sizeRatios
      if (reference !== "") {
        // here it adds only unique links because filtered.json file
        // just stores unique links
        await g.addLink(sequence, reference, distNSizes)
      }
    }
  }
}