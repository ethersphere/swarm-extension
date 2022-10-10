const swarm = new window.swarm.Swarm()
window.swarmObject = swarm

const web2Helper = swarm.web2Helper
const postageBatch = swarm.postageBatch

function fetchBeeApiUrl() {
  web2Helper
    .beeApiUrl()
    .then(url => (document.getElementById('bee-api-url-placeholder').innerHTML = url))
    .catch(error => (document.getElementById('bee-api-url-placeholder').innerHTML = JSON.stringify(error)))
    .finally(() => document.getElementById('bee-api-url-placeholder').setAttribute('complete', 'true'))
}

function fetchGlobalPostageBatch() {
  const placeholderElement = document.getElementById('global-postage-batch-placeholder')
  placeholderElement.setAttribute('complete', 'false')
  postageBatch.isGlobalPostageBatchEnabled().then(enabled => {
    placeholderElement.innerHTML = enabled
    placeholderElement.setAttribute('complete', 'true')
  })
}

function checkBeeApiAvailable() {
  web2Helper.isBeeApiAvailable().then(available => {
    const placeholderElement = document.getElementById('bee-api-available-placeholder')
    placeholderElement.innerHTML = available
    placeholderElement.setAttribute('complete', 'true')
  })
}

function fetchJinnImage() {
  const jinnImageHashElement = document.querySelector('#jinn-image-hash')

  if (!jinnImageHashElement) {
    throw new Error('#jinn-image-hash element not found')
  }
  const bzzContentAddress = `${jinnImageHashElement.value}/images/jinn.png`
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
