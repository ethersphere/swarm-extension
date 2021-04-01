const web2Helper = window.swarm.web2Helper

function fetchBeeApiUrl() {
  web2Helper.beeApiUrl().then(url => (document.getElementById('bee-api-url-placeholder').innerHTML = url))
}

function fetchJinnImage() {
  const bzzContentAddress = '45761400d69cd972bf0bc1aaaacd809c9d2687eed3ece09836320f887143d9be/images/jinn.png'
  const jinnFakeUrl = web2Helper.fakeBzzAddress(bzzContentAddress)
  const imageNode = document.createElement('img')
  imageNode.src = jinnFakeUrl
  imageNode.id = 'fetched-jinn-image'
  imageNode.width = 300
  document.getElementById('fake-url-fetch-jinn')?.appendChild(imageNode)
}

function uploadFileWithBeeJs() {
  const beeUrl = web2Helper.fakeBeeApiAddress()
  const bee = new window.BeeJs.Bee(beeUrl)
  const files = [new File(['<h1>Uploaded File through Fake URL!</h1>'], 'index.html', { type: 'text/html' })]

  bee.uploadFiles(files, { indexDocument: 'index.html' }).then(hash => {
    const referenceNode = document.createElement('a')
    referenceNode.href = web2Helper.fakeBzzAddress(hash)
    referenceNode.innerHTML = hash
    document.getElementById('fake-bzz-url-content-1')?.appendChild(referenceNode)
  })
}
