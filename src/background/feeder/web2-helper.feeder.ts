import { ResponseMessageFormat, SendMessageFormat } from '../../utils/message/message-handler'
import { BeeApiListener } from '../listener/bee-api.listener'

export class Web2HelperFeeder {
  constructor(private beeApiListener: BeeApiListener) {
    this.serveEvents()
  }
  serveEvents(): void {
    console.log('Register Web2HelperFeeder event listeners...')

    chrome.runtime.onMessage.addListener((message: SendMessageFormat<string>) => {
      if (message.key === 'beeApiUrl') {
        const response: ResponseMessageFormat = {
          key: 'beeApiUrl',
          answer: this.beeApiListener.beeApiUrl,
        }
        console.log('beeApiUrlRequest', response)

        return Promise.resolve(response)
      }
    })
  }
}
