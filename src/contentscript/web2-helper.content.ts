import { IWeb2HelperMessage } from '../utils/message/web2-helper/web2-helper.message'
import { InterceptorResMessageFormat, InpageReqMessageFormat } from '../utils/message/message-handler'
import { nanoid } from 'nanoid'
import { MessengerInpage } from './swarm-library/messenger.inpage'
import { fakeUrl } from '../utils/fake-url'
import { appendSwarmSessionId } from '../utils/swarm-session-id'

export class Web2HelperContent extends MessengerInpage implements IWeb2HelperMessage {
  /** The real Bee API address that shouldn't be called directly by dApps */
  public beeApiUrl(): Promise<string> {
    const message: InpageReqMessageFormat<undefined> = {
      key: 'beeApiUrl',
      eventId: nanoid(),
      sender: 'inpage',
      target: 'content',
    }

    return new Promise<string>((resolve, reject) => {
      const handler = (response: MessageEvent<InterceptorResMessageFormat<string>>) => {
        if (!this.validMessage(response, message.eventId)) return

        // Remove listener since this was the response that we were looking for at this point
        window.removeEventListener('message', handler)

        // handle message
        if (response.data.error) reject(response.data.error)

        if (response.data.answer === undefined) {
          const errorMessage = `Web2Helper inpage request failed. It didn't get any answer. ID: ${response.data.eventId}`
          console.error(errorMessage, response)
          reject(errorMessage)
        } else {
          resolve(response.data.answer)
        }
      }

      window.addEventListener('message', handler)
      const origin = window.origin !== 'null' ? window.origin : '*'
      window.postMessage(message, origin)
    })
  }

  /**
   * Fake URL which will be forwarded to `bzz` endpoint of the Bee client
   *
   * Currently web+bzz://* references in HTML files will be
   * forwarded to this address.
   * Can be placed in src|href tags of DOM elements
   * It appends the corresponding keys on the requests.
   *
   * @param reference requested content hash (with optional `path` and other bzz protocol specific params)
   * @returns Fake URL pointing to the BZZ endpoint of the Bee client
   */
  public fakeBzzAddress(reference: string): string {
    return appendSwarmSessionId(`${fakeUrl.bzzProtocol}/${reference}`)
  }

  /**
   * Fake Bee API URL that appends corresponding keys on requests
   *
   * Any Bee API path can be appended to the end of the returned address.
   * Later could be serve from a protocol like `swarm-bee://*` or `dweb://*.swarm-bee`
   *
   * @returns Fake Bee API URL that is directly callable from dApp side
   */
  public fakeBeeApiAddress(): string {
    return appendSwarmSessionId(fakeUrl.beeApiAddress)
  }
}

export const web2HelperContent = new Web2HelperContent()
