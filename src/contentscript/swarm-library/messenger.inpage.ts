import { InterceptorResMessageFormat } from '../../utils/message/message-handler'

export class MessengerInpage {
  protected readonly contentPageOrigin = window.origin

  protected validMessage(response: MessageEvent<InterceptorResMessageFormat<unknown>>, eventId: string): boolean {
    if (
      response.origin === this.contentPageOrigin &&
      response.source === window &&
      eventId === response.data.eventId &&
      response.data &&
      response.data.target === 'inpage' &&
      response.data.sender === 'content'
    ) {
      return true
    }

    return false
  }
}
