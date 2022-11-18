import { nanoid } from 'nanoid'
import { getItem } from '../../utils/storage'
import { DEFAULT_BEE_API_ADDRESS, DEFAULT_BEE_DEBUG_API_ADDRESS } from '../constants/addresses'
import { MessageKeys } from '../constants/message-keys.enum'
import { DappSessionManager } from '../dapp-session.manager'

interface Request<A extends MessageKeys, P> {
  action: A
  sessionId: string
  parameters: P
  eventId: string
}

interface Response {
  data?: any
  error?: string
}

type RegisterRequest = Request<MessageKeys.REGISTER, void>
type Web2HelperBeeAddress = Request<MessageKeys.BEE_API_URLS, void>

type RequestType = RegisterRequest | Web2HelperBeeAddress

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
            throw new Error('E2E Session Feeder: Extension ID is undefined.')
          }

          if (action === MessageKeys.REGISTER) {
            response.data = this.handleRegistration(sender)
          } else if (action === MessageKeys.BEE_API_URLS) {
            response.data = await this.handleWeb2BeeAddress()
          } else if (action === MessageKeys.ECHO) {
            response.data = request.parameters
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
    action: MessageKeys,
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

  private async handleWeb2BeeAddress(): Promise<{ beeApiUrl: string; beeDebugApiUrl: string }> {
    const [beeApiUrl, beeDebugApiUrl] = await Promise.all([getItem('beeApiUrl'), getItem('beeDebugApiUrl')])

    return {
      beeApiUrl: beeApiUrl || DEFAULT_BEE_API_ADDRESS,
      beeDebugApiUrl: beeDebugApiUrl || DEFAULT_BEE_DEBUG_API_ADDRESS,
    }
  }
}
