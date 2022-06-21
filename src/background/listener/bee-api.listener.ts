import { createSubdomainUrl, isHostIpAddress, subdomainToBzzResource } from '../../utils/bzz-link'
import { fakeUrl } from '../../utils/fake-url'
import { getItem, StoreObserver } from '../../utils/storage'
import { SWARM_SESSION_ID_KEY, unpackSwarmSessionIdFromUrl } from '../../utils/swarm-session-id'

export class BeeApiListener {
  private _beeApiUrl: string
  private _globalPostageBatchEnabled: boolean
  private _globalPostageBatchId: string
  private _web2OriginEnabled: boolean

  public constructor(private storeObserver: StoreObserver) {
    this._beeApiUrl = 'http://127.0.0.1:1633'
    this._globalPostageBatchEnabled = false
    this._web2OriginEnabled = false
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

    try {
      const postageBatchIdHeader = details.requestHeaders.find(
        header => header.name.toLowerCase() === 'swarm-postage-batch-id',
      )

      if (!postageBatchIdHeader) return

      console.log(
        `Postage Batch: ${this._globalPostageBatchId} Batch ID will be used instead of ` + postageBatchIdHeader.value,
      )

      postageBatchIdHeader.value = this._globalPostageBatchId

      return { requestHeaders: details.requestHeaders }
    } catch (e) {
      console.error(`request header error problem`, e, details.requestHeaders)

      return
    }
  }

  private sandboxListener = (
    details: chrome.webRequest.WebResponseHeadersDetails,
  ): void | chrome.webRequest.BlockingResponse => {
    console.log('web2OriginEnabled', this._web2OriginEnabled)

    if (this._web2OriginEnabled) return { responseHeaders: details.responseHeaders }

    const urlArray = details.url.toString().split('/')

    if (urlArray[3] === 'bzz' && urlArray[4]) {
      details.responseHeaders?.push({
        name: 'Content-Security-Policy',
        value: 'sandbox allow-scripts allow-modals allow-popups allow-forms',
      })
    }
    console.log('responseHeaders', details.responseHeaders)

    return { responseHeaders: details.responseHeaders }
  }

  private addBeeNodeListeners(beeApiUrl: string) {
    chrome.webRequest.onBeforeSendHeaders.addListener(
      this.globalPostageStampHeaderListener,
      {
        urls: [`${beeApiUrl}/*`],
      },
      ['blocking', 'requestHeaders'],
    )
    chrome.webRequest.onHeadersReceived.addListener(
      this.sandboxListener,
      {
        urls: [`${beeApiUrl}/*`],
      },
      ['blocking', 'responseHeaders', 'extraHeaders'],
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

    /**
     * {contentReference}.bzz.link has two ways to request:
     *
     * 1. typing to address bar
     * 2. can be referred from dApp
     */

    /**
     * this listener automatically cancels all requests towards .bzz.link URLs
     * it relates to the 2nd scenario
     */
    chrome.webRequest.onBeforeRequest.addListener(
      () => {
        return { cancel: true }
      },
      { urls: ['https://*.bzz.link/*', 'http://*.bzz.link/*'] },
    )

    /**
     * it force-redirects to the fakeURL of the bzz resource.
     * it solves the 1st scenario
     */
    chrome.webNavigation.onBeforeNavigate.addListener(
      details => {
        const { url, tabId } = details
        const urlObject = new URL(url)
        const subdomain = urlObject.host.split('.')[0]
        const pathWithParams = url.substring(urlObject.origin.length)
        const bzzReference = subdomainToBzzResource(subdomain) + pathWithParams
        console.log('bzz link redirect', bzzReference, url, pathWithParams)

        this.redirectToBzzReference(bzzReference, tabId)
      },
      { url: [{ hostSuffix: '.bzz.link' }] },
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

        let swarmSessionId: string
        try {
          const { sessionId, originalUrl } = unpackSwarmSessionIdFromUrl(url)
          swarmSessionId = sessionId
          url = originalUrl
        } catch (e) {
          console.error(`There is no valid '${SWARM_SESSION_ID_KEY}' passed to the bzz reference: ${url}`)

          return {
            cancel: true,
          }
        }
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

        try {
          const { originalUrl } = unpackSwarmSessionIdFromUrl(url)
          url = originalUrl
        } catch (e) {
          console.error(`There is no valid '${SWARM_SESSION_ID_KEY}' passed to the bzz reference: ${url}`)

          return {
            cancel: true,
          }
        }

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

  private async asyncInit() {
    const storedBeeApiUrl = await getItem('beeApiUrl')
    const storedGlobalPostageBatchEnabled = await getItem('globalPostageStampEnabled')
    const storedGlobalPostageBatchId = await getItem('globalPostageBatch')
    const storedWeb2OriginEnabled = await getItem('web2OriginEnabled')

    if (storedBeeApiUrl) this._beeApiUrl = storedBeeApiUrl

    if (storedGlobalPostageBatchEnabled) this._globalPostageBatchEnabled = storedGlobalPostageBatchEnabled

    if (storedGlobalPostageBatchId) this._globalPostageBatchId = storedGlobalPostageBatchId

    if (storedWeb2OriginEnabled) this._web2OriginEnabled = storedWeb2OriginEnabled

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
    this.storeObserver.addListener<boolean>('web2OriginEnabled', newValue => {
      console.log('web2OriginEnabled changed to', newValue)
      this._web2OriginEnabled = newValue
    })
  }

  /**
   * Redirects the tab or create a new tab for the dApp under the given BZZ reference
   *
   * @param bzzReference in form of $ROOT_HASH<$PATH><$QUERY>
   * @param tabId the tab will be navigated to the dApp page
   */
  private redirectToBzzReference(bzzReference: string, tabId: number) {
    let url: string

    if (isHostIpAddress(this._beeApiUrl)) {
      const [hash, path] = bzzReference.split(/\/(.*)/s)
      let subdomain = hash

      if (subdomain.endsWith('.eth')) {
        subdomain = subdomain.substring(0, subdomain.length - 4)
      }

      url = createSubdomainUrl(this._beeApiUrl, subdomain) + path
    } else {
      url = `${this._beeApiUrl}/bzz/${bzzReference}`
    }

    console.log(`Fake URL redirection to ${url} on tabId ${tabId}`)

    chrome.tabs.update(tabId, { active: true, url })
  }
}
