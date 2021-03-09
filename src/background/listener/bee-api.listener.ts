import { StoreObserver, getItem } from '../../utils/storage'
export class BeeApiListener {
  private beeApiUrl: string

  public constructor(private storeObserver: StoreObserver) {
    this.beeApiUrl = 'http://localhost:1633'
    this.addStoreListeners()
    this.asyncInit()
    this.addBzzListeners()
  }

  private addBzzListeners() {
    // 'bzz://{content-address}' URI in search bar triggers redirect to gateway BZZ address
    // NOTE: works only if google search is set as default search engine
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
        console.log('redirect to', `${this.beeApiUrl}/bzz/${query.substr(6)}`)

        return {
          redirectUrl: `${this.beeApiUrl}/bzz/${query.substr(6)}`,
        }
      },
      {
        urls: ['https://www.google.com/search?*'],
      },
      ['blocking'],
    )

    //redirect from web+bzz custom protocol
    chrome.webRequest.onBeforeRequest.addListener(
      details => {
        const urlArray = details.url.split('web%2Bbzz%3A%2F%2F')

        // no match
        if (urlArray.length === 1) return

        const redirectUrl = `${this.beeApiUrl}/bzz/${urlArray[1]}`
        console.log(`BZZ redirect to ${redirectUrl} from ${details.url}`)

        return { redirectUrl }
      },
      { urls: [`${this.beeApiUrl}/dapp-request?bzz-address=*`] },
      ['blocking'],
    )

    // Given value of 'bzz-resource' is a bare bzz address without any prefix
    // redirect by injected script to resources which does not handle custom protocols by default
    chrome.webRequest.onBeforeRequest.addListener(
      details => {
        const urlArray = details.url.split('bzz-resource=')
        const redirectUrl = `${this.beeApiUrl}/bzz/${urlArray[1]}`
        console.log(`BZZ resource redirect to ${redirectUrl} from ${details.url}`)

        return {
          redirectUrl,
        }
      },
      { urls: [`${this.beeApiUrl}/dapp-request?bzz-resource=*`] },
      ['blocking'],
    )
  }

  private async asyncInit() {
    const storedBeeApiUrl = await getItem('beeApiUrl')

    if (storedBeeApiUrl) this.beeApiUrl = storedBeeApiUrl
  }

  private addStoreListeners(): void {
    this.storeObserver.addListener('beeApiUrl', newValue => {
      console.log('Bee API URL changed to', newValue)
      this.beeApiUrl = newValue
    })
  }
}
