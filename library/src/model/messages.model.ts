type BaseMessageFormat = {
  /** What actually is requested */
  key: string
}

export type BroadcastMessageFormat = BaseMessageFormat & {
  eventId: string
}

export type InterceptorResMessageFormat<T = undefined> = BroadcastMessageFormat & {
  sender: 'content'
  target: 'inpage'
  answer?: T
  error?: string
}

export type InpageReqMessageFormat<T = undefined> = BroadcastMessageFormat & {
  sender: 'inpage'
  target: 'content'
  /** Only necessary for authorized requests */
  sessionId?: string
  payload?: T
}
