import { ErrorWithConsoleLog } from '../../utils/error-with-console-log'
import { DirectMessageReq } from '../../utils/message/message-handler'

export function isInternalMessage(sender: chrome.runtime.MessageSender): boolean {
  return sender.id === chrome.runtime.id
}

export function isTypedMessage<T>(
  message: DirectMessageReq<T, any>,
  method: keyof T,
): message is DirectMessageReq<T, keyof T> {
  if (message.key === method && message.trusted) return true

  return false
}

export function senderTabId(sender: chrome.runtime.MessageSender): number {
  if (!sender.tab?.id) {
    throw new ErrorWithConsoleLog(`DappSession: sender does not have "tab.id" property`, sender)
  }

  return sender.tab.id
}

/** If context is not in iframe it returns back -1 */
export function senderFrameId(sender: chrome.runtime.MessageSender): number {
  if (!sender.frameId) {
    return -1
  }

  return sender.frameId
}

/** Gives back the original content reference of the sender */
export function senderContentOrigin(sender: chrome.runtime.MessageSender): string {
  if (!sender.tab?.url) {
    throw new ErrorWithConsoleLog(`DappSessionFeeder: sender does not have "tab.url" property`, sender)
  }

  return extractContentRoot(sender.tab.url)
}

/** Gives back the frame content reference of the sender */
export function senderFrameOrigin(sender: chrome.runtime.MessageSender): string {
  if (!sender.url) throw new ErrorWithConsoleLog(`DappSessionFeeder: sender does not have "url" property`, sender)

  return extractContentRoot(sender.url)
}

export function extractContentRoot(url: string): string {
  const urlParts = url.split('/') // http(s)://{bee-client-host}/bzz/{>content-root<}(/whatever)

  if (urlParts.length < 4 || urlParts[2] === 'bzz') {
    throw new Error(`DappSessionFeeder: source URL is not a valid content refence ${url}`)
  }

  // TODO: check configurated bee api/debug address
  return urlParts[4]
}
