import { InterceptorReqMessageFormat, ResponseMessageFormat } from '../../utils/message/message-handler'
import { BeeApiListener } from '../listener/bee-api.listener'

export class Web2HelperFeeder {
  constructor(private beeApiListener: BeeApiListener) {
    this.serveEvents()
  }
  serveEvents(): void {
    console.log('Register Web2HelperFeeder event listeners...')
    //TODO check only for internal message?

    chrome.runtime.onMessage.addListener((message: InterceptorReqMessageFormat<string>, sender, sendResponse) => {
      if (message.key === 'beeApiUrl') {
        console.log('Web2HelperFeeder:beeApiUrl got aimed message from content script', message)
        const response: ResponseMessageFormat = {
          key: message.key,
          sender: 'background',
          target: 'content',
          answer: this.beeApiListener.beeApiUrl,
        }
        sendResponse(response)
      }
    })
  }
}
