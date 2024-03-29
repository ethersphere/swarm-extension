import { InterceptorReqMessageFormat, ResponseMessageFormat } from '../../utils/message/message-handler'
import { getItem } from '../../utils/storage'
import { MessageKeys } from '../constants/message-keys.enum'

export class PostageBatchFeeder {
  constructor() {
    this.serveEvents()
  }
  serveEvents(): void {
    console.log('Register PostageBatchFeeder event listeners...')

    chrome.runtime.onMessage.addListener((message: InterceptorReqMessageFormat<string>, sender, sendResponse) => {
      if (message.key === MessageKeys.IS_GLOBAL_POSTAGE_BATCH_ENABLED) {
        console.log('PostageBatchFeeder:isGlobalPostageBatchEnabled got aimed message from content script', message)

        const response: ResponseMessageFormat = {
          key: message.key,
          sender: 'background',
          target: 'content',
        }

        getItem('globalPostageBatch')
          .then(value => {
            response.answer = Boolean(value)
          })
          .catch(e => {
            response.error = String(e)
          })
          .finally(() => {
            sendResponse(response)
          })

        return true
      }
    })
  }
}
