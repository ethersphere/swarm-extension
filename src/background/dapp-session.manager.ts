import { getItem, setItem } from '../utils/storage'
import { DappSecurityContextData } from './data/DappSecurityContextData'
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
    this.storePrefix = this.frameContentRoot || this.originContentRoot
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

  public async setStorageItem(keyName: string, keyValue: unknown): Promise<void> {
    const key = this.enrichStorageKey(keyName)

    await new Promise(resolve => this.storage.set({ [key]: keyValue }, () => resolve(true)))
  }

  public getStorageItem(keyName: string): Promise<unknown> {
    const key = this.enrichStorageKey(keyName)

    return new Promise(resolve =>
      this.storage.get([key], result => {
        resolve(result[key])
      }),
    )
  }

  private enrichStorageKey(keyName: string): string {
    return `${this.storePrefix}-${keyName}`
  }
}

type SecurityContextDataMap = { [sessionId: string]: DappSecurityContextData }

export class DappSessionManager {
  private securityContextsPromise: Promise<SecurityContextDataMap> | null = null

  constructor() {
    chrome.runtime.onSuspend.addListener(() => {
      setItem('securityContexts', {})
    })
  }

  public async register(sessionId: string, sender: chrome.runtime.MessageSender): Promise<void> {
    const tabId = senderTabId(sender)
    const frameId = senderFrameId(sender)
    const frameContentRoot = senderFrameOrigin(sender)
    const originContentRoot = senderContentOrigin(sender)

    const context: DappSecurityContextData = {
      tabId,
      frameId,
      frameContentRoot,
      originContentRoot,
    }

    await this.setSecurityContext(sessionId, context)

    console.log(`dApp session "${sessionId}" has been initialized`, context)
  }

  /**
   * Checks the given sessionId and sender's data match with the DappSessionManager's records
   */
  public async isValidSession(sessionId: string, sender: chrome.runtime.MessageSender): Promise<boolean> {
    const context = await this.getSecurityContext(sessionId)

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

  public async getStorageItem(
    sessionId: string,
    ...getStorageParams: Parameters<DappSecurityContext['getStorageItem']>
  ): ReturnType<DappSecurityContext['getStorageItem']> {
    const context = await this.getSecurityContext(sessionId)

    return context.getStorageItem(...getStorageParams)
  }

  public async setStorageItem(
    sessionId: string,
    ...setStorageParams: Parameters<DappSecurityContext['setStorageItem']>
  ): Promise<void> {
    const context = await this.getSecurityContext(sessionId)

    await context.setStorageItem(...setStorageParams)
  }

  private async getSecurityContext(sessionId: string): Promise<DappSecurityContext> {
    const securityContextMap = await this.getSecurityContextsDataMap()
    const securityContext = securityContextMap[sessionId]

    if (!securityContext) {
      throw new Error(`DappSessionManager: There is no registered security context for session: ${sessionId}`)
    }

    return new DappSecurityContext(
      securityContext.tabId,
      securityContext.frameId,
      securityContext.frameContentRoot,
      securityContext.originContentRoot,
    )
  }

  private async getSecurityContextsDataMap(): Promise<SecurityContextDataMap> {
    if (this.securityContextsPromise) {
      return this.securityContextsPromise
    }

    return this.securityContextsPromise = (async () => {
      return (await getItem('securityContexts') || {})
    })();
  }

  private async setSecurityContext(sessionId: string, context: DappSecurityContextData): Promise<void> {
    const securityContexts = await this.getSecurityContextsDataMap()
    securityContexts[sessionId] = context
    await setItem('securityContexts', securityContexts)
  }
}
