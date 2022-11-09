import { ResponseMessageFormat } from '../../utils/message/message-handler'
import { MessageKeys } from '../constants/message-keys.enum'

export class DebugFeeder {
  constructor() {
    this.serveEvents()
  }
  serveEvents(): void {
    console.log('Register DebugFeeder event listeners...')

    // register dapp session id
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      const { key, payload } = message

      if (key === MessageKeys.ECHO) {
        const response: ResponseMessageFormat = {
          key: MessageKeys.ECHO,
          sender: 'background',
          target: 'content',
          answer: payload,
        }

        return sendResponse(response)
      }
    })
  }
}
