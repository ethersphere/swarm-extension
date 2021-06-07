import { StoreObserver, getItem } from '../../utils/storage'
import { fakeUrl } from '../../utils/fake-url'
import { SWARM_SESSION_ID_KEY, removeSwarmSessionIdFromUrl } from '../../utils/swarm-session-id'

export class BeeApiListener {
  private _beeApiUrl: string
  private _globalPostageBatchEnabled: boolean
  private _globalPostageBatchId: string

  public constructor(private storeObserver: StoreObserver) {
    this._beeApiUrl = 'http://localhost:1633'
    this._globalPostageBatchEnabled = false
    this._globalPostageBatchId = 'undefined' // it is not necessary to check later, if it is enabled it will insert
    this.addStoreListeners()
    this.asyncInit()
    this.addBzzListeners()
  }

  public get beeApiUrl(): string {
    return this._beeApiUrl
  }

  /**
   * Handles postage batch id header replacement with global batch id
   */
  private globalPostageStampHeaderListener = (
    details: chrome.webRequest.WebRequestHeadersDetails,
  ): void | chrome.webRequest.BlockingResponse => {
    if (!this._globalPostageBatchEnabled || !details.requestHeaders) return

    const postageBatchIdHeader = details.requestHeaders.find(header => header.name === 'swarm-postage-batch-id')

    if (!postageBatchIdHeader) return

    console.log(
      `Postage Batch: ${this._globalPostageBatchId} Batch ID will be used instead of ` + postageBatchIdHeader.value,
    )

    postageBatchIdHeader.value = this._globalPostageBatchId

    return { requestHeaders: details.requestHeaders }
  }

  private addBeeNodeListeners(beeApiUrl: string) {
    chrome.webRequest.onBeforeSendHeaders.addListener(
      this.globalPostageStampHeaderListener,
      {
        urls: [`${beeApiUrl}/*`],
      },
      ['blocking', 'requestHeaders'],
    )
  }

  private removeBeeNodeListeners() {
    console.log('remove bee node listeners')
    chrome.webRequest.onBeforeSendHeaders.removeListener(this.globalPostageStampHeaderListener)
  }

  private addBzzListeners() {
    /**
     * New Swarm page load request
     *
     * it listens on a fake URL which will redirect the current tab
     * to the desired address.
     * it will attach the API key later
     */
    chrome.webRequest.onBeforeRequest.addListener(
      (details: chrome.webRequest.WebRequestBodyDetails) => {
        const urlArray = details.url.split(`${fakeUrl.openDapp}/`)

        if (urlArray.length !== 2) {
          console.error(`Invalid Fake URL usage. Got: ${details.url}`)

          return // invalid fake url usage
        }

        this.redirectToBzzReference(urlArray[1], details.tabId)
      },
      { urls: [`${fakeUrl.openDapp}/*`] },
    )

    // 'bzz://{content-address}' URI in search bar triggers redirect to gateway BZZ address
    // NOTE: works only if google search is set as default search engine
    chrome.webRequest.onBeforeRequest.addListener(
      (details: chrome.webRequest.WebRequestBodyDetails) => {
        console.log('Original BZZ Url', details.url)
        const urlParams = new URLSearchParams(details.url)
        const query = urlParams.get('oq')

        if (!query || !query.startsWith('bzz://')) return

        this.redirectToBzzReference(query.substr(6), details.tabId)
      },
      {
        urls: ['https://www.google.com/search?*'],
      },
    )

    // Used to load page resources like images
    // Always have to have session ID in the URL Param
    chrome.webRequest.onBeforeRequest.addListener(
      details => {
        let { url } = details
        // extract session Id and remove from the reference
        const swarmSessionId = this.getSwarmSessionIdFromUrl(url)

        if (!swarmSessionId) {
          console.error(`There is no valid '${SWARM_SESSION_ID_KEY}' passed to the bzz reference: ${url}`)

          return {
            cancel: true,
          }
        }
        // Delete swarm session id from the url
        url = removeSwarmSessionIdFromUrl(url)
        // get the full referenced BZZ address from the modified url (without bzz address)
        const urlArray = url.toString().split(`${fakeUrl.bzzProtocol}/`)
        const redirectUrl = `${this._beeApiUrl}/bzz/${urlArray[1]}`
        console.log(`bzz redirect to ${redirectUrl} from ${details.url}. Session ID: ${swarmSessionId}`)

        return {
          redirectUrl,
        }
      },
      { urls: [`${fakeUrl.bzzProtocol}/*`] },
      ['blocking'],
    )

    // Redirect the Bee API calls with swarm-session-id query param
    // The swarm-session-id query parameter can be between the path and the host
    chrome.webRequest.onBeforeRequest.addListener(
      details => {
        let { url } = details
        // extract session Id and remove from the reference
        const swarmSessionId = this.getSwarmSessionIdFromUrl(url)

        if (!swarmSessionId) {
          console.error(`There is no valid '${SWARM_SESSION_ID_KEY}' passed to the bzz reference: ${details.url}`)

          return {
            cancel: true,
          }
        }
        url = removeSwarmSessionIdFromUrl(url)

        // get the full referenced BZZ address from the modified url (without bzz address)
        const urlArray = url.split(`${fakeUrl.beeApiAddress}/`)
        const redirectUrl = `${this._beeApiUrl}/${urlArray[1]}`
        console.log(`Bee API client request redirect to ${redirectUrl} from ${url}`)

        return {
          redirectUrl,
        }
      },
      { urls: [`${fakeUrl.beeApiAddress}*`] },
      ['blocking'],
    )
  }

  /**
   *
   * @param bzzUrl BZZ URL with arbitrary query parameters,  e.g. http://.../1231abcd.../valami.html?swarm-session-id=vmi&smth=5
   * @returns Swarm Session ID string
   */
  private getSwarmSessionIdFromUrl(bzzUrl: string): string | null {
    const queryIndex = bzzUrl.indexOf('?')

    if (queryIndex === -1) return null

    const invalidQueryEnds = bzzUrl.indexOf('/', queryIndex + 1)

    if (invalidQueryEnds !== -1) {
      // the swarm session id must be in the invalid query param
      const invalidQuery = bzzUrl.slice(queryIndex + 1, invalidQueryEnds)
      const sessionIdSplit = invalidQuery.split(`${SWARM_SESSION_ID_KEY}=`)

      if (sessionIdSplit.length !== 2) {
        // if there is no swarm session ID in the invalid query
        // then the request will fail
        return null
      }

      return sessionIdSplit[1]
    }
    // if the process reaches this point, the given url can be handled as with valid query parameter

    return new URL(bzzUrl).searchParams.get(SWARM_SESSION_ID_KEY)
  }

  private async asyncInit() {
    const storedBeeApiUrl = await getItem('beeApiUrl')
    const storedGlobalPostageBatchEnabled = await getItem('globalPostageStampEnabled')
    const storedGlobalPostageBatchId = await getItem('globalPostageBatch')

    if (storedBeeApiUrl) this._beeApiUrl = storedBeeApiUrl

    if (storedGlobalPostageBatchEnabled) this._globalPostageBatchEnabled = storedGlobalPostageBatchEnabled

    if (storedGlobalPostageBatchId) this._globalPostageBatchId = storedGlobalPostageBatchId

    // register listeners that have to be after async init
    this.addBeeNodeListeners(this._beeApiUrl)
  }

  private addStoreListeners(): void {
    this.storeObserver.addListener('beeApiUrl', newValue => {
      console.log('Bee API URL changed to', newValue)
      this._beeApiUrl = newValue
      this.removeBeeNodeListeners()
      this.addBeeNodeListeners(this._beeApiUrl)
    })
    this.storeObserver.addListener('globalPostageStampEnabled', newValue => {
      this._globalPostageBatchEnabled = Boolean(newValue)
    })
    this.storeObserver.addListener('globalPostageBatch', newValue => {
      this._globalPostageBatchId = newValue
    })
  }

  /**
   * Redirects the tab or create a new tab for the dApp under the given BZZ reference
   *
   * @param bzzReference in form of $ROOT_HASH<$PATH><$QUERY>
   * @param tabId the tab will be navigated to the dApp page
   */
  private redirectToBzzReference(bzzReference: string, tabId: number) {
    const url = `${this._beeApiUrl}/bzz/${bzzReference}`

    console.log(`Fake URL redirection to ${url} on tabId ${tabId}`)

    chrome.tabs.update(tabId, { active: true, url })
  }
}
