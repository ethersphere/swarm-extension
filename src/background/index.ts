console.log('Swarm Backend script started...')
const beeApiUrl = 'http://localhost:1633'

// typed in 'bzz://{content-address}' URI in search bar triggers redirect to gateway BZZ address
// only react if google search has been set for searching
chrome.webRequest.onBeforeRequest.addListener(
  (details: chrome.webRequest.WebRequestBodyDetails) => {
    console.log('Original BZZ Url', details.url)
    const urlParams = new URLSearchParams(details.url)
    for (const e of urlParams.entries()) {
      console.log('entries', e)
    }
    const query = urlParams.get('oq')

    if (!query || !query.startsWith('bzz://')) return

    console.log('bzz address', query)
    console.log('redirect to', `${beeApiUrl}/bzz/${query.substr(6)}`)

    return {
      redirectUrl: `${beeApiUrl}/bzz/${query.substr(6)}`,
    }
  },
  {
    urls: ['https://www.google.com/search?*'],
  },
  ['blocking'],
)

//redirect from custom protocol
chrome.webRequest.onBeforeRequest.addListener(
  details => {
    const urlArray = details.url.split('web%2Bbzz%3A%2F%2F')

    // no match
    if (urlArray.length === 1) return

    const redirectUrl = `${beeApiUrl}/bzz/${urlArray[1]}`
    console.log(`BZZ redirect to ${redirectUrl} from ${details.url}`)

    return { redirectUrl }
  },
  { urls: [`${beeApiUrl}/dapp-request?bzz-address=*`] },
  ['blocking'],
)

// redirect from injected script for resources which does not handle custom protocols by default
chrome.webRequest.onBeforeRequest.addListener(
  details => {
    const urlArray = details.url.split('bzz-resource=')
    const redirectUrl = `${beeApiUrl}/bzz/${urlArray[1]}`
    console.log(`BZZ resource redirect to ${redirectUrl} from ${details.url}`)

    return {
      redirectUrl,
    }
  },
  { urls: [`${beeApiUrl}/dapp-request?bzz-resource=*`] },
  ['blocking'],
)

// Only for debugging
chrome.webRequest.onBeforeRedirect.addListener(
  details => {
    console.log('url before redirect', details.url)
  },
  { urls: ['*://*/*'] },
)
