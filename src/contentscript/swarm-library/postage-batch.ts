import { nanoid } from 'nanoid'
import { InpageReqMessageFormat } from '../../utils/message/message-handler'
import { PostageBatchMessage } from '../../utils/message/postage-batch/postage-batch.message'
import { MessengerInpage } from './messenger.inpage'

export class PostageBatch extends MessengerInpage implements PostageBatchMessage {
  /**
   * Checks whether the global postage batch is enabled or not
   */
  public isGlobalPostageBatchEnabled(): Promise<string> {
    const message: InpageReqMessageFormat<undefined> = {
      key: 'isGlobalPostageBatchEnabled',
      eventId: nanoid(),
      sender: 'inpage',
      target: 'content',
    }

    return this.messageHandler(message, 'PostageBatch')
  }
}

export const postageBatch = new PostageBatch()
