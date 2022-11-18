export function isExtensionServiceWorkerEnv() {
  return typeof importScripts === 'function' && typeof chrome === 'object'
}

export function isWebPageEnv() {
  return typeof window === 'object'
}
