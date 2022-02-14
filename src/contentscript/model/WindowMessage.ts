export enum MessageType {
  GET_SWARM_SESSION_ID = 'get-swarm-session-id',
  SET_SWARM_SESSION_ID = 'set-swarm-session-id',
}

export interface Message<Type, Data> {
  type: Type
  data?: Data
}
export type WindowMessage =
  | Message<MessageType.GET_SWARM_SESSION_ID, void>
  | Message<MessageType.SET_SWARM_SESSION_ID, string>

export function filterMessage(
  messageType: MessageType,
  callback: (event: MessageEvent<WindowMessage>) => void,
): (event: MessageEvent<WindowMessage>) => void {
  return (event: MessageEvent<WindowMessage>) => {
    if (event.data?.type === messageType) {
      callback(event)
    }
  }
}
