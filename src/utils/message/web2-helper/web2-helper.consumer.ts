/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { EventConsumer, EventReturnType, SendMessageFormat, deserializeResponseMessage } from '../message-handler'
import { Web2HelperMessage } from './web2-helper.message'

export class Web2HelperConsumer implements EventConsumer<Web2HelperMessage> {
  callEvent<T extends keyof Web2HelperMessage>(
    eventName: T,
    ...args: Parameters<Web2HelperMessage[T]>
  ): EventReturnType<Web2HelperMessage[T]>
  callEvent<T extends keyof Web2HelperMessage>(eventName: T): EventReturnType<Web2HelperMessage['beeApiUrl']> {
    if (eventName === 'beeApiUrl') {
      const messageFormat: SendMessageFormat = { key: eventName }
      console.log('sendMessage callevenmt beeapiurl')

      return new Promise<string>((resolve, reject) => {
        chrome.runtime.sendMessage(messageFormat, response => {
          try {
            const responseMessage = deserializeResponseMessage<string>(response)
            resolve(responseMessage.answer)
          } catch (e) {
            reject(e)
          }
        })
      })
    }

    throw new Error(`Not found EventName "${eventName}" on message call`)
  }
}
