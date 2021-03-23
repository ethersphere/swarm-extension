/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */

type BaseMessageFormat = {
  /** What actually is requested */
  key: string
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

export type EventReturnType<T extends (...args: any[]) => any> = T extends (...args: any[]) => Promise<infer R>
  ? Promise<R>
  : never

export interface EventInterceptor<Events extends { [eventName: string]: (...args: any[]) => Promise<any> }> {
  callEvent<E extends keyof Events>(eventName: E, ...args: Parameters<Events[E]>): EventReturnType<Events[E]>
}

export function deserializeResponseMessage<T>(message: ResponseMessageFormat<T>): ResponseWithMessage<T> {
  if (message.error) {
    throw new Error(message.error)
  }

  if (!message.answer) {
    throw new Error(`No answer from message handler at key "${message.key}"`)
  }

  return {
    key: message.key,
    answer: message.answer,
    target: 'content',
    sender: 'background',
  }
}
