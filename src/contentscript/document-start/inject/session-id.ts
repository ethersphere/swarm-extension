import { filterMessage, MessageType, WindowMessage } from '../../model/WindowMessage'
import { injectScript } from '../utils'

export function injectSessionId(sessionId: string): void {
  window.addEventListener(
    'message',
    filterMessage(MessageType.GET_SWARM_SESSION_ID, event => {
      window.postMessage(
        {
          type: MessageType.SET_SWARM_SESSION_ID,
          data: sessionId,
        } as WindowMessage,
        '*',
      )
    }),
    false,
  )

  injectScript(`swarm-session-id.js?swarmSessionId=${sessionId}`, 'swarmSessionId')
}
