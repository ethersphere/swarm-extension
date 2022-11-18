import { ILocalStorageMessage } from '../model/local-storage.interface'
import { SwarmMessages } from '../messages/swarm-messages'

export class LocalStorage implements ILocalStorageMessage {
  constructor(private messages: SwarmMessages) {}

  public setItem(keyName: string, keyValue: unknown): Promise<void> {
    return this.messages.sendMessage<void>('setItem', [keyName, keyValue])
  }

  public getItem(keyName: string): Promise<unknown> {
    return this.messages.sendMessage('getItem', [keyName])
  }
}
