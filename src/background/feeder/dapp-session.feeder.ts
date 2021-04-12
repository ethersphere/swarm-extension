/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ErrorWithConsoleLog } from '../../utils/error-with-console-log'
import { IDappSessionMessage } from '../../utils/message/dapp-session/dapp-session.message'
import { DirectMessageReq } from '../../utils/message/message-handler'
import { DappSessionManager } from '../dapp-session.manager'

export class DappSessionFeeder {
  constructor(private manager: DappSessionManager) {
    this.serveEvents()
  }
  serveEvents(): void {
    console.log('Register DappSessionFeeder event listeners...')

    chrome.runtime.onMessage.addListener((message, sender) => {
      if (!this.isInternalMessage(sender)) return

      if (this.isDappSessionMessage(message, 'registerDappSession')) {
        this.manager.register(message.payload[0], {
          tabId: this.senderTabId(sender),
          frameId: this.senderFrameId(sender),
        })
      }
    })
  }

  private senderTabId(sender: chrome.runtime.MessageSender) {
    if (!sender.tab) throw new ErrorWithConsoleLog(`DappSessionFeeder: sender does not have "tab" property`, sender)

    if (!sender.tab!.id) {
      throw new ErrorWithConsoleLog(`DappSessionFeeder: sender does not have "tab.id" property`, sender)
    }

    return sender.tab.id
  }

  private senderFrameId(sender: chrome.runtime.MessageSender) {
    if (!sender.frameId) {
      throw new ErrorWithConsoleLog(`DappSessionFeeder: sender does not have "frameId" property`, sender)
    }

    return sender.frameId
  }

  private isDappSessionMessage<K extends keyof IDappSessionMessage>(
    message: DirectMessageReq<IDappSessionMessage, any>,
    method: K,
  ): message is DirectMessageReq<IDappSessionMessage, K> {
    if (message.key === method && message.trusted) return true

    return false
  }

  private isInternalMessage(sender: chrome.runtime.MessageSender): boolean {
    if (sender.id === chrome.runtime.id) return true

    return false
  }
}
