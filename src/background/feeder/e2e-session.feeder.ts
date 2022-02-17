import { nanoid } from 'nanoid'
import { web2HelperContent } from '../../contentscript/swarm-library/web2-helper.content'
import { DappSessionManager } from '../dapp-session.manager'

enum Action {
  REGISTER = 'register',
  LOCAL_STORAGE_GET = 'localStorage.getItem',
  LOCAL_STORAGE_SET = 'localStorage.setItem',
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
type Web2HelperFakeBeeApiAddressRequesst = Request<Action.WEB2_HELPER_FAKE_BEE_API_ADDRESS, void>
type Web2HelprFakeBzzAddressRequest = Request<Action.WEB2_HELPER_FAKE_BZZ_ADDRESS, { reference: string }>

type RequestType =
  | RegisterRequest
  | LocalStorageGetRequest
  | LocalStorageSetRequest
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
            response.data = web2HelperContent.fakeBeeApiAddress()
          } else if (action === Action.WEB2_HELPER_FAKE_BZZ_ADDRESS) {
            response.data = this.handleWeb2HandlerFakeBzzAddress(request)
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

  // TODO Cannot execute functions from swarm library inside background scripts
  private handleWeb2HandlerFakeBzzAddress(request: RequestType): string {
    const {
      parameters: { reference },
    } = request as Web2HelprFakeBzzAddressRequest

    return web2HelperContent.fakeBzzAddress(reference)
  }
}
