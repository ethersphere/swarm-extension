import { filterMessage, MessageType, WindowMessage } from '../model/WindowMessage'

window.addEventListener(
  'message',
  filterMessage(MessageType.SET_SWARM_SESSION_ID, event => {
    const windowObject = window as any
    const { swarm } = windowObject
    const sessionId = event.data.data

    if (typeof swarm === 'object' && swarm !== null) {
      windowObject.swarm = {
        ...swarm,
        sessionId,
      }
    } else {
      windowObject.swarm = {
        sessionId,
      }
    }
  }),
  true,
)

window.postMessage({ type: MessageType.GET_SWARM_SESSION_ID } as WindowMessage, '*')
