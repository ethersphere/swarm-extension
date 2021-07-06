import { senderContentOrigin, senderFrameId, senderFrameOrigin, senderTabId } from './utils'

type LocalStorage = {
  set: (storeValues: { [key: string]: unknown }, callback?: () => void) => void
  get: (storeValues: string[], callback: (result: { [key: string]: unknown }) => void) => void
}

class DappSecurityContext {
  private readonly storage: LocalStorage
  private readonly storePrefix: string
  public constructor(
    private tabId: number,
    private frameId: number,
    private frameContentRoot: string,
    private originContentRoot: string,
  ) {
    this.storage = chrome.storage.local
    this.storePrefix = this.frameContentRoot
      ? `${this.originContentRoot}:${this.frameContentRoot}`
      : this.originContentRoot
  }

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

  /** STORAGE FUNCTIONS */

  public setStorageItem(keyName: string, keyValue: unknown): Promise<void> {
    const key = this.enrichStorageKey(keyName)

    return new Promise(resolve => this.storage.set({ [key]: keyValue, resolve }))
  }

  public getStorageItem(keyName: string): Promise<unknown> {
    const key = this.enrichStorageKey(keyName)

    return new Promise((resolve, reject) =>
      this.storage.get([key], result => {
        console.log('result', result)

        if (!result[key]) {
          reject(`LocalStorage: ${key} does not exist`)
        }
        resolve(result[key])
      }),
    )
  }

  private enrichStorageKey(keyName: string): string {
    return `${this.storePrefix}-${keyName}`
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

  public getStorageItem(
    sessionId: string,
    ...getStorageParams: Parameters<DappSecurityContext['getStorageItem']>
  ): ReturnType<DappSecurityContext['getStorageItem']> {
    const context = this.getSecurityContext(sessionId)

    return context.getStorageItem(...getStorageParams)
  }

  public async setStorageItem(
    sessionId: string,
    ...setStorageParams: Parameters<DappSecurityContext['setStorageItem']>
  ): Promise<void> {
    const context = this.getSecurityContext(sessionId)

    await context.setStorageItem(...setStorageParams)
  }

  private getSecurityContext(sessionId: string): DappSecurityContext {
    const securityContext = this.securityContexts[sessionId]

    if (!securityContext) {
      throw new Error(`DappSessionManager: There is no registered security context for session: ${sessionId}`)
    }

    return securityContext
  }
}
