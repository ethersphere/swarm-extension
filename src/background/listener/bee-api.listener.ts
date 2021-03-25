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

    // Redirects 'web+bzz://' custom protocol
    chrome.webRequest.onBeforeRequest.addListener(
      details => {
        const urlArray = details.url.split('web%2Bbzz%3A%2F%2F')

        // no match
        if (urlArray.length === 1) return

        const redirectUrl = `${this._beeApiUrl}/bzz/${urlArray[1]}`
        console.log(`web+bzz redirect to ${redirectUrl} from ${details.url}`)

        return { redirectUrl }
      },
      { urls: [`${fakeUrl.webBzzProtocol}/*`] },
      ['blocking'],
    )

    // Redirects 'bzz-resource=<content_hash>'  to '<gateway>/bzz/<content_hash>
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
