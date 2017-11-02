const resGetter = (nodeId) => {
  $.get("api/getresistances/", {"accession": nodeId}, (data, status) => {
    console.log(data.json_entry)
    //data.json_entry.gene.replace(/['u\[\] ]/g,'').split(','))
    const totalLenght = data.json_entry.gene.replace(/['u\[\] ]/g, '').split(',')
    const acessionList = data.json_entry.accession.replace(/['u\[\] ]/g, '').split(',')
    const coverageList = data.json_entry.coverage.replace(/['u\[\] ]/g, '').split(',')
    const databaseList = data.json_entry.database.replace(/['u\[\] ]/g, '').split(',')
    const identityList = data.json_entry.identity.replace(/['u\[\] ]/g, '').split(',')
    const rangeList = data.json_entry.seq_range.replace("[[", "[").replace("]]", "]").split("],")
    console.log(rangeList)
    for (let i in totalLenght) {
      const rangeEntry = (rangeList[i].indexOf("]") > -1) ? rangeList[i].replace(" ", "") : rangeList[i] + "]"
      console.log(totalLenght[i], acessionList[i], coverageList[i], databaseList[i], identityList[i], rangeEntry)
    }
  })
}