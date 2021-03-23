// Unfortunately I didn't find better solution first to register custom protocols in chromium based browsers
// So his script will solve this problem as is in order to use swarm protocols
// web+ prefix is needed for custom protocols
console.log(`Inject web+bzz protocol handling: ${document.baseURI} ; ${document.title}`)

// Only for debugging what events go through
window.addEventListener(
  'message',
  event => {
    console.log('window event!', event)
  },
  false,
)

const dappRequestUrl = 'http://localhost:1633/dapp-request'

const images = document.images
const iframes = document.getElementsByTagName('iframe')
const links = document.getElementsByTagName('a')
const srcElements = [...images, ...iframes]
// change images' source
for (const srcElement of srcElements) {
  const bzzElementSrc = srcElement.src.split('web+bzz://')

  if (bzzElementSrc.length === 2) {
    srcElement.src = `${dappRequestUrl}?bzz-resource=${bzzElementSrc[1]}`
  }
}
//change link sources
for (const link of links) {
  const bzzLinkHref = link.href.split('web+bzz://')

  if (bzzLinkHref.length === 2) {
    link.href = `${dappRequestUrl}?bzz-resource=${bzzLinkHref[1]}`
  }
}
