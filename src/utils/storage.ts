interface Store {
  beeApiUrl: string
}

type StoreKey = keyof Store

export function getItem<T extends StoreKey>(key: T): Promise<Store[T]> {
  return new Promise(resolve => {
    chrome.storage.local.get(key, items => {
      console.log('items', items)
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

export class StoreObserver {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subscribers: Partial<Record<StoreKey, Array<StoreChangeCallback<any>>>>
  constructor() {
    this.subscribers = {}
    this.listener()
  }

  public addSubscriber<T = string>(key: StoreKey, callback: StoreChangeCallback<T>): void {
    if (!this.subscribers[key]) {
      this.subscribers[key] = [callback]
    } else {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.subscribers[key]!.push(callback)
    }
  }

  private listener() {
    chrome.storage.onChanged.addListener((changes, namespace) => {
      for (const [key, storageChange] of Object.entries(changes)) {
        const subscribersOfKey = this.subscribers[key as StoreKey]

        if (!subscribersOfKey) return

        for (const subscriberOfKey of subscribersOfKey) {
          subscriberOfKey(storageChange.newValue, storageChange.oldValue, namespace, key)
        }
      }
    })
  }
}
