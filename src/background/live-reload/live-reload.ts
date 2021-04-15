const MAIN_RELOAD_ADDRESS = 'ws://localhost:16667'
const DEPS_RELOAD_ADDRESS = 'ws://localhost:16668'

function setupLiveReloadConnections(address: string): void {
  let connection = new WebSocket(address)
  connection.onclose = () => {
    connection = new WebSocket(address)
  }
  connection.onmessage = () => {
    chrome.runtime.reload()
  }
}

export const setupLiveReload = (): void => {
  setupLiveReloadConnections(DEPS_RELOAD_ADDRESS)
  setupLiveReloadConnections(MAIN_RELOAD_ADDRESS)
}
