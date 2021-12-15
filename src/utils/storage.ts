import { EventEmitter } from 'events'

interface Store {
  beeApiUrl: string
  beeDebugApiUrl: string
  web2OriginEnabled: boolean
  globalPostageBatch: string | null
  globalPostageStampEnabled: boolean
}

type StoreKey = keyof Store

export function getItem<T extends StoreKey>(key: T): Promise<Store[T]> {
  return new Promise(resolve => {
    chrome.storage.local.get(key, items => {
      resolve(items[key])
    })
  })
}

export async function setItem<T extends StoreKey>(key: T, value: Store[T]): Promise<void> {
  await new Promise(resolve => {
    chrome.storage.local.set({ [key]: value }, () => resolve)
  })
}

type StoreChangeCallback<T> = (newValue: T, oldValue: T, namespace: 'sync' | 'local' | 'managed', key: string) => void

export class StoreObserver extends EventEmitter {
  constructor() {
    super()
    this.listener()
  }

  public addListener<T = string>(key: StoreKey, callback: StoreChangeCallback<T>): this {
    super.addListener(key, callback)

    return this
  }

  public removeListener<T = string>(key: StoreKey, callback: StoreChangeCallback<T>): this {
    super.removeListener(key, callback)

    return this
  }

  private listener() {
    chrome.storage.onChanged.addListener((changes, namespace) => {
      for (const [key, storageChange] of Object.entries(changes)) {
        this.emit(key, storageChange.newValue, storageChange.oldValue, namespace, key)
      }
    })
  }
}
