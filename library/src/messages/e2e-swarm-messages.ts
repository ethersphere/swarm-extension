import { SessionId } from '../model/general.types';
import { SwarmMessages } from './swarm-messages'

export class E2ESwarmMessages extends SwarmMessages {
  constructor(protected extensionId: string, sessionId: SessionId) {
    super(sessionId)
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public closeConnection() {}

  public sendMessage<Response>(key: string, payload?: unknown): Promise<Response> {
    const sessionId = this.sessionId

    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        this.extensionId,
        { action: key, sessionId, data: payload },
        (response: { error: Error | string; data: Response }) => {
          const { lastError } = chrome.runtime

          if (lastError) {
            return reject(new Error(lastError.message))
          }

          const { data, error } = response

          if (error) {
            return reject(error)
          }

          resolve(data)
        },
      )
    })
  }
}
