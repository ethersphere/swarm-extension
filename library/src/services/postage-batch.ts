import { SwarmMessages } from '../messages/swarm-messages'
import { PostageBatchMessage } from '../model/postage-batch.interface'

export class PostageBatch implements PostageBatchMessage {

  constructor(private messages: SwarmMessages) {}
  /**
   * Checks whether the global postage batch is enabled or not
   */
  public isGlobalPostageBatchEnabled(): Promise<string> {
    return this.messages.sendMessage<string>('isGlobalPostageBatchEnabled')
  }
}
