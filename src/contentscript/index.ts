// Unfortunately I didn't find better solution first to register custom protocols in chromium based browsers
// So his script will solve this problem as is in order to use swarm protocols
// web+ prefix is needed for custom protocols
console.log(`Inject web+bzz protocol handling: ${document.baseURI} ; ${document.title}`)
const dappRequestUrl = 'http://localhost:1633/dapp-request'
window.navigator.registerProtocolHandler('web+bzz', `${dappRequestUrl}?bzz-address=%s`, 'Swarm dApp')

const images = document.getElementsByTagName('img')
for (let i = 0; i < images.length; i++) {
  const imageBzzSrc = images[i].src.split('web+bzz://')

  if (imageBzzSrc.length === 2) {
    images[i].src = `${dappRequestUrl}?bzz-resource=${imageBzzSrc[1]}`
  }
}
