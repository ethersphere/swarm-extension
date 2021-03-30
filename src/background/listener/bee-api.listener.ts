import { StoreObserver, getItem } from '../../utils/storage'
import { fakeUrl } from '../../utils/fake-url'
export class BeeApiListener {
  private _beeApiUrl: string

  public constructor(private storeObserver: StoreObserver) {
    this._beeApiUrl = 'http://localhost:1633'
    this.addStoreListeners()
    this.asyncInit()
    this.addBzzListeners()
  }

  public get beeApiUrl(): string {
    return this._beeApiUrl
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
        console.log('redirect to', `${this._beeApiUrl}/bzz/${query.substr(6)}`)

        return {
          redirectUrl: `${this._beeApiUrl}/bzz/${query.substr(6)}`,
        }
      },
      {
        urls: ['https://www.google.com/search?*'],
      },
      ['blocking'],
    )

    // Used to load page resources like images
    chrome.webRequest.onBeforeRequest.addListener(
      details => {
        const urlArray = details.url.split(`${fakeUrl.bzzProtocol}/`)
        const redirectUrl = `${this._beeApiUrl}/bzz/${urlArray[1]}`
        console.log(`bzz redirect to ${redirectUrl} from ${details.url}`)

        return {
          redirectUrl,
        }
      },
      { urls: [`${fakeUrl.bzzProtocol}/*`] },
      ['blocking'],
    )

    // Forward requests to the Bee client with the corresponding keys
    // TODO add API key here to the request if it will be available in the Bee client
    chrome.webRequest.onBeforeRequest.addListener(
      details => {
        const urlArray = details.url.split(fakeUrl.beeApiAddress)
        const redirectUrl = `${this._beeApiUrl}${urlArray[1]}`
        console.log(`Bee API client request redirect to ${redirectUrl} from ${details.url}`)

        return {
          redirectUrl,
        }
      },
      { urls: [`${fakeUrl.beeApiAddress}*`] },
      ['blocking'],
    )
  }

  private async asyncInit() {
    const storedBeeApiUrl = await getItem('beeApiUrl')

    if (storedBeeApiUrl) this._beeApiUrl = storedBeeApiUrl
  }

  private addStoreListeners(): void {
    this.storeObserver.addListener('beeApiUrl', newValue => {
      console.log('Bee API URL changed to', newValue)
      this._beeApiUrl = newValue
    })
  }
}
