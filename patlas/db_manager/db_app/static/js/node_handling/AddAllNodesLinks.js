/*globals listLengths, listGi, list, totalNumberOfLinks, counter */

const addAllNodes = (g, json, layout) => {
  // for (const i in json) {
  //   if (json.hasOwnProperty(i)) {
  //     const array = json[i]
  //     counter++
  //     const sequence = array.id
  //     const seqLength = array.length
  //     const logLength = Math.log(parseInt(seqLength))
  //     listLengths.push(seqLength)
  //     listGi.push(sequence)
  //
  //     if (list.indexOf(sequence) < 0) {
  //       await g.addNode(sequence, {
  //         sequence: "<span style='color:#468499; font-weight: bold;'>Accession:" +
  //         " </span><a" +
  //         " href='https://www.ncbi.nlm.nih.gov/nuccore/" + sequence.split("_").slice(0, 2).join("_") + "' target='_blank'>" + sequence + "</a>",
  //         seqLength: "<span" +
  //         " style='color:#468499; font-weight: bold;'>Sequence length:" +
  //         " </span>" + seqLength,
  //         logLength
  //       })
  //       await list.push(sequence)
  //       await layout.setNodePosition(sequence, array.position.x, array.position.y)
  //     }
  //   }
  // }

  return bluebirdPromise.map(json, (job) => {
    counter++
    const sequence = job.id
    const seqLength = job.length
    const logLength = Math.log(parseInt(seqLength))
    listLengths.push(seqLength)
    listGi.push(sequence)

    if (list.indexOf(sequence) < 0) {
      g.addNode(sequence, {
        sequence: "<span style='color:#468499; font-weight: bold;'>Accession:" +
          " </span><a" +
          " href='https://www.ncbi.nlm.nih.gov/nuccore/" + sequence.split("_").slice(0, 2).join("_") + "' target='_blank'>" + sequence + "</a>",
        seqLength: "<span" +
          " style='color:#468499; font-weight: bold;'>Sequence length:" +
          " </span>" + seqLength,
        logLength
      })
      list.push(sequence)
      return layout.setNodePosition(sequence, job.position.x, job.position.y)
    }
  }, {concurrency: 10}).then( (results) => {
    return results
  })
}

const addAllLinks = (g, json) => {
  
  // totalNumberOfLinks = json.length
  // for (const i in json) {
  //   if (json.hasOwnProperty(i)) {
  //     const array = json[i]
  //     const sequence = array.parentId   // stores sequences
  //     const reference = array.childId  // stores references
  //     const distNSizes = array.distNSizes   // stores distances
  //     // and sizeRatios
  //     if (reference !== "") {
  //       // here it adds only unique links because filtered.json file
  //       // just stores unique links
  //       const test = await g.addLink(sequence, reference, distNSizes)
  //     }
  //   }
  // }
  return bluebirdPromise.map(json, (job) => {
    const sequence = job.parentId   // stores sequences
    const reference = job.childId  // stores references
    const distNSizes = job.distNSizes   // stores distances
    // and sizeRatios
    if (reference !== "") {
      // here it adds only unique links because filtered.json file
      // just stores unique links
      return g.addLink(sequence, reference, distNSizes)
    }
  }, {concurrency: 10}).then( (results) => {
    return results
  })
}