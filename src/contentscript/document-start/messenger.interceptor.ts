import {
  InpageReqMessageFormat,
  InterceptorReqMessageFormat,
  InterceptorResMessageFormat,
  ResponseMessageFormat,
  ResponseWithMessage,
} from '../../utils/message/message-handler'

export class MessengerInterceptor {
  private readonly inpageOrigin = window.origin !== 'null' ? window.origin : '*'

  constructor() {
    this.serveEvents()
    console.log('message interceptor has been initialized.', this.inpageOrigin)
  }
  serveEvents(): void {
    console.log('Register Web2HelperInterceptor event listeners...')

    window.addEventListener('message', (message: MessageEvent<InpageReqMessageFormat<undefined>>) => {
      if (!this.validInpageMessage(message)) return

      console.log('Web2HelperInterceptor content script got aimed message', message.data)
      const messageToBackground: InterceptorReqMessageFormat = {
        key: message.data.key,
        sessionId: message.data.sessionId,
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

  private validInpageMessage(message: MessageEvent<InpageReqMessageFormat<unknown>>): boolean {
    if (
      message.data.eventId &&
      message.data.key &&
      message.data.target === 'content' &&
      message.data.sender === 'inpage'
    ) {
      return true
    }

    return false
  }

  private deserializeResponseMessage<T>(message: ResponseMessageFormat<T>): ResponseWithMessage<T> {
    if (!message) throw new Error('There is no answer in the response')

    if (message.error) {
      throw new Error(message.error)
    }

    if (!message.answer) {
      throw new Error(`No answer from message handler at key "${message.key}"`)
    }

    return {
      key: message.key,
      answer: message.answer,
      target: 'content',
      sender: 'background',
    }
  }
}
