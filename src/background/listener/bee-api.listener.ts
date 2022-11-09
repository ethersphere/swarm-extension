import { createSubdomainUrl, hashToCid, isLocalhost, subdomainToBzzResource } from '../../utils/bzz-link'
import { fakeUrl } from '../../utils/fake-url'
import { getItem, StoreObserver } from '../../utils/storage'
import { DEFAULT_BEE_API_ADDRESS } from '../constants/addresses'

const bzzGoogleRedirectRegex = '^https\\:\\/\\/www\\.google\\.com\\/search\\?.*o?q=bzz%3A%2F%2F([^\\&]+).*'
const bzzSubdomainGoogleRedirectRegex =
  '^https\\:\\/\\/www\\.google\\.com\\/search\\?.*o?q=bzz%3A%2F%2F(.*)\\.eth([^\\&]*).*'

const bzzDuckDuckGoRedirectRegex = '^https\\:\\/\\/duckduckgo\\.com\\/?\\?.*q=bzz%3A%2F%2F([^\\&]+).*'
const bzzSubdomainDuckDuckGoRedirectRegex =
  '^https\\:\\/\\/duckduckgo\\.com\\/?\\?.*q=bzz%3A%2F%2F(.*)\\.eth([^\\&]*).*'

const bzzYahooRedirectRegex = '^https\\:\\/\\/search\\.yahoo\\.com\\/search\\?.*p=bzz%3A%2F%2F([^\\&]+).*'
const bzzSubdomainYahooRedirectRegex =
  '^https\\:\\/\\/search\\.yahoo\\.com\\/search\\?.*p=bzz%3A%2F%2F(.*)\\.eth([^\\&]*).*'

const bzzBingRedirectRegex = '^https\\:\\/\\/www\\.bing\\.com\\/search\\?.*q=bzz%3A%2F%2F([^\\&]+).*'
const bzzSubdomainBingRedirectRegex = '^https\\:\\/\\/www\\.bing\\.com\\/search\\?.*q=bzz%3A%2F%2F(.*)\\.eth([^\\&]*).*'

export class BeeApiListener {
  private _beeApiUrl: string
  private _globalPostageBatchEnabled: boolean
  private _globalPostageBatchId: string
  private _web2OriginEnabled: boolean

  protected static POSTAGE_BATCH_RULE_ID = 1
  protected static WEB2_ORIGIN_RULE_ID = 2
  protected static BZZ_LINK_BLOCKER_ID = 3
  protected static RESOURCE_LOADER_BLOCKER_ID = 4
  protected static RESOURCE_LOADER_REDIRECT_ID = 5
  protected static RESOURCE_SUBDOMAIN_LOADER_BLOCKER_ID = 6
  protected static RESOURCE_SUBDOMAIN_LOADER_REDIRECT_ID = 7
  protected static BEE_API_BLOCKER_ID = 8
  protected static BEE_API_REDIRECT_ID = 9
  protected static BZZ_GOOGLE_BLOCKER_ID = 10
  protected static BZZ_GOOGLE_REDIRECT_ID = 11
  protected static BZZ_DUCKDUCKGO_BLOCKER_ID = 12
  protected static BZZ_DUCKDUCKGO_REDIRECT_ID = 13
  protected static BZZ_YAHOO_BLOCKER_ID = 14
  protected static BZZ_YAHOO_REDIRECT_ID = 15
  protected static BZZ_BING_BLOCKER_ID = 16
  protected static BZZ_BING_REDIRECT_ID = 17

  protected static RESOURCE_TYPE_ALL = [
    chrome.declarativeNetRequest.ResourceType.MAIN_FRAME,
    chrome.declarativeNetRequest.ResourceType.SUB_FRAME,
    chrome.declarativeNetRequest.ResourceType.STYLESHEET,
    chrome.declarativeNetRequest.ResourceType.SCRIPT,
    chrome.declarativeNetRequest.ResourceType.IMAGE,
    chrome.declarativeNetRequest.ResourceType.FONT,
    chrome.declarativeNetRequest.ResourceType.OBJECT,
    chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST,
    chrome.declarativeNetRequest.ResourceType.MEDIA,
    chrome.declarativeNetRequest.ResourceType.WEBSOCKET,
    chrome.declarativeNetRequest.ResourceType.OTHER,
  ]

  public constructor(private storeObserver: StoreObserver) {
    this._beeApiUrl = DEFAULT_BEE_API_ADDRESS
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

  private createBlockerRule(id: number, regexFilter: string, priority = 1): chrome.declarativeNetRequest.Rule {
    return {
      id,
      priority,
      condition: {
        regexFilter,
        resourceTypes: BeeApiListener.RESOURCE_TYPE_ALL,
      },
      action: {
        type: chrome.declarativeNetRequest.RuleActionType.BLOCK,
      },
    }
  }

  private createRedirectionRule(
    id: number,
    regexFilter: string,
    regexSubstitution: string,
    priority = 2,
  ): chrome.declarativeNetRequest.Rule {
    return {
      id,
      priority,
      condition: {
        regexFilter,
        resourceTypes: BeeApiListener.RESOURCE_TYPE_ALL,
      },
      action: {
        type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
        redirect: {
          regexSubstitution,
        },
      },
    }
  }

  private processSearchEngineRequest(
    searchParamNames: string | string[],
    details: chrome.webRequest.WebRequestBodyDetails,
  ) {
    console.log('Original BZZ Url', details.url)

    const urlParams = new URLSearchParams(new URL(details.url).search)

    const query = (Array.isArray(searchParamNames) ? searchParamNames : [searchParamNames])
      .map(paramName => decodeURI(urlParams.get(paramName) || ''))
      .find(value => value)

    if (!query || !query.startsWith('bzz://')) return

    this.redirectToBzzReference(query.substring(6), details.tabId)
  }

  private getSearchEngineRedirectionRegex(protocol: string, host: string, isLocalhost: boolean): string {
    return isLocalhost ? `${protocol}://\\1.swarm.${host}\\2` : `${this._beeApiUrl}/bzz/\\1`
  }

  private setBeeNodeListeners() {
    const rules: chrome.declarativeNetRequest.Rule[] = []

    /**
     * Handles postage batch id header replacement with global batch id
     */
    if (this._globalPostageBatchEnabled) {
      rules.push({
        id: BeeApiListener.POSTAGE_BATCH_RULE_ID,
        condition: {
          urlFilter: `${this._beeApiUrl}/*`,
          resourceTypes: BeeApiListener.RESOURCE_TYPE_ALL,
        },
        action: {
          type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
          requestHeaders: [
            {
              header: 'swarm-postage-batch-id',
              operation: chrome.declarativeNetRequest.HeaderOperation.SET,
              value: this._globalPostageBatchId,
            },
          ],
        },
      })
    }

    if (!this._web2OriginEnabled) {
      rules.push({
        id: BeeApiListener.WEB2_ORIGIN_RULE_ID,
        condition: {
          urlFilter: `${this._beeApiUrl}/bzz/*`,
          resourceTypes: BeeApiListener.RESOURCE_TYPE_ALL,
          excludedRequestDomains: ['swarm.localhost'],
        },
        action: {
          type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
          responseHeaders: [
            {
              header: 'Content-Security-Policy',
              operation: chrome.declarativeNetRequest.HeaderOperation.SET,
              value: 'sandbox allow-scripts allow-modals allow-popups allow-forms',
            },
          ],
        },
      })
    }

    chrome.declarativeNetRequest.updateSessionRules(
      {
        removeRuleIds: [BeeApiListener.POSTAGE_BATCH_RULE_ID, BeeApiListener.WEB2_ORIGIN_RULE_ID],
        addRules: rules,
      },
      () => {
        console.log('Bee node listeners updated')
      },
    )
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
        this.processSearchEngineRequest(['oq', 'q'], details)
      },
      {
        urls: ['https://www.google.com/search?*'],
      },
    )

    chrome.webRequest.onBeforeRequest.addListener(
      (details: chrome.webRequest.WebRequestBodyDetails) => {
        this.processSearchEngineRequest('q', details)
      },
      {
        urls: ['https://duckduckgo.com/?*'],
      },
    )

    chrome.webRequest.onBeforeRequest.addListener(
      (details: chrome.webRequest.WebRequestBodyDetails) => {
        this.processSearchEngineRequest('p', details)
      },
      {
        urls: ['https://search.yahoo.com/search?*'],
      },
    )

    chrome.webRequest.onBeforeRequest.addListener(
      (details: chrome.webRequest.WebRequestBodyDetails) => {
        this.processSearchEngineRequest('q', details)
      },
      {
        urls: ['https://www.bing.com/search?*'],
      },
    )

    /**
     * {contentReference}.bzz.link has two ways to request:
     *
     * 1. typing to address bar
     * 2. can be referred from dApp
     */

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
  }

  private setDeclarativeBzzListeners() {
    const isHostLocalhost = isLocalhost(this._beeApiUrl)
    const [protocol, host] = this._beeApiUrl.split('://')
    const searchEngineRedirectionRegex = this.getSearchEngineRedirectionRegex(protocol, host, isHostLocalhost)

    const addRules: chrome.declarativeNetRequest.Rule[] = [
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
      this.createBlockerRule(BeeApiListener.BZZ_LINK_BLOCKER_ID, '^(https?\\://)?.*\\.bzz\\.link/.*'),
      this.createBlockerRule(BeeApiListener.RESOURCE_LOADER_BLOCKER_ID, fakeUrl.bzzProtocolRegex),
      // Used to load page resources like images
      // Always have to have session ID in the URL Param
      this.createRedirectionRule(
        BeeApiListener.RESOURCE_LOADER_REDIRECT_ID,
        fakeUrl.bzzProtocolRegexWithKey,
        `${this._beeApiUrl}/bzz/\\1`,
      ),
      this.createBlockerRule(BeeApiListener.BEE_API_BLOCKER_ID, fakeUrl.beeApiAddressRegex),
      // Redirect the Bee API calls with swarm-session-id query param
      // The swarm-session-id query parameter can be between the path and the host
      this.createRedirectionRule(
        BeeApiListener.BEE_API_REDIRECT_ID,
        fakeUrl.beeApiAddressRegexWithKey,
        `${this._beeApiUrl}/\\2`,
      ),
      this.createBlockerRule(
        BeeApiListener.BZZ_GOOGLE_BLOCKER_ID,
        isHostLocalhost ? bzzSubdomainGoogleRedirectRegex : bzzGoogleRedirectRegex,
      ),
      // 'bzz://{content-address}' URI in search bar triggers redirect to gateway BZZ address
      // NOTE: works only if google search is set as default search engine
      this.createRedirectionRule(
        BeeApiListener.BZZ_GOOGLE_REDIRECT_ID,
        isHostLocalhost ? bzzSubdomainGoogleRedirectRegex : bzzGoogleRedirectRegex,
        searchEngineRedirectionRegex,
      ),
      this.createBlockerRule(
        BeeApiListener.BZZ_DUCKDUCKGO_BLOCKER_ID,
        isHostLocalhost ? bzzSubdomainDuckDuckGoRedirectRegex : bzzDuckDuckGoRedirectRegex,
      ),
      this.createRedirectionRule(
        BeeApiListener.BZZ_DUCKDUCKGO_REDIRECT_ID,
        isHostLocalhost ? bzzSubdomainDuckDuckGoRedirectRegex : bzzDuckDuckGoRedirectRegex,
        searchEngineRedirectionRegex,
      ),
      this.createBlockerRule(
        BeeApiListener.BZZ_YAHOO_BLOCKER_ID,
        isHostLocalhost ? bzzSubdomainYahooRedirectRegex : bzzYahooRedirectRegex,
      ),
      this.createRedirectionRule(
        BeeApiListener.BZZ_YAHOO_REDIRECT_ID,
        isHostLocalhost ? bzzSubdomainYahooRedirectRegex : bzzYahooRedirectRegex,
        searchEngineRedirectionRegex,
      ),
      this.createBlockerRule(
        BeeApiListener.BZZ_BING_BLOCKER_ID,
        isHostLocalhost ? bzzSubdomainBingRedirectRegex : bzzBingRedirectRegex,
      ),
      this.createRedirectionRule(
        BeeApiListener.BZZ_BING_REDIRECT_ID,
        isHostLocalhost ? bzzSubdomainBingRedirectRegex : bzzBingRedirectRegex,
        searchEngineRedirectionRegex,
      ),
    ]

    if (isHostLocalhost) {
      addRules.push(
        this.createBlockerRule(BeeApiListener.RESOURCE_SUBDOMAIN_LOADER_BLOCKER_ID, fakeUrl.bzzSubdomainProtocolRegex),
      )

      // Used to load page resources like images
      // Always have to have session ID in the URL Param
      addRules.push(
        this.createRedirectionRule(
          BeeApiListener.RESOURCE_SUBDOMAIN_LOADER_REDIRECT_ID,
          fakeUrl.bzzSubdomainProtocolRegexWithKey,
          `${protocol}://\\1.swarm.${host}\\2`,
        ),
      )
    }

    chrome.declarativeNetRequest.updateSessionRules(
      {
        removeRuleIds: [
          BeeApiListener.BZZ_LINK_BLOCKER_ID,
          BeeApiListener.RESOURCE_LOADER_BLOCKER_ID,
          BeeApiListener.RESOURCE_LOADER_REDIRECT_ID,
          BeeApiListener.RESOURCE_SUBDOMAIN_LOADER_BLOCKER_ID,
          BeeApiListener.RESOURCE_SUBDOMAIN_LOADER_REDIRECT_ID,
          BeeApiListener.BEE_API_BLOCKER_ID,
          BeeApiListener.BEE_API_REDIRECT_ID,
          BeeApiListener.BZZ_GOOGLE_BLOCKER_ID,
          BeeApiListener.BZZ_GOOGLE_REDIRECT_ID,
          BeeApiListener.BZZ_DUCKDUCKGO_BLOCKER_ID,
          BeeApiListener.BZZ_DUCKDUCKGO_REDIRECT_ID,
          BeeApiListener.BZZ_YAHOO_BLOCKER_ID,
          BeeApiListener.BZZ_YAHOO_REDIRECT_ID,
          BeeApiListener.BZZ_BING_BLOCKER_ID,
          BeeApiListener.BZZ_BING_REDIRECT_ID,
        ],
        addRules,
      },
      () => {
        console.log('Bzz listeners set')
      },
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
    this.setBeeNodeListeners()
    this.setDeclarativeBzzListeners()
  }

  private addStoreListeners(): void {
    this.storeObserver.addListener('beeApiUrl', newValue => {
      console.log('Bee API URL changed to', newValue)
      this._beeApiUrl = newValue
      this.setBeeNodeListeners()
      this.setDeclarativeBzzListeners()
    })
    this.storeObserver.addListener('globalPostageStampEnabled', async newValue => {
      this._globalPostageBatchEnabled = Boolean(newValue)
      this._globalPostageBatchId = (await getItem('globalPostageBatch')) as string
      this.setBeeNodeListeners()
    })
    this.storeObserver.addListener('globalPostageBatch', newValue => {
      this._globalPostageBatchId = newValue
    })
    this.storeObserver.addListener<boolean>('web2OriginEnabled', newValue => {
      console.log('web2OriginEnabled changed to', newValue)
      this._web2OriginEnabled = newValue
      this.setBeeNodeListeners()
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

    if (!isLocalhost(this._beeApiUrl)) {
      url = `${this._beeApiUrl}/bzz/${bzzReference}`
    } else {
      let pathChar = '/'
      let [hash, path] = bzzReference.split(/\/(.*)/s)

      if (!path) {
        const parts = bzzReference.split(/\#(.*)/s)
        hash = parts[0]
        path = parts[1]
        pathChar = '#'
      }
      let subdomain = hash

      if (subdomain.endsWith('.eth')) {
        subdomain = subdomain.substring(0, subdomain.length - 4)
      }

      url = createSubdomainUrl(this._beeApiUrl, hashToCid(subdomain).toString())

      if (path) {
        url += `${pathChar}${path}`
      }
    }

    console.log(`Fake URL redirection to ${url} on tabId ${tabId}`)

    chrome.tabs.update(tabId, { active: true, url })
  }
}
