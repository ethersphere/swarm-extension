import { IWeb2HelperMessage } from '../../utils/message/web2-helper/web2-helper.message'
import { InterceptorResMessageFormat, InpageReqMessageFormat } from '../../utils/message/message-handler'
import { nanoid } from 'nanoid'

export class Web2HelperInpage implements IWeb2HelperMessage {
  public beeApiUrl(): Promise<string> {
    const message: InpageReqMessageFormat<undefined> = {
      key: 'beeApiUrl',
      eventId: nanoid(),
      sender: 'inpage',
      target: 'content',
    }

    return new Promise<string>((resolve, reject) => {
      const handler = (response: MessageEvent<InterceptorResMessageFormat<string>>) => {
        // validate message
        if (
          response.origin !== location.origin ||
          response.source !== window ||
          message.eventId !== response.data.eventId ||
          response.data.target !== 'inpage' ||
          response.data.sender !== 'content' ||
          !response.data
        ) {
          return
        }

        // Remove listener since this was the response that we were looking for at this point
        window.removeEventListener('message', handler)

        // handle message
        if (response.data.error) reject(response.data.error)

        if (response.data.answer === undefined) {
          console.error('bad responseeee', response)
          reject(`Web2Helper inpage request failed. It didn't get any answer. ID: ${response.data.eventId}`)
        } else {
          resolve(response.data.answer)
        }
      }

      window.addEventListener('message', handler)
      window.postMessage(message, '*') //TODO message to local window
    })
  }
}