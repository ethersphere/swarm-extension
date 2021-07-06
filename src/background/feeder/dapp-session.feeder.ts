import { IDappSessionMessage } from '../../utils/message/dapp-session/dapp-session.message'
import { DappSessionManager } from '../dapp-session.manager'
import { isInternalMessage, isTypedMessage } from '../utils'

export class DappSessionFeeder {
  constructor(private manager: DappSessionManager) {
    this.serveEvents()
  }
  serveEvents(): void {
    console.log('Register DappSessionFeeder event listeners...')

    // register dapp session id
    chrome.runtime.onMessage.addListener((message, sender) => {
      if (!isInternalMessage(sender)) return

      if (isTypedMessage<IDappSessionMessage>(message, 'registerDappSession')) {
        this.manager.register(message.payload[0], sender)
      }
    })
  }
}
