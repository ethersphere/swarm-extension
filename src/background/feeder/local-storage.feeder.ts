import { InterceptorReqMessageFormat, ResponseMessageFormat } from '../../utils/message/message-handler'
import { DappSessionManager } from '../dapp-session.manager'
import { isInternalMessage } from '../utils'

export class LocalStorageFeeder {
  constructor(private manager: DappSessionManager) {
    this.serveEvents()
  }
  serveEvents(): void {
    console.log('Register LocalStorageFeeder event listeners...')

    chrome.runtime.onMessage.addListener((message: InterceptorReqMessageFormat, sender, sendResponse) => {
      if (!isInternalMessage(sender)) return

      const { sessionId, key, payload } = message

      if (!sessionId || !this.manager.isValidSession(sessionId, sender)) return

      const response: ResponseMessageFormat = {
        key: message.key,
        sender: 'background',
        target: 'content',
      }

      switch (key) {
        case 'setItem':
          // payload: Parameters<ILocalStorageMessage['setItem']>
          console.log(`LocalStorageFeeder: store set -> ${payload}`)
          sendResponse(response)
          break
        case 'getItem':
          // payload: Parameters<ILocalStorageMessage['getItem']>
          console.log(`LocalStorageFeeder: store get -> ${payload}`)
          response.answer = 'Here it is!'
          sendResponse(response)
          break
        default:
          return
      }
    })
  }
}
