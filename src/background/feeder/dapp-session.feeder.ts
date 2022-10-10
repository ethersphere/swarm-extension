import { IDappSessionMessage } from '../../utils/message/dapp-session/dapp-session.message'
import { InterceptorReqMessageFormat } from '../../utils/message/message-handler'
import { MessageKeys } from '../constants/message-keys.enum'
import { DappSessionManager } from '../dapp-session.manager'
import { isInternalMessage, isTypedMessage } from '../utils'

export class DappSessionFeeder {
  constructor(private manager: DappSessionManager) {
    this.serveEvents()
  }
  serveEvents(): void {
    console.log('Register DappSessionFeeder event listeners...')

    // register dapp session id
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (!isInternalMessage(sender)) return

      if (isTypedMessage<IDappSessionMessage>(message, MessageKeys.REGISTER)) {
        this.register(message as unknown as InterceptorReqMessageFormat, sender, sendResponse)

        return true
      }
    })
  }

  public async register(
    message: InterceptorReqMessageFormat,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void,
  ): Promise<void> {
    try {
      await this.manager.register(message.payload[0], sender)

      sendResponse({ answer: true })
    } catch (error) {
      sendResponse({ error: 'Error while registering new session' })
    }
  }
}
