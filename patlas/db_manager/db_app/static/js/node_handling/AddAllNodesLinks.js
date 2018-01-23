/*globals listLengths, listGi, list, totalNumberOfLinks, counter */

const addAllNodes = (g, json, layout) => {
  return new Promise((resolve, reject) => {
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
          g.addNode(sequence, {
            sequence: "<span style='color:#468499'>Accession:" +
            " </span><a" +
            " href='https://www.ncbi.nlm.nih.gov/nuccore/" + sequence.split("_").slice(0, 2).join("_") + "' target='_blank'>" + sequence + "</a>",
            seqLength: "<span" +
            " style='color:#468499'>Sequence length:" +
            " </span>" + seqLength,
            logLength
          })
          list.push(sequence)
          layout.setNodePosition(sequence, array.position.x, array.position.y)
        } else {
          reject(`node wasn't added: ${sequence}`)
        }
        if (i + 1 === json.length) {
          resolve("sucessfully added all nodes")
        }
      }
    }
  })
}

const addAllLinks = (g, json) => {
  totalNumberOfLinks = json.length
  return new Promise( (resolve, reject) => {
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
          g.addLink(sequence, reference, distNSizes)
        } else {
          // if there is no reference associated with sequence then
          // there are no links
          reject(new Error(`link wasn't added: ${array.childId} -> ${sequence}`))
        }
        if (i + 1 === json.lenght) {
          resolve("sucessefully added all links")
        }
      }
    }
  })
}