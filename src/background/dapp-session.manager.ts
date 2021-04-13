class DappSecurityContext {
  public constructor(
    private tabId: number,
    private frameId: number,
    private frameContentRoot: string,
    private originContentRoot: string,
  ) {}
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
      frameContentRoot: string
      originContentRoot: string
    },
  ): void {
    const { tabId, frameId, frameContentRoot, originContentRoot } = sender
    this.securityContexts[sessionId] = new DappSecurityContext(tabId, frameId, frameContentRoot, originContentRoot)
    console.log(`dApp session "${sessionId}" has been initialized`, this.securityContexts[sessionId])
  }
}
