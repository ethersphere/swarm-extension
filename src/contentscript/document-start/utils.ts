/**
 * Injects a script tag into the current document
 *
 * @param content - Code to be executed in the current document
 */
export function injectScript(content: string, windowObjectName: string): void {
  try {
    const container = document.head || document.documentElement
    const scriptTag = document.createElement('script')
    scriptTag.setAttribute('async', 'false')
    scriptTag.textContent = content
    container.insertBefore(scriptTag, container.children[0])
    container.removeChild(scriptTag)
    console.log(`Swarm-Extension: injected object is available via "window.${windowObjectName}"`)
  } catch (error) {
    console.error('Swarm-Extension: Provider injection failed.', error)
  }
}
