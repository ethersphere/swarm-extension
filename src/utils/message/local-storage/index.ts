// Define your message types like that:
// Key: Message name; Parameter: payload data from sender side, Return Value: Feeder functions emit

/**
 * RPC message format of the dApp localStorage
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
 */
export interface ILocalStorageMessage {
  setItem: (keyName: string, keyValue: unknown) => Promise<void>
  getItem: (keyName: string) => Promise<unknown>
}
