export class DebugListener {
  constructor() {
    this.addDebugListeners()
  }

  private addDebugListeners() {
    chrome.webRequest.onBeforeRedirect.addListener(
      details => {
        console.log('url before redirect', details.url)
      },
      { urls: ['*://*/*'] },
    )
  }
}
