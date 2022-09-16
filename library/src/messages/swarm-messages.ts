import { SessionId } from "../model/general.types";

export abstract class SwarmMessages {

  private registrationPromise: Promise<SessionId> | null = null
  private _sessionId: SessionId | undefined

  constructor() {
    setTimeout(() => this.checkRegistration())
  }

  public get sessionId(): SessionId | undefined {
    return this._sessionId
  }
  /**
   * Sends a message to the Swarm extension and waits for response
   * @param key Method identifier of the Swarm extension
   * @param sessionId Dapp session ID
   * @param payload Depends of the method
   * @returns Promise with response from the extension
   */
  public async sendMessage<Response>(key: string, payload?: unknown): Promise<Response> {
    await this.checkRegistration()

    return this.sendMessageInternal<Response>(key, this.sessionId, payload)
  }


  public abstract closeConnection(): void
  
  protected abstract sendMessageInternal<Response>(key: string, sessionId: string | undefined, payload?: unknown): Promise<Response>
  
  private async checkRegistration(): Promise<void> {
    try {
      if (this.sessionId) {
        return
      }

      if (this.registrationPromise) {
        await this.registrationPromise

        return
      }

      this._sessionId = await (this.registrationPromise = this.sendMessageInternal<SessionId>('registerDappSession', undefined))
      
    } catch(error) {
      this.registrationPromise = null

      throw error
    }
  }
}
