import { nanoid } from 'nanoid'
import { fakeUrl } from '../../utils/fake-url'
import { InpageReqMessageFormat, InterceptorResMessageFormat } from '../../utils/message/message-handler'
import { IWeb2HelperMessage } from '../../utils/message/web2-helper/web2-helper.message'
import { appendSwarmSessionIdToUrl } from '../../utils/swarm-session-id'
import { MessengerInpage } from './messenger.inpage'

export class Web2HelperContent extends MessengerInpage implements IWeb2HelperMessage {
  /** The real Bee API address that shouldn't be called directly by dApps */
  public beeApiUrl(): Promise<string> {
    const message: InpageReqMessageFormat<undefined> = {
      key: 'beeApiUrl',
      eventId: nanoid(),
      sender: 'inpage',
      target: 'content',
    }

    return this.messageHandler<string>(message, 'Web2Helper')
  }

  /**
   * Checks whether configured Bee API is available
   */
  public isBeeApiAvailable(): Promise<boolean> {
    const message: InpageReqMessageFormat<undefined> = {
      key: 'isBeeApiAvailable',
      eventId: nanoid(),
      sender: 'inpage',
      target: 'content',
    }

    return this.messageHandler<boolean>(message, 'Web2Helper')
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
    return appendSwarmSessionIdToUrl(`${fakeUrl.bzzProtocol}/${reference}`, window.swarm.sessionId)
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
    return appendSwarmSessionIdToUrl(fakeUrl.beeApiAddress, window.swarm.sessionId)
  }
}

export const web2HelperContent = new Web2HelperContent()
