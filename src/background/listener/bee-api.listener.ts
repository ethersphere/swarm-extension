import { getItem, StoreObserver } from '../../utils/storage'
import { fakeUrl } from '../../utils/fake-url'
import { subdomainToBzzResource } from '../../utils/bzz-link'

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

  protected static RESOURCE_TYPE_ALL = [
    'main_frame',
    'sub_frame',
    'stylesheet',
    'script',
    'image',
    'font',
    'object',
    'xmlhttprequest',
    'media',
    'websocket',
  ]
  constructor(private storeObserver: StoreObserver) {
    this._beeApiUrl = 'http://localhost:1633'
    this._globalPostageBatchEnabled = true
    this._web2OriginEnabled = true
    this._globalPostageBatchId = 'undefined' // it is not necessary to check later, if it is enabled it will insert
    this.addStoreListeners()
    this.asyncInit()
    this.setBeeNodeListeners()
    this.addBzzListeners()
  }

  private setBeeNodeListeners() {
    const rules = []

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
          type: 'modifyHeaders',
          requestHeaders: [
            {
              header: 'swarm-postage-batch-id',
              operation: 'set',
              value: this._globalPostageBatchId,
            },
          ],
        },
      })
    }

    if (this._web2OriginEnabled) {
      rules.push({
        id: BeeApiListener.WEB2_ORIGIN_RULE_ID,
        condition: {
          urlFilter: `${this._beeApiUrl}/bzz/*`,
          resourceTypes: BeeApiListener.RESOURCE_TYPE_ALL,
        },
        action: {
          type: 'modifyHeaders',
          responseHeaders: [
            {
              header: 'Content-Security-Policy',
              operation: 'set',
              value: 'sandbox allow-scripts allow-modals allow-popups allow-forms',
            },
          ],
        },
      })
    }

    (chrome as any).declarativeNetRequest.updateSessionRules(
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

    /**
     * this listener automatically cancels all requests towards .bzz.link URLs
     * it relates to the 2nd scenario
     */
    ;(chrome as any).declarativeNetRequest.updateSessionRules(
      {
        removeRuleIds: [
          BeeApiListener.BZZ_LINK_BLOCKER_ID,
          BeeApiListener.RESOURCE_LOADER_BLOCKER_ID,
          BeeApiListener.RESOURCE_LOADER_REDIRECT_ID,
          BeeApiListener.BEE_API_BLOCKER_ID,
          BeeApiListener.BEE_API_REDIRECT_ID,
        ],
        addRules: [
          {
            id: BeeApiListener.BZZ_LINK_BLOCKER_ID,
            priority: 1,
            condition: {
              regexFilter: '^(https?\\://)?.*\\.bzz\\.link/.*',
              resourceTypes: ['main_frame'],
            },
            action: {
              type: 'block',
            },
          },
          {
            id: BeeApiListener.RESOURCE_LOADER_BLOCKER_ID,
            priority: 1,
            condition: {
              regexFilter: fakeUrl.createRE2Pattern('bzz'),
              resourceTypes: ['main_frame'],
            },
            action: {
              type: 'block',
            },
          },
          {
            id: BeeApiListener.RESOURCE_LOADER_REDIRECT_ID,
            priority: 2,
            condition: {
              regexFilter: fakeUrl.createRE2Pattern('bzz', true),
              resourceTypes: ['main_frame'],
            },
            action: {
              type: 'redirect',
              redirect: {
                regexSubstitution: `${this._beeApiUrl}/\\2\\3`,
              },
            },
          },
          {
            id: BeeApiListener.BEE_API_BLOCKER_ID,
            priority: 1,
            condition: {
              regexFilter: fakeUrl.createRE2Pattern('bee-api'),
              resourceTypes: ['main_frame'],
            },
            action: {
              type: 'block',
            },
          },
          {
            // Redirect the Bee API calls with swarm-session-id query param
            // The swarm-session-id query parameter can be between the path and the host
            id: BeeApiListener.BEE_API_REDIRECT_ID,
            priority: 2,
            condition: {
              regexFilter: fakeUrl.createRE2Pattern('bee-api', true),
              resourceTypes: ['main_frame'],
            },
            action: {
              type: 'redirect',
              redirect: {
                regexSubstitution: `${this._beeApiUrl}/\\2\\3`,
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
  }

  private addStoreListeners(): void {
    this.storeObserver.addListener('beeApiUrl', newValue => {
      console.log('Bee API URL changed to', newValue)
      this._beeApiUrl = newValue
      this.setBeeNodeListeners()
    })
    this.storeObserver.addListener('globalPostageStampEnabled', newValue => {
      this._globalPostageBatchEnabled = Boolean(newValue)
      this.setBeeNodeListeners()
    })
    this.storeObserver.addListener('globalPostageBatch', newValue => {
      this._globalPostageBatchId = newValue
      this.setBeeNodeListeners()
    })
    this.storeObserver.addListener<boolean>('web2OriginEnabled', newValue => {
      console.log('web2OriginEnabled changed to', newValue)
      this.setBeeNodeListeners()
      this._web2OriginEnabled = newValue
      this.setBeeNodeListeners()
    })
  }

  private redirectToBzzReference(bzzReference: string, tabId: number) {
    const url = `${this._beeApiUrl}/bzz/${bzzReference}`

    console.log(`Fake URL redirection to ${url} on tabId ${tabId}`)

    chrome.tabs.update(tabId, { active: true, url })
  }
}
