import { nanoid } from 'nanoid'
import { IDappSessionMessage } from '../../utils/message/dapp-session/dapp-session.message'
import {
  DirectMessageReq,
  InpageReqMessageFormat,
  InterceptorReqMessageFormat,
  InterceptorResMessageFormat,
  ResponseMessageFormat,
  ResponseWithMessage,
} from '../../utils/message/message-handler'

const SWARM_API_EVENT = 'swarm-api'
const SWARM_API_RESPONSE_EVENT = 'swarm-api-response'

const sessionId = nanoid()

function validInpageMessage(message: InpageReqMessageFormat<unknown>): boolean {
  return Boolean(message.eventId && message.key && message.target === 'content' && message.sender === 'inpage')
}

function deserializeResponseMessage<T>(message: ResponseMessageFormat<T>): ResponseWithMessage<T> {
  if (!message) throw new Error('There is no answer in the response')

  if (message.error) {
    throw new Error(message.error)
  }

  return {
    key: message.key,
    answer: message.answer as T,
    target: 'content',
    sender: 'background',
  }
}

/**
 * Utility function that creates a CustomEvent that sends response back to the library
 * @param eventId Request ID sent by the library
 * @param key Event key
 * @param response MessageResponse object that is sent back
 * @param error Optional error message
 */
function createResponseEvent(
  eventId: string,
  key: string,
  response: ResponseWithMessage<string> | undefined,
  error: string | undefined,
) {
  const event = new CustomEvent(SWARM_API_RESPONSE_EVENT, {
    detail: {
      key,
      eventId,
      sender: 'content',
      target: 'inpage',
      error,
      answer: response && deserializeResponseMessage<string>(response).answer,
    } as InterceptorResMessageFormat<string>,
  })

  document.dispatchEvent(event)
}

async function handleRegistrationMessage(message: InpageReqMessageFormat) {
  const { eventId, key } = message

  const messageToBackground: DirectMessageReq<IDappSessionMessage, 'registerDappSession'> = {
    key: 'registerDappSession',
    payload: [sessionId],
    trusted: true,
  }

  await chrome.runtime.sendMessage<DirectMessageReq<IDappSessionMessage, 'registerDappSession'>, undefined>(
    messageToBackground,
  )

  createResponseEvent(eventId, key, { key, sender: 'background', target: 'content', answer: sessionId }, undefined)
}

async function handleMessage(message: InpageReqMessageFormat) {
  const { eventId, key, sessionId, payload } = message

  const messageToBackground: InterceptorReqMessageFormat = {
    key,
    sessionId,
    payload,
    sender: 'content',
    target: 'background',
  }

  const response = await chrome.runtime.sendMessage<InterceptorReqMessageFormat, ResponseWithMessage<string>>(
    messageToBackground,
  )

  createResponseEvent(eventId, key, response, undefined)
}

document.addEventListener(SWARM_API_EVENT, (event: CustomEventInit<InpageReqMessageFormat>) => {
  const { detail: message } = event

  if (!message) {
    console.warn('Swarm: Received invalid request from the page')

    return
  }

  if (!validInpageMessage(message)) {
    console.warn('Swarm: Invalid message')

    return
  }

  const { eventId, key } = message

  try {
    if (key === 'registerDappSession') {
      return handleRegistrationMessage(message)
    }
    handleMessage(message)
  } catch (error) {
    const errorMessage = (error as Error).message
    console.error('Swarm Error', errorMessage)
    createResponseEvent(eventId, key, undefined, errorMessage)
  }
})
