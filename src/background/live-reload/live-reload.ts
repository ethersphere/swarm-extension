const ADDRESS = 'ws://localhost:16667'

export const setupLiveReload = (): void => {
  let connection = new WebSocket(ADDRESS)
  connection.onclose = () => {
    connection = new WebSocket(ADDRESS)
  }
  connection.onmessage = () => {
    chrome.runtime.reload()
  }
}
