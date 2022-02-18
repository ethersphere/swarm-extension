import { nanoid } from 'nanoid'
import { bzzProtocolToFakeUrl } from '../../contentscript/swarm-library/bzz-link'
import { fakeUrl } from '../../utils/fake-url'
import { appendSwarmSessionIdToUrl } from '../../utils/swarm-session-id'
import { DappSessionManager } from '../dapp-session.manager'

enum Action {
  REGISTER = 'register',
  LOCAL_STORAGE_GET = 'localStorage.getItem',
  LOCAL_STORAGE_SET = 'localStorage.setItem',
  BZZ_LINK_PROTOCOL_TO_FAKE_URL = 'bzzLink.bzzProtocolToFakeUrl',
  BZZ_LINK_LINK_URL_TO_FAKE_URL = 'bzzLink.bzzLinkUrlToFakeUrl',
  BZZ_LINK_URL_TO_FAKE_URL = 'bzzLink.urlToFakeUrl',
  WEB2_HELPER_FAKE_BEE_API_ADDRESS = 'web2Helper.fakeBeeApiAddress',
  WEB2_HELPER_FAKE_BZZ_ADDRESS = 'web2Helper.fakeBzzAddress',
}

interface Request<A extends Action, P> {
  action: A
  sessionId: string
  parameters: P
}

interface Response {
  data?: any
  error?: string
}

type RegisterRequest = Request<Action.REGISTER, void>
type LocalStorageGetRequest = Request<Action.LOCAL_STORAGE_GET, { name: string }>
type LocalStorageSetRequest = Request<Action.LOCAL_STORAGE_SET, { name: string; value: unknown }>
type BzzLinkProtocolToFakeUrlRequest = Request<Action.BZZ_LINK_PROTOCOL_TO_FAKE_URL, { url: string, newPage: boolean }>
type BzzLinkLinkUrlToFakeUrlRequest = Request<Action.BZZ_LINK_LINK_URL_TO_FAKE_URL, { bzzLinkUrl: string, newPage: boolean }>
type BzzLinkUrlToFakeUrlRequest = Request<Action.BZZ_LINK_URL_TO_FAKE_URL, { url: string, newPage: boolean }>
type Web2HelperFakeBeeApiAddressRequesst = Request<Action.WEB2_HELPER_FAKE_BEE_API_ADDRESS, void>
type Web2HelprFakeBzzAddressRequest = Request<Action.WEB2_HELPER_FAKE_BZZ_ADDRESS, { reference: string }>

type RequestType =
  | RegisterRequest
  | LocalStorageGetRequest
  | LocalStorageSetRequest
  | BzzLinkProtocolToFakeUrlRequest
  | BzzLinkLinkUrlToFakeUrlRequest
  | BzzLinkUrlToFakeUrlRequest
  | Web2HelperFakeBeeApiAddressRequesst
  | Web2HelprFakeBzzAddressRequest

export class E2ESessionFeeder {
  constructor(private manager: DappSessionManager) {
    this.serveEvents()
  }

  serveEvents(): void {
    console.log('Register E2ESessionFeeder event listeners...')

    // register dapp session id
    chrome.runtime.onMessageExternal.addListener(
      async (
        request: RequestType,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: Response) => void,
      ) => {
        const { action } = request || {}
        const senderId = sender.id as string
        const response: Response = {}

        try {
          if (!senderId) {
            throw new Error('Invalid extension ID')
          }

          if (action === Action.REGISTER) {
            response.data = this.handleRegistration(sender)
          } else if (action === Action.LOCAL_STORAGE_GET) {
            response.data = await this.handleLocalStorageGet(request)
          } else if (action === Action.LOCAL_STORAGE_SET) {
            await this.handleLocalStorageSet(request)
          } else if (action === Action.WEB2_HELPER_FAKE_BEE_API_ADDRESS) {
            response.data = this.handleWeb2FakeBeeApiAddress(request)
          } else if (action === Action.WEB2_HELPER_FAKE_BZZ_ADDRESS) {
            response.data = this.handleWeb2FakeBzzAddress(request)
          } else if (action === Action.BZZ_LINK_PROTOCOL_TO_FAKE_URL) {
            response.data = this.handleBzzLinkProtocolToFakeUrl(request)
          } else if (action === Action.BZZ_LINK_LINK_URL_TO_FAKE_URL) {
            response.data = this.handleBzzLinkUrlToFakeUrl(request)
          } else if (action === Action.BZZ_LINK_URL_TO_FAKE_URL) {
            response.data = this.handleBzzUrlToFakeUrl(request)
          } else {
            throw new Error(`Unknown action ${action}`)
          }
        } catch (error) {
          response.error = String(error)
        }

        this.sendResponse(response, action, senderId, sendResponse)
      },
    )
  }

  private sendResponse(
    response: Response | null,
    action: Action,
    senderId: string,
    sendResponse: (response?: Response) => void,
  ) {
    if (response?.error) {
      console.warn(
        `Sending error response for action '${action}' to the extension with ID '${senderId}'.`,
        response.error,
      )
    } else {
      console.log(`The extension with ID '${senderId}' successfully invoked action '${action}'.`)
    }
    sendResponse(response || {})
  }

  private handleRegistration(sender: chrome.runtime.MessageSender): string {
    const sessionId = nanoid()
    this.manager.register(sessionId, sender)

    return sessionId
  }

  private handleLocalStorageGet(request: RequestType): Promise<unknown> {
    const {
      sessionId,
      parameters: { name },
    } = request as LocalStorageGetRequest

    if (!name) {
      throw new Error('Cannot get item from localStorage. Item name required')
    }

    return this.manager.getStorageItem(sessionId, name)
  }

  private handleLocalStorageSet(request: RequestType): Promise<void> {
    const {
      sessionId,
      parameters: { name, value },
    } = request as LocalStorageSetRequest

    if (!name) {
      throw new Error('Cannot get item from localStorage. Item name required')
    }

    return this.manager.setStorageItem(sessionId, name, value)
  }

  private handleBzzLinkProtocolToFakeUrl(request: RequestType): string | null {
    const { sessionId, parameters: { url, newPage }} = request as BzzLinkProtocolToFakeUrlRequest
    return bzzProtocolToFakeUrl(url, sessionId, newPage)
  }

  private handleBzzLinkUrlToFakeUrl(request: RequestType): string | null {
    const { sessionId, parameters: { bzzLinkUrl, newPage }} = request as BzzLinkLinkUrlToFakeUrlRequest
    return bzzProtocolToFakeUrl(bzzLinkUrl, sessionId, newPage)
  } 

  private handleBzzUrlToFakeUrl(request: RequestType): string | null {
    const { sessionId, parameters: { url, newPage }} = request as BzzLinkUrlToFakeUrlRequest
    return bzzProtocolToFakeUrl(url, sessionId, newPage)
  } 

  private handleWeb2FakeBeeApiAddress(request: RequestType): string {
    const { sessionId } = request;
    return appendSwarmSessionIdToUrl(fakeUrl.beeApiAddress, sessionId)
  }

  private handleWeb2FakeBzzAddress(request: RequestType): string {
    const {
      sessionId,
      parameters: { reference },
    } = request as Web2HelprFakeBzzAddressRequest

    return appendSwarmSessionIdToUrl(`${fakeUrl.bzzProtocol}/${reference}`, sessionId)
  }
}
