import { IDappSessionMessage } from '../../utils/message/dapp-session/dapp-session.message'
import { DirectMessageReq } from '../../utils/message/message-handler'

export function dappSessionRegister(sessionId: string): void {
  const messageToBackground: DirectMessageReq<IDappSessionMessage, 'registerDappSession'> = {
    key: 'registerDappSession',
    payload: [sessionId],
    trusted: true,
  }

  chrome.runtime.sendMessage(messageToBackground)
}
