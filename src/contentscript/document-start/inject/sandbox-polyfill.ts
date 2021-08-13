import { injectScript } from '../utils'

/**
 * dApps will be opened in sandbox mode,
 * and as a result some common libraries won't work without polyfilling
 */
export function injectSandboxPolyfill(): void {
  injectScript(
    "Object.defineProperty(document, 'cookie', { get: function(){return ''}, set: function(){return true}, });",
    'sandboxPolyfill',
  )
}
