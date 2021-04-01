import { web2HelperContent } from '../web2-helper.content'

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

const images = document.images
const iframes = document.getElementsByTagName('iframe')
const links = document.getElementsByTagName('a')
const srcElements = [...images, ...iframes]
// change images' source
for (const srcElement of srcElements) {
  const bzzElementSrc = srcElement.src.split('web+bzz://')

  if (bzzElementSrc.length === 2) {
    srcElement.src = web2HelperContent.fakeBzzAddress(bzzElementSrc[1])
  }
}
//change link sources
for (const link of links) {
  const bzzLinkHref = link.href.split('web+bzz://')

  if (bzzLinkHref.length === 2) {
    link.href = web2HelperContent.fakeBzzAddress(bzzLinkHref[1])
  }
}
