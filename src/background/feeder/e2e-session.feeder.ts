import { nanoid } from 'nanoid'
import { bzzProtocolToFakeUrl } from '../../contentscript/swarm-library/bzz-link'
import { fakeUrl } from '../../utils/fake-url'
import { appendSwarmSessionIdToUrl } from '../../utils/swarm-session-id'
import { DappSessionManager } from '../dapp-session.manager'

enum Action {
  REGISTER = 'register',
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
  eventId?: string
}

interface Response {
  data?: any
  error?: string
}

type RegisterRequest = Request<Action.REGISTER, void>
type BzzLinkProtocolToFakeUrlRequest = Request<Action.BZZ_LINK_PROTOCOL_TO_FAKE_URL, { url: string; newPage: boolean }>
type BzzLinkLinkUrlToFakeUrlRequest = Request<
  Action.BZZ_LINK_LINK_URL_TO_FAKE_URL,
  { bzzLinkUrl: string; newPage: boolean }
>
type BzzLinkUrlToFakeUrlRequest = Request<Action.BZZ_LINK_URL_TO_FAKE_URL, { url: string; newPage: boolean }>
type Web2HelperFakeBeeApiAddressRequesst = Request<Action.WEB2_HELPER_FAKE_BEE_API_ADDRESS, void>
type Web2HelprFakeBzzAddressRequest = Request<Action.WEB2_HELPER_FAKE_BZZ_ADDRESS, { reference: string }>

type RequestType =
  | RegisterRequest
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
      (request: RequestType, sender: chrome.runtime.MessageSender, sendResponse: (response?: Response) => void) => {
        const { action } = request || {}
        const senderId = sender.id as string
        const response: Response = {}

        try {
          if (!senderId) {
            throw new Error('E2E Session Feeder: Extension ID is undefined.')
          }

          if (action === Action.REGISTER) {
            response.data = this.handleRegistration(sender)
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
            throw new Error(`E2E Session Feeder: Unknown action ${action}`)
          }
        } catch (error) {
          response.error = String(error)
        }

        this.handleResponse(response, action, senderId, sendResponse)
      },
    )
  }

  private handleResponse(
    response: Response | null,
    action: Action,
    senderId: string,
    sendResponse: (response?: Response) => void,
  ) {
    if (response?.error) {
      console.warn(
        `E2E Session Feeder: Sending error response for action '${action}' to the extension with ID '${senderId}'.`,
        response.error,
      )
    } else {
      console.log(`E2E Session Feeder: The extension with ID '${senderId}' successfully invoked action '${action}'.`)
    }
    sendResponse(response || {})
  }

  private handleRegistration(sender: chrome.runtime.MessageSender): string {
    const sessionId = nanoid()
    this.manager.register(sessionId, sender)

    return sessionId
  }

  private handleBzzLinkProtocolToFakeUrl(request: RequestType): string | null {
    const {
      sessionId,
      parameters: { url, newPage },
    } = request as BzzLinkProtocolToFakeUrlRequest

    return bzzProtocolToFakeUrl(url, sessionId, newPage)
  }

  private handleBzzLinkUrlToFakeUrl(request: RequestType): string | null {
    const {
      sessionId,
      parameters: { bzzLinkUrl, newPage },
    } = request as BzzLinkLinkUrlToFakeUrlRequest

    return bzzProtocolToFakeUrl(bzzLinkUrl, sessionId, newPage)
  }

  private handleBzzUrlToFakeUrl(request: RequestType): string | null {
    const {
      sessionId,
      parameters: { url, newPage },
    } = request as BzzLinkUrlToFakeUrlRequest

    return bzzProtocolToFakeUrl(url, sessionId, newPage)
  }

  private handleWeb2FakeBeeApiAddress(request: RequestType): string {
    const { sessionId } = request

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
