import { fakeUrl } from '../utils/fake-url'
import { IWeb2HelperMessage } from '../model/web2-helper.interface'
import { appendSwarmSessionIdToUrl } from '../utils/swarm-session-id'
import { SwarmMessages } from '../messages/swarm-messages'

export class Web2HelperContent implements IWeb2HelperMessage {

  constructor(private messages: SwarmMessages) {}
  /** The real Bee API address that shouldn't be called directly by dApps */
  public beeApiUrl(): Promise<string> {
    return this.messages.sendMessage<string>('beeApiUrl')
  }

  public beeApiUrls(): Promise<{ beeApiUrl: string; beeDebugApiUrl: string }> {
    return this.messages.sendMessage('beeApiUrls')
  }

  /**
   * Checks whether configured Bee API is available
   */
  public isBeeApiAvailable(): Promise<boolean> {
    return this.messages.sendMessage<boolean>('isBeeApiAvailable')
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
    return appendSwarmSessionIdToUrl(`${fakeUrl.bzzProtocol}/${reference}`, this.messages.sessionId as string)
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
    return appendSwarmSessionIdToUrl(fakeUrl.beeApiAddress, this.messages.sessionId as string)
  }
}
