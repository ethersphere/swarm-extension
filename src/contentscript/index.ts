// Unfortunately I didn't find better solution first to register custom protocols in chromium based browsers
// So his script will solve this problem as is in order to use swarm protocols
// web+ prefix is needed for custom protocols
console.log(`Inject web+bzz protocol handling: ${document.baseURI} ; ${document.title}`)
const dappRequestUrl = 'http://localhost:1633/dapp-request'
// custom protocol handler is highly unconvenient to set up and cannot be enabled automaticly in puppeteer
// it does not have effect on image loading
window.navigator.registerProtocolHandler('web+bzz', `${dappRequestUrl}?bzz-address=%s`, 'Swarm dApp')

const images = document.images
const iframes = document.getElementsByTagName('iframe')
const links = document.getElementsByTagName('a')
const srcElements = [...images, ...iframes]
// change images' source
for (let i = 0; i < srcElements.length; i++) {
  const bzzElementSrc = srcElements[i].src.split('web+bzz://')

  if (bzzElementSrc.length === 2) {
    srcElements[i].src = `${dappRequestUrl}?bzz-resource=${bzzElementSrc[1]}`
  }
}
//change link sources
for (let i = 0; i < links.length; i++) {
  const bzzLinkHref = links[i].href.split('web+bzz://')

  if (bzzLinkHref.length === 2) {
    links[i].href = `${dappRequestUrl}?bzz-resource=${bzzLinkHref[1]}`
  }
}
