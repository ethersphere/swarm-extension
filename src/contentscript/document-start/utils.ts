/**
 * Injects a script tag into the current document
 *
 * @param content - Code to be executed in the current document
 */
export function injectScript(scriptSrc: string, windowObjectName: string, async = false) {
  try {
    const script = document.createElement('script')
    script.setAttribute('type', 'text/javascript')
    script.setAttribute('async', 'false')
    script.setAttribute('src', chrome.runtime.getURL(scriptSrc))
    document.body.appendChild(script)
    console.log(`Swarm-Extension: injected object is available via "window.${windowObjectName}"`)
  } catch (error) {
    console.error('Swarm-Extension: Provider injection failed.', error)
  }
}
