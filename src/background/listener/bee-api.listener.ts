import { createSubdomainUrl, hashToCid, isLocalhost, subdomainToBzzResource } from '../../utils/bzz-link'
import { fakeUrl } from '../../utils/fake-url'
import { getItem, StoreObserver } from '../../utils/storage'
import { DEFAULT_BEE_API_ADDRESS } from '../constants/addresses'

const bzzGoogleRedirectRegex = '^https\\:\\/\\/www\\.google\\.com\\/search\\?.*o?q=bzz%3A%2F%2F([^\\&]+).*'

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
  protected static BEE_API_BLOCKER_ID = 6
  protected static BEE_API_REDIRECT_ID = 7
  protected static BZZ_GOOGLE_BLOCKER_ID = 8
  protected static BZZ_GOOGLE_REDIRECT_ID = 9

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

    chrome.declarativeNetRequest.updateSessionRules(
      {
        removeRuleIds: [
          BeeApiListener.BZZ_LINK_BLOCKER_ID,
          BeeApiListener.RESOURCE_LOADER_BLOCKER_ID,
          BeeApiListener.RESOURCE_LOADER_REDIRECT_ID,
          BeeApiListener.BEE_API_BLOCKER_ID,
          BeeApiListener.BEE_API_REDIRECT_ID,
          BeeApiListener.BZZ_GOOGLE_BLOCKER_ID,
          BeeApiListener.BZZ_GOOGLE_REDIRECT_ID,
        ],
        addRules: [
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
          {
            id: BeeApiListener.BZZ_LINK_BLOCKER_ID,
            priority: 1,
            condition: {
              regexFilter: '^(https?\\://)?.*\\.bzz\\.link/.*',
              resourceTypes: BeeApiListener.RESOURCE_TYPE_ALL,
            },
            action: {
              type: chrome.declarativeNetRequest.RuleActionType.BLOCK,
            },
          },
          {
            id: BeeApiListener.RESOURCE_LOADER_BLOCKER_ID,
            priority: 1,
            condition: {
              regexFilter: fakeUrl.bzzProtocolRegex,
              resourceTypes: BeeApiListener.RESOURCE_TYPE_ALL,
            },
            action: {
              type: chrome.declarativeNetRequest.RuleActionType.BLOCK,
            },
          },
          // Used to load page resources like images
          // Always have to have session ID in the URL Param
          {
            id: BeeApiListener.RESOURCE_LOADER_REDIRECT_ID,
            priority: 2,
            condition: {
              regexFilter: fakeUrl.bzzProtocolRegexWithKey,
              resourceTypes: BeeApiListener.RESOURCE_TYPE_ALL,
            },
            action: {
              type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
              redirect: {
                regexSubstitution: `${this._beeApiUrl}/bzz/\\1`,
              },
            },
          },
          {
            id: BeeApiListener.BEE_API_BLOCKER_ID,
            priority: 1,
            condition: {
              regexFilter: fakeUrl.beeApiAddressRegex,
              resourceTypes: BeeApiListener.RESOURCE_TYPE_ALL,
            },
            action: {
              type: chrome.declarativeNetRequest.RuleActionType.BLOCK,
            },
          },
          {
            // Redirect the Bee API calls with swarm-session-id query param
            // The swarm-session-id query parameter can be between the path and the host
            id: BeeApiListener.BEE_API_REDIRECT_ID,
            priority: 2,
            condition: {
              regexFilter: fakeUrl.beeApiAddressRegexWithKey,
              resourceTypes: BeeApiListener.RESOURCE_TYPE_ALL,
            },
            action: {
              type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
              redirect: {
                regexSubstitution: `${this._beeApiUrl}/\\2`,
              },
            },
          },
          {
            id: BeeApiListener.BZZ_GOOGLE_BLOCKER_ID,
            priority: 1,
            condition: {
              regexFilter: bzzGoogleRedirectRegex,
              resourceTypes: BeeApiListener.RESOURCE_TYPE_ALL,
            },
            action: {
              type: chrome.declarativeNetRequest.RuleActionType.BLOCK,
            },
          },
          // 'bzz://{content-address}' URI in search bar triggers redirect to gateway BZZ address
          // NOTE: works only if google search is set as default search engine
          {
            id: BeeApiListener.BZZ_GOOGLE_REDIRECT_ID,
            priority: 2,
            condition: {
              regexFilter: bzzGoogleRedirectRegex,
              resourceTypes: BeeApiListener.RESOURCE_TYPE_ALL,
            },
            action: {
              type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
              redirect: {
                regexSubstitution: `${this._beeApiUrl}/bzz/\\1`,
              },
            },
          },
        ],
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
  }

  private addStoreListeners(): void {
    this.storeObserver.addListener('beeApiUrl', newValue => {
      console.log('Bee API URL changed to', newValue)
      this._beeApiUrl = newValue
      this.setBeeNodeListeners()
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
      const [hash, path] = bzzReference.split(/\/(.*)/s)
      let subdomain = hash

      if (subdomain.endsWith('.eth')) {
        subdomain = subdomain.substring(0, subdomain.length - 4)
      }

      url = createSubdomainUrl(this._beeApiUrl, hashToCid(subdomain).toString())

      if (path) {
        url += `/${path}`
      }
    }

    console.log(`Fake URL redirection to ${url} on tabId ${tabId}`)

    chrome.tabs.update(tabId, { active: true, url })
  }
}
