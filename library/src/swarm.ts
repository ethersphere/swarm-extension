import { SwarmMessages } from './messages/swarm-messages'
import { createSwarmMessages } from './messages/swarm-messages.factory'
import { SessionId } from './model/general.types'
import { LocalStorage } from './services/local-storage'
import { BzzLink } from './services/bzz-link'
import { PostageBatch } from './services/postage-batch'
import { Web2HelperContent } from './services/web2-helper.content'
import { register, sessionId } from './services/session'

/**
 * Interface of the Swarm browser extension
 * This class can be used inside of a web page or service worker script
 */
export class Swarm {
  private messages: SwarmMessages

  public readonly sessionId: SessionId

  public readonly bzzLink: BzzLink

  public readonly localStorage: LocalStorage

  public readonly postageBatch: PostageBatch

  public readonly web2Helper: Web2HelperContent
  /**
   *
   * @param extensionId The Swarm extension ID
   */
  constructor(extensionId = 'afpgelfcknfbbfnipnomfdbbnbbemnia') {
    this.sessionId = sessionId
    this.messages = createSwarmMessages(extensionId, this.sessionId)
    this.bzzLink = new BzzLink()
    this.localStorage = new LocalStorage(this.messages)
    this.postageBatch = new PostageBatch(this.messages)
    this.web2Helper = new Web2HelperContent(this.messages)
  }

  public register(): Promise<void> {
    return register()
  }

  /**
   * Test function, to check communication with the extension
   * @param data Any data
   * @returns The same data
   */
  public echo<Data>(data: Data): Promise<Data> {
    return this.messages.sendMessage<Data>('echo', data)
  }

  public closeConnection() {
    this.messages.closeConnection()
  }
}
