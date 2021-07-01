import { senderContentOrigin, senderFrameId, senderFrameOrigin, senderTabId } from './utils'

class DappSecurityContext {
  public constructor(
    private tabId: number,
    private frameId: number,
    private frameContentRoot: string,
    private originContentRoot: string,
  ) {}

  public isValidTabId(tabId: number): boolean {
    return tabId === this.tabId
  }
  public isValidFrameId(frameId: number): boolean {
    return frameId === this.frameId
  }

  public isFrameContentRoot(frameContentRoot: string): boolean {
    return frameContentRoot === this.frameContentRoot
  }

  public isValidOriginContentRoot(originContentRoot: string): boolean {
    return originContentRoot === this.originContentRoot
  }
}

export class DappSessionManager {
  private securityContexts: { [sessionId: string]: DappSecurityContext }

  public constructor() {
    this.securityContexts = {}
  }
  public register(sessionId: string, sender: chrome.runtime.MessageSender): void {
    const tabId = senderTabId(sender)
    const frameId = senderFrameId(sender)
    const frameContentRoot = senderFrameOrigin(sender)
    const originContentRoot = senderContentOrigin(sender)

    this.securityContexts[sessionId] = new DappSecurityContext(tabId, frameId, frameContentRoot, originContentRoot)
    console.log(`dApp session "${sessionId}" has been initialized`, this.securityContexts[sessionId])
  }

  /**
   * Checks the given sessionId and sender's data match with the DappSessionManager's records
   */
  public isValidSession(sessionId: string, sender: chrome.runtime.MessageSender): boolean {
    const context = this.securityContexts[sessionId]

    if (!context) return false

    const tabId = senderTabId(sender)
    const frameId = senderFrameId(sender)
    const frameContentRoot = senderFrameOrigin(sender)
    const originContentRoot = senderContentOrigin(sender)

    console.log(`tabid ${tabId} frameId ${frameId} frameconte ${frameContentRoot} originCon ${originContentRoot}`)

    return (
      context.isValidTabId(tabId) &&
      context.isValidFrameId(frameId) &&
      context.isFrameContentRoot(frameContentRoot) &&
      context.isValidOriginContentRoot(originContentRoot)
    )
  }
}
