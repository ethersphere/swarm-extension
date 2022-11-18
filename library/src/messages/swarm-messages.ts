import { SessionId } from '../model/general.types'

export abstract class SwarmMessages {
  constructor(private _sessionId: SessionId) {
  }

  public get sessionId(): SessionId {
    return this._sessionId
  }

  /**
   * Sends a message to the Swarm extension and waits for response
   * @param key Method identifier of the Swarm extension
   * @param payload Depends of the method
   * @returns Promise with response from the extension
   */
  public abstract sendMessage<Response>(key: string, payload?: unknown): Promise<Response>

  public abstract closeConnection(): void
}
