class DappSecurityContext {
  public constructor(private tabId: number, private frameId: number) {}
}

export class DappSessionManager {
  private securityContexts: { [sessionId: string]: DappSecurityContext }

  public constructor() {
    this.securityContexts = {}
  }
  public register(
    sessionId: string,
    sender: {
      tabId: number
      frameId: number
    },
  ): void {
    const { tabId, frameId } = sender
    this.securityContexts[sessionId] = new DappSecurityContext(tabId, frameId)
    console.log(`dApp session "${sessionId}" has been initialized`)
  }
}
