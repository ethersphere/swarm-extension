/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */

type BaseMessageFormat = {
  /** What actually is requested */
  key: string
}

type BaseDirectMessage = BaseMessageFormat & {
  trusted: true
}

/** Direct message from Content script to Background script */
export type DirectMessageReq<T, K extends keyof T> = BaseDirectMessage & {
  key: K
  payload: T[K] extends (...args: any[]) => any ? Parameters<T[K]> : undefined
}

/** Response for Content script direct message from Background script */
export type DirectMessageRes<T, K extends keyof T> = BaseDirectMessage & {
  key: K
  payload: T[K] extends (...args: any[]) => any ? ReturnType<T[K]> : never
}

/** Used message type where window.postMessage call happens */
export type BroadcastMessageFormat = BaseMessageFormat & {
  eventId: string
}

/** Inpage script -> Content script */
export type InpageReqMessageFormat<T = undefined> = BroadcastMessageFormat & {
  sender: 'inpage'
  target: 'content'
  payload?: T
}

/** Content script -> Background script */
export type InterceptorReqMessageFormat<T = undefined> = BaseMessageFormat & {
  sender: 'content'
  target: 'background'
  payload?: T
}

/** Content script -> inpage script */
export type InterceptorResMessageFormat<T = undefined> = BroadcastMessageFormat & {
  sender: 'content'
  target: 'inpage'
  answer?: T
  error?: string
}

/** Background script -> Content script */
export type ResponseMessageFormat<T = string> = BaseMessageFormat & {
  sender: 'background'
  target: 'content'
  answer?: T
  error?: string
}

/** Background script -> Content script with answer */
export type ResponseWithMessage<T = string> = {
  [Property in keyof ResponseMessageFormat<T> as Exclude<Property, 'error'>]-?: ResponseMessageFormat<T>[Property]
}
