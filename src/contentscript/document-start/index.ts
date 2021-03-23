//Only does the injection of Swarm library on document start
// import { assignSwarmLibraryToWindow } from '../swarm-library'

import SwarmLibrary from 'raw-loader!../../../dist/swarm-library.js'
import { Web2HelperInterceptor } from './web2-helper.interceptor'

/**
 * Injects a script tag into the current document
 *
 * @param content - Code to be executed in the current document
 */
function injectScript(content: string) {
  try {
    const container = document.head || document.documentElement
    const scriptTag = document.createElement('script')
    scriptTag.setAttribute('async', 'false')
    scriptTag.id = 'swarm-injected'
    scriptTag.textContent = content
    container.insertBefore(scriptTag, container.children[0])
    // container.removeChild(scriptTag)
    console.log('Swarm-Extension: swarm-library is available via "window.swarm"')
  } catch (error) {
    console.error('Swarm-Extension: Provider injection failed.', error)
  }
}

injectScript(SwarmLibrary)

// custom protocol handler is highly unconvenient to set up on client side and cannot be enabled automaticly in puppeteer
// it does not have effect on image loading
// it cannot be called via XMLHtmlRequest, because it is not in the supported protocol schemes
// and various fixed protocol scheme validations block to utilize this redirect
// window.navigator.registerProtocolHandler('web+bzz', `${dappRequestUrl}?bzz-address=%s`, 'Swarm dApp')

//listen to events which come from inpage side
new Web2HelperInterceptor()
