export interface CommonDappSecurityContext {
  type: 'tab' | 'extension'
}

export interface TabDappSecurityContext extends CommonDappSecurityContext {
  type: 'tab'
  tabId: number
  frameId: number
  frameContentRoot: string
  originContentRoot: string
}

export interface ExtensionDappSecurityContext extends CommonDappSecurityContext {
  type: 'extension'
}

export type DappSecurityContext = TabDappSecurityContext | ExtensionDappSecurityContext
