const web2Helper = window.swarm.web2Helper

function fetchBeeApiUrl() {
  web2Helper.beeApiUrl().then(url => (document.getElementById('bee-api-url-placeholder').innerHTML = url))
}

function checkBeeApiAvailable() {
  web2Helper.isBeeApiAvailable().then(available => {
    const placeholderElement = document.getElementById('bee-api-available-placeholder')
    placeholderElement.innerHTML = available
    placeholderElement.setAttribute('complete', 'true')
  })
}

function fetchJinnImage() {
  const bzzContentAddress = '82de75aa2e4e27eefc3c00f5cdc7a2cb787402906a73609803de0ee25602b4f5/images/jinn.png'
  const jinnFakeUrl = web2Helper.fakeBzzAddress(bzzContentAddress)
  const imageNode = document.createElement('img')
  imageNode.src = jinnFakeUrl
  imageNode.id = 'fetched-jinn-image'
  imageNode.width = 300
  document.getElementById('fake-url-fetch-jinn')?.appendChild(imageNode)
}

async function uploadFileWithBeeJs() {
  const beeUrl = web2Helper.fakeBeeApiAddress()
  const bee = new window.BeeJs.Bee(beeUrl)
  const postageStampAddress = '0000000000000000000000000000000000000000000000000000000000000000' // arbitrary value
  const files = [new File(['<h1>Uploaded File through Fake URL!</h1>'], 'index.html', { type: 'text/html' })]

  try {
    const hash = await bee.uploadFiles(postageStampAddress, files, { indexDocument: 'index.html' })
    const referenceNode = document.createElement('a')
    referenceNode.href = web2Helper.fakeBzzAddress(hash)
    referenceNode.innerHTML = hash
    document.getElementById('fake-bzz-url-content-1')?.appendChild(referenceNode)
  } catch (e) {
    console.error('Error happened on file upload (uploadFileWithBeeJs)', e)
  }
}
