export function isExtensionServiceWorkerEnv() {
  return typeof importScripts === 'function' && Boolean(window.chrome)
}

export function isWebPageEnv() {
  return typeof window === 'object'
}
