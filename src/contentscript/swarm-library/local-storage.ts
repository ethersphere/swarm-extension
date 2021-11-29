import { nanoid } from 'nanoid'
import { ILocalStorageMessage } from '../../utils/message/local-storage'
import { InpageReqMessageFormat, InterceptorResMessageFormat } from '../../utils/message/message-handler'
import { MessengerInpage } from './messenger.inpage'

export class LocalStorage extends MessengerInpage implements ILocalStorageMessage {
  public setItem(keyName: string, keyValue: unknown): Promise<void> {
    const message: InpageReqMessageFormat<Parameters<ILocalStorageMessage['setItem']>> = {
      key: 'setItem',
      eventId: nanoid(),
      sender: 'inpage',
      target: 'content',
      sessionId: window.swarm.sessionId,
      payload: [keyName, keyValue],
    }

    return new Promise<void>((resolve, reject) => {
      const handler = (response: MessageEvent<InterceptorResMessageFormat<string>>) => {
        if (!this.validMessage(response, message.eventId)) return

        // Remove listener since this was the response that we were looking for at this point
        window.removeEventListener('message', handler)

        // handle message
        if (response.data.error) reject(response.data.error)

        resolve()
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

  public getItem(keyName: string): Promise<unknown> {
    const message: InpageReqMessageFormat<Parameters<ILocalStorageMessage['getItem']>> = {
      key: 'getItem',
      eventId: nanoid(),
      sender: 'inpage',
      target: 'content',
      sessionId: window.swarm.sessionId,
      payload: [keyName],
    }

    return new Promise<unknown>((resolve, reject) => {
      const handler = (response: MessageEvent<InterceptorResMessageFormat<unknown>>) => {
        if (!this.validMessage(response, message.eventId)) return

        // Remove listener since this was the response that we were looking for at this point
        window.removeEventListener('message', handler)

        // handle message
        if (response.data.error) reject(response.data.error)

        if (response.data.answer === undefined) {
          const errorMessage = `LocalStorage: no answer. EventID: ${response.data.eventId}`
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

export const localStorage = new LocalStorage()
