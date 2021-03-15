/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */

export type SendMessageFormat<T = undefined> = {
  key: string
  payload?: T
}

export type ResponseMessageFormat<T = string> = {
  key: string
  answer?: T
  error?: string
}

export type ResponseMessage<T = string> = {
  [Property in keyof ResponseMessageFormat<T> as Exclude<Property, 'error'>]-?: ResponseMessageFormat<T>[Property]
}

export type EventReturnType<T extends (...args: any[]) => any> = T extends (...args: any[]) => Promise<infer R>
  ? Promise<R>
  : never

export interface EventConsumer<Events extends { [eventName: string]: (...args: any[]) => Promise<any> }> {
  callEvent<E extends keyof Events>(eventName: E, ...args: Parameters<Events[E]>): EventReturnType<Events[E]>
}

export function deserializeResponseMessage<T>(message: ResponseMessageFormat<T>): ResponseMessage<T> {
  if (message.error) {
    throw new Error(message.error)
  }

  if (!message.answer) {
    throw new Error(`No answer from message handler at key "${message.key}"`)
  }

  return {
    key: message.key,
    answer: message.answer,
  }
}
