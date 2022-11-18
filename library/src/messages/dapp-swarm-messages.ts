import { SWARM_API_EVENT, SWARM_API_RESPONSE_EVENT } from '../constants/events'
import { SessionId } from '../model/general.types'
import { InpageReqMessageFormat, InterceptorResMessageFormat } from '../model/messages.model'
import { getOnDocumentReadyPromise } from '../utils/window.util'
import { SwarmMessages } from './swarm-messages'

const MESSAGE_TIMEOUT = 30000
/**
 * Object that contains the resolve and reject functions of a promise
 */
class PromiseHandles {
  private timeoutHandle: ReturnType<typeof setTimeout> | null = null
  constructor(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private resolveHandle: (data: any) => void,
    private rejectHandle: (error: Error | string) => void,
    onTimeout: (() => void) | null = null,
  ) {
    if (onTimeout) {
      this.timeoutHandle = setTimeout(() => {
        this.clearTimeout()
        onTimeout()
      }, MESSAGE_TIMEOUT)
    }
  }

  private clearTimeout() {
    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle)
      this.timeoutHandle = null
    }
  }

  public resolve(data: unknown) {
    this.clearTimeout()
    this.resolveHandle(data)
  }

  public reject(error: Error | string) {
    this.clearTimeout()
    this.rejectHandle(error)
  }
}

export class DappSwarmMessages extends SwarmMessages {
  static webRequestId = 1
  private pendingRequests: Map<string, PromiseHandles> = new Map()
  private listener: ((event: CustomEventInit<InterceptorResMessageFormat<string>>) => void) | undefined
  private onReady: Promise<void> = getOnDocumentReadyPromise()

  constructor(sessionId: SessionId) {
    super(sessionId)

    this.setListener()
  }

  public sendMessage<Response>(key: string, payload?: unknown): Promise<Response> {
    const sessionId = this.sessionId
    return new Promise<Response>(async (resolve, reject) => {
      if (!this.listener) {
        reject(new Error('Connection closed'))

        return
      }

      const eventId = String(DappSwarmMessages.webRequestId++)

      this.pendingRequests.set(
        eventId,
        new PromiseHandles(resolve, reject, () => {
          this.completeRequest({
            sender: 'content',
            target: 'inpage',
            eventId,
            key,
            answer: null,
            error: 'Request timeout',
          })
        }),
      )

      await this.onReady

      const event = new CustomEvent<InpageReqMessageFormat<unknown>>(SWARM_API_EVENT, {
        detail: {
          eventId,
          key,
          sender: 'inpage',
          target: 'content',
          sessionId,
          payload,
        },
      })

      document.dispatchEvent(event)
    })
  }

  public closeConnection() {
    if (this.listener) {
      document.removeEventListener(SWARM_API_RESPONSE_EVENT, this.listener)
      this.listener = undefined
    }
  }

  private setListener() {
    document.addEventListener(
      SWARM_API_RESPONSE_EVENT,
      (this.listener = (event: CustomEventInit<InterceptorResMessageFormat<unknown>>) => {
        const { detail } = event

        if (!detail) {
          console.warn('Swarm: Received an invalid event from the extension')

          return
        }

        this.completeRequest(detail)
      }),
    )
  }

  private completeRequest(response: InterceptorResMessageFormat<unknown>) {
    const { eventId, answer, error } = response

    if (!this.pendingRequests.has(eventId)) {
      return
    }

    const promiseHandles = this.pendingRequests.get(eventId)

    this.pendingRequests.delete(eventId)

    if (error) {
      promiseHandles?.reject(error)
    } else {
      promiseHandles?.resolve(answer)
    }
  }
}
