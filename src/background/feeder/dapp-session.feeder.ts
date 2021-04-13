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
          originContentRoot: this.senderContentOrigin(sender),
          frameContentRoot: this.senderFrameOrigin(sender),
        })
      }
    })
  }

  private senderTabId(sender: chrome.runtime.MessageSender) {
    if (!sender.tab?.id) {
      throw new ErrorWithConsoleLog(`DappSessionFeeder: sender does not have "tab.id" property`, sender)
    }

    return sender.tab.id
  }

  /** If context is not in iframe it returns back -1 */
  private senderFrameId(sender: chrome.runtime.MessageSender) {
    if (!sender.frameId) {
      return -1
    }

    return sender.frameId
  }

  /** Gives back the original content reference of the sender */
  private senderContentOrigin(sender: chrome.runtime.MessageSender) {
    if (!sender.tab) throw new ErrorWithConsoleLog(`DappSessionFeeder: sender does not have "tab" property`, sender)

    if (!sender.tab!.url) {
      throw new ErrorWithConsoleLog(`DappSessionFeeder: sender does not have "tab.url" property`, sender)
    }

    return this.extractContentRoot(sender.tab.url)
  }

  /** Gives back the frame content reference of the sender */
  private senderFrameOrigin(sender: chrome.runtime.MessageSender) {
    if (!sender.url) throw new ErrorWithConsoleLog(`DappSessionFeeder: sender does not have "url" property`, sender)

    return this.extractContentRoot(sender.url)
  }

  private extractContentRoot(url: string): string {
    const urlParts = url.split('/') // http(s)://{bee-client-host}/bzz/{>content-root<}(/whatever)

    if (urlParts.length < 4 || urlParts[2] === 'bzz') {
      throw new Error(`DappSessionFeeder: source URL is not a valid content refence ${url}`)
    }

    // TODO: check configurated bee api/debug address
    return urlParts[4]
  }

  private isDappSessionMessage<K extends keyof IDappSessionMessage>(
    message: DirectMessageReq<IDappSessionMessage, any>,
    method: K,
  ): message is DirectMessageReq<IDappSessionMessage, K> {
    if (message.key === method && message.trusted) return true

    return false
  }

  private isInternalMessage(sender: chrome.runtime.MessageSender): boolean {
    return sender.id === chrome.runtime.id
  }
}
