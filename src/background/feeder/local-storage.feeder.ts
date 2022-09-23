import browser from 'webextension-polyfill'
import { ILocalStorageMessage } from '../../utils/message/local-storage'
import { InterceptorReqMessageFormat, ResponseMessageFormat } from '../../utils/message/message-handler'
import { DappSessionManager } from '../dapp-session.manager'
import { isInternalMessage } from '../utils'

export class LocalStorageFeeder {
  constructor(private manager: DappSessionManager) {
    this.serveEvents()
  }
  serveEvents(): void {
    console.log('Register LocalStorageFeeder event listeners...')

    browser.runtime.onMessage.addListener(
      (
        message: InterceptorReqMessageFormat,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: any) => void,
      ) => {
        if (!isInternalMessage(sender)) return

        if (message.key !== 'setItem' && message.key !== 'getItem') {
          return
        }

        this.processLocalStorageRequest(message, sender, sendResponse)

        return true
      },
    )
  }

  private async processLocalStorageRequest(
    message: InterceptorReqMessageFormat,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void,
  ) {
    const { sessionId, key } = message

    if (!sessionId) return sendResponse({ error: 'Invalid session ID' })

    const isValid = await this.manager.isValidSession(sessionId, sender)

    if (!isValid) return sendResponse({ error: 'Invalid session' })

    const response: ResponseMessageFormat = {
      key,
      sender: 'background',
      target: 'content',
    }

    if (this.isSetItemRequest(message)) {
      const { payload } = message

      await this.setItem(sessionId, payload, response)
    } else if (this.isGetItemRequest(message)) {
      const { payload } = message

      await this.getItem(sessionId, payload, response)
    }

    return sendResponse(response)
  }

  private isSetItemRequest(
    message: InterceptorReqMessageFormat,
  ): message is InterceptorReqMessageFormat<Parameters<ILocalStorageMessage['setItem']>> {
    return message.key === 'setItem'
  }

  private isGetItemRequest(
    message: InterceptorReqMessageFormat,
  ): message is InterceptorReqMessageFormat<Parameters<ILocalStorageMessage['getItem']>> {
    return message.key === 'getItem'
  }

  private setItem(
    sessionId: string,
    payload: undefined | Parameters<ILocalStorageMessage['setItem']>,
    response: ResponseMessageFormat,
  ) {
    console.log(`LocalStorageFeeder: store set -> ${payload}`)

    if (!payload || !payload[0]) {
      response.error = `LocalStorageFeeder: wrong payload: Got ${payload}`

      return response
    }

    return new Promise<ResponseMessageFormat>(resolve => {
      this.manager.setStorageItem(sessionId, payload[0], payload[1]).then(() => {
        resolve(response)
      })
    })
  }

  public getItem(
    sessionId: string,
    payload: undefined | Parameters<ILocalStorageMessage['getItem']>,
    response: ResponseMessageFormat,
  ): Promise<ResponseMessageFormat> | ResponseMessageFormat {
    console.log(`LocalStorageFeeder: store get -> ${payload}`)

    if (!payload || !payload[0]) {
      response.error = `LocalStorageFeeder: wrong payload: Got ${payload}`

      return response
    }

    return new Promise<ResponseMessageFormat>(resolve => {
      this.manager
        .getStorageItem(sessionId, payload[0])
        .then(result => {
          response.answer = result
          resolve(response)
        })
        .catch(e => {
          response.error = e
          resolve(response)
        })
    })
  }
}
