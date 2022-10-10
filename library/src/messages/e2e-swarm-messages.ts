import { SwarmMessages } from './swarm-messages'

export class E2ESwarmMessages extends SwarmMessages {
  constructor(protected extensionId: string) {
    super()
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public closeConnection() {}

  protected sendMessageInternal<Response>(
    key: string,
    sessionId: string | undefined,
    payload?: unknown,
  ): Promise<Response> {
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
