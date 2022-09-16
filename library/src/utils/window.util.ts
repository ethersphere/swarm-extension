export function getOnDocumentReadyPromise(): Promise<void> {
  return new Promise(resolve => {
    if (document.readyState == 'complete') {
      return resolve()
    }
    window.addEventListener('load', () => resolve())
  })
}
