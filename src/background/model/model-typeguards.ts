import { ExtensionDappSecurityContext, TabDappSecurityContext } from './dapp-security-context.model'

export function isTabDappSecurityContext(data: unknown): data is TabDappSecurityContext {
  const { type, tabId, frameId } = (data || {}) as TabDappSecurityContext

  return type === 'tab' && typeof tabId === 'number' && typeof frameId === 'number'
}

export function isExtensionDappSecurityContext(data: unknown): data is ExtensionDappSecurityContext {
  const { type } = (data || {}) as ExtensionDappSecurityContext

  return type === 'extension'
}
