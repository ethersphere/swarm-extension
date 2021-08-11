import { nanoid } from 'nanoid'
import { dappSessionRegister } from './dapp-session.register'
import { injectSandboxPolyfill } from './inject/sandbox-polyfill'
import { injectSessionId } from './inject/session-id'
import { injectSwarmHtml } from './inject/swarm-html'
import { injectSwarmLibrary } from './inject/swarm-library'
import { MessengerInterceptor } from './messenger.interceptor'

// custom protocol handler is highly unconvenient to set up on client side and cannot be enabled automaticly in puppeteer
// it does not have effect on image loading
// it cannot be called via XMLHtmlRequest, because it is not in the supported protocol schemes
// and various fixed protocol scheme validations block to utilize this redirect
// window.navigator.registerProtocolHandler('web+bzz', `${dappRequestUrl}?bzz-address=%s`, 'Swarm dApp')

function init(): void {
  const sessionId = nanoid()
  dappSessionRegister(sessionId)
  injectSessionId(sessionId)
  injectSwarmHtml()
  injectSwarmLibrary()

  //listen to events which come from inpage side
  new MessengerInterceptor()

  // all bzz root content has to be in sandbox because of the CSP
  if (window.origin !== 'null') return
  // Generate dapp session id
  injectSandboxPolyfill()
}

init()
