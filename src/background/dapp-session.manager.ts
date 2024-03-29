import { getItem, setItem } from '../utils/storage'
import {
  CommonDappSecurityContext,
  TabDappSecurityContext as TabDappSecurityContextStorage,
  ExtensionDappSecurityContext as ExtensionDappSecurityContextStorage,
} from './model/dapp-security-context.model'
import { isExtensionDappSecurityContext, isTabDappSecurityContext } from './model/model-typeguards'
import { isSenderExtension, senderContentOrigin, senderFrameId, senderFrameOrigin, senderTabId } from './utils'

type LocalStorage = {
  set: (storeValues: { [key: string]: unknown }, callback?: () => void) => void
  get: (storeValues: string[], callback: (result: { [key: string]: unknown }) => void) => void
}

abstract class DappSecurityContext {
  protected readonly storage: LocalStorage
  protected readonly storePrefix: string

  constructor(storePrefix: string) {
    this.storage = chrome.storage.local
    this.storePrefix = storePrefix
  }

  public abstract isValid(sender: chrome.runtime.MessageSender): boolean

  /** STORAGE FUNCTIONS */

  public abstract setStorageItem(keyName: string, keyValue: unknown): Promise<void>

  public abstract getStorageItem(keyName: string): Promise<unknown>

  public abstract toStorage(): CommonDappSecurityContext
}

class TabDappSecurityContext extends DappSecurityContext {
  public constructor(
    private tabId: number,
    private frameId: number,
    private frameContentRoot: string,
    private originContentRoot: string,
  ) {
    super(frameContentRoot || originContentRoot)
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

  public isValid(sender: chrome.runtime.MessageSender): boolean {
    const tabId = senderTabId(sender)
    const frameId = senderFrameId(sender)
    const frameContentRoot = senderFrameOrigin(sender)
    const originContentRoot = senderContentOrigin(sender)

    console.log(`tabid ${tabId} frameId ${frameId} frameconte ${frameContentRoot} originCon ${originContentRoot}`)

    return (
      this.isValidTabId(tabId) &&
      this.isValidFrameId(frameId) &&
      this.isFrameContentRoot(frameContentRoot) &&
      this.isValidOriginContentRoot(originContentRoot)
    )
  }

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

  public toStorage(): TabDappSecurityContextStorage {
    return {
      type: 'tab',
      tabId: this.tabId,
      frameId: this.frameId,
      frameContentRoot: this.frameContentRoot,
      originContentRoot: this.originContentRoot,
    }
  }

  private enrichStorageKey(keyName: string): string {
    return `${this.storePrefix}-${keyName}`
  }
}

class ExtensionDappSecurityContext extends DappSecurityContext {
  constructor() {
    super('extension')
  }

  public isValid(sender: chrome.runtime.MessageSender): boolean {
    return isSenderExtension(sender)
  }

  public setStorageItem(keyName: string, keyValue: unknown): Promise<void> {
    throw new Error("ExtensionDappSecurityContext doesn't support extension storage functions")
  }

  public getStorageItem(keyName: string): Promise<unknown> {
    throw new Error("ExtensionDappSecurityContext doesn't support extension storage functions")
  }

  public toStorage(): ExtensionDappSecurityContextStorage {
    return {
      type: 'extension',
    }
  }
}

export class DappSessionManager {
  public constructor() {
    chrome.runtime.onSuspend.addListener(() => {
      setItem('securityContexts', {})
    })
  }
  public async register(sessionId: string, sender: chrome.runtime.MessageSender): Promise<void> {
    let context: DappSecurityContext

    if (isSenderExtension(sender)) {
      context = new ExtensionDappSecurityContext()
    } else {
      const tabId = senderTabId(sender)
      const frameId = senderFrameId(sender)
      const frameContentRoot = senderFrameOrigin(sender)
      const originContentRoot = senderContentOrigin(sender)

      context = new TabDappSecurityContext(tabId, frameId, frameContentRoot, originContentRoot)
    }

    await this.setSecurityContext(sessionId, context)

    console.log(`dApp session "${sessionId}" has been initialized`, context.toStorage())
  }

  /**
   * Checks the given sessionId and sender's data match with the DappSessionManager's records
   */
  public async isValidSession(sessionId: string, sender: chrome.runtime.MessageSender): Promise<boolean> {
    const context = await this.getSecurityContext(sessionId)

    if (!context) return false

    return context.isValid(sender)
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
    const securityContexts = (await getItem('securityContexts')) || {}
    const securityContext = securityContexts[sessionId]

    if (!securityContext) {
      throw new Error(`DappSessionManager: There is no registered security context for session: ${sessionId}`)
    }

    return this.convertDappSecurityContext(securityContext)
  }

  private async setSecurityContext(sessionId: string, context: DappSecurityContext): Promise<void> {
    const securityContexts = (await getItem('securityContexts')) || {}
    securityContexts[sessionId] = context.toStorage()
    await setItem('securityContexts', securityContexts)
  }

  private convertDappSecurityContext(context: CommonDappSecurityContext): DappSecurityContext {
    if (isExtensionDappSecurityContext(context)) {
      return new ExtensionDappSecurityContext()
    }

    if (isTabDappSecurityContext(context)) {
      const { tabId, frameId, frameContentRoot, originContentRoot } = context

      return new TabDappSecurityContext(tabId, frameId, frameContentRoot, originContentRoot)
    }

    throw new Error('Invalid dapp security context')
  }
}
