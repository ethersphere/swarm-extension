import { SwarmMessages } from './messages/swarm-messages'
import { createSwarmMessages } from './messages/swarm-messages.factory'
import { SessionId } from './model/general.types'
import { LocalStorage } from './services/local-storage'
import { BzzLink } from './services/bzz-link'
import { PostageBatch } from './services/postage-batch'
import { Web2HelperContent } from './services/web2-helper.content'

/**
 * Interface of the Swarm browser extension
 * This class can be used inside of a web page or service worker script
 */
export class Swarm {
  private messages: SwarmMessages

  public bzzLink: BzzLink

  public localStorage: LocalStorage

  public postageBatch: PostageBatch

  public web2Helper: Web2HelperContent
  /**
   *
   * @param extensionId The Swarm extension ID
   */
  constructor(extensionId = 'afpgelfcknfbbfnipnomfdbbnbbemnia') {
    this.messages = createSwarmMessages(extensionId)
    this.bzzLink = new BzzLink()
    this.localStorage = new LocalStorage(this.messages)
    this.postageBatch = new PostageBatch(this.messages)
    this.web2Helper = new Web2HelperContent(this.messages)
  }

  public get sessionId(): SessionId | undefined {
    return this.messages.sessionId
  }

  public register(): Promise<SessionId> {
    return this.messages.checkRegistration()
  }

  public closeConnection() {
    this.messages.closeConnection()
  }
}
