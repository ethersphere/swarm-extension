import { InpageReqMessageFormat, ResponseMessageFormat, ResponseWithMessage } from '../../utils/message/message-handler'

export class MessengerInterceptor {
  protected readonly inpageOrigin = window.location.origin

  protected validInpageMessage(message: MessageEvent<InpageReqMessageFormat<unknown>>): boolean {
    if (
      message.data.eventId ||
      message.data.key ||
      message.data.target === 'content' ||
      message.data.sender === 'inpage'
    ) {
      return true
    }

    return false
  }

  protected deserializeResponseMessage<T>(message: ResponseMessageFormat<T>): ResponseWithMessage<T> {
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
