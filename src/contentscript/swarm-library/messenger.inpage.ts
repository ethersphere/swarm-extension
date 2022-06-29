import { InpageReqMessageFormat, InterceptorResMessageFormat } from '../../utils/message/message-handler'

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

  protected messageHandler<Response>(
    message: InpageReqMessageFormat<unknown>,
    handlerClass: string,
  ): Promise<Response> {
    return new Promise<Response>((resolve, reject) => {
      const handler = (response: MessageEvent<InterceptorResMessageFormat<Response>>) => {
        if (!this.validMessage(response, message.eventId)) return

        // Remove listener since this was the response that we were looking for at this point
        window.removeEventListener('message', handler)

        // handle message
        if (response.data.error) reject(response.data.error)

        if (response.data.answer === undefined) {
          const errorMessage = `${handlerClass} inpage request failed. It didn't get any answer. ID: ${response.data.eventId}`
          console.error(errorMessage, response)
          reject(errorMessage)
        } else {
          resolve(response.data.answer)
        }
      }

      window.addEventListener('message', handler)
      /**
       * TODO: target by app origin
       * origin is null because of the sandbox
       */
      const origin = '*'
      window.postMessage(message, origin)
    })
  }
}
