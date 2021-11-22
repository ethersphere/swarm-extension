import React, { useContext } from 'react'
import { GlobalContext } from '../context/global'

export function BeeApiUrlChangeForm(): JSX.Element {
  const globalStateContext = useContext(GlobalContext)
  const { dispatch: dispatchGlobalState, state: globalState } = globalStateContext

  const handleApiUrlSubmit = (event: React.FormEvent<HTMLElement>): void => {
    event.preventDefault()

    if (!/^https?:\/\/.*/i.test(globalState.beeApiUrl)) {
      // eslint-disable-next-line no-alert
      alert(`"beeApiUrl" does not start with either "http://" or "https://". Got: ${globalState.beeApiUrl}'`)

      return
    }

    dispatchGlobalState({ type: 'BEE_API_URL_SAVE', newValue: globalState.beeApiUrl })
    dispatchGlobalState({ type: 'GLOBAL_POSTAGE_BATCH_ENABLED_SAVE', newValue: false })
    dispatchGlobalState({ type: 'GLOBAL_POSTAGE_BATCH_SAVE', newValue: null })
  }

  const handleDedugUrlSubmit = (event: React.FormEvent<HTMLElement>): void => {
    event.preventDefault()

    if (!/^https?:\/\/.*/i.test(globalState.beeDebugApiUrl)) {
      // eslint-disable-next-line no-alert
      alert(`"beeDebugApiUrl" does not start with either "http://" or "https://". Got: ${globalState.beeDebugApiUrl}'`)

      return
    }

    dispatchGlobalState({ type: 'BEE_DEBUG_API_URL_SAVE', newValue: globalState.beeDebugApiUrl })
    dispatchGlobalState({ type: 'GLOBAL_POSTAGE_BATCH_ENABLED_SAVE', newValue: false })
    dispatchGlobalState({ type: 'GLOBAL_POSTAGE_BATCH_SAVE', newValue: null })
  }

  const handleBeeApiUrlChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    // not async method, it just changes the ui state
    dispatchGlobalState({ type: 'BEE_API_URL_CHANGE', newValue: event.target.value })
  }

  const handleBeeDebugApiUrlChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    // not async method, it just changes the ui state
    dispatchGlobalState({ type: 'BEE_DEBUG_API_URL_CHANGE', newValue: event.target.value })
  }

  return (
    <div>
      <form id="form-bee-api-url-change" onSubmit={handleApiUrlSubmit}>
        <label>
          Bee node API address:
          <input type="text" value={globalState.beeApiUrl} onChange={handleBeeApiUrlChange} />
        </label>
        <input type="submit" value="Change" />
      </form>

      <form id="form-bee-debug-api-url-change" onSubmit={handleDedugUrlSubmit}>
        <label>
          Bee node Debug API address:
          <input type="text" value={globalState.beeDebugApiUrl} onChange={handleBeeDebugApiUrlChange} />
        </label>
        <input type="submit" value="Change" />
      </form>
    </div>
  )
}
