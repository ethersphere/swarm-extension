import {
  InpageReqMessageFormat,
  InterceptorReqMessageFormat,
  InterceptorResMessageFormat,
} from '../../utils/message/message-handler'
import { MessengerInterceptor } from './messenger.interceptor'

export class Web2HelperInterceptor extends MessengerInterceptor {
  constructor() {
    super()
    this.serveEvents()
  }
  serveEvents(): void {
    console.log('Register Web2HelperInterceptor event listeners...')

    window.addEventListener('message', (message: MessageEvent<InpageReqMessageFormat<undefined>>) => {
      if (
        message.data === undefined ||
        !message.data.eventId ||
        !message.data.key ||
        message.data.sender !== 'inpage' ||
        message.data.target !== 'content'
      ) {
        return
      }

      console.log('Web2HelperInterceptor content script got aimed message', message.data)
      const messageToBackground: InterceptorReqMessageFormat = {
        key: message.data.key,
        sender: 'content',
        target: 'background',
      }
      const messageToInpage: InterceptorResMessageFormat<string> = {
        key: message.data.key,
        eventId: message.data.eventId,
        sender: 'content',
        target: 'inpage',
      }
      chrome.runtime.sendMessage(messageToBackground, response => {
        try {
          const responseMessage = this.deserializeResponseMessage<string>(response)

          messageToInpage.answer = responseMessage.answer
          window.postMessage(messageToInpage, this.inpageOrigin)
        } catch (e) {
          messageToInpage.error = e.message
          console.error('Web2HelperInterceptor Error', messageToInpage.error)
          window.postMessage(messageToInpage, this.inpageOrigin)
        }
      })
    })
  }
}
