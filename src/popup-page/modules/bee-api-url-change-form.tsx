import React, { useContext, useEffect, useState } from 'react'
import { GlobalContext } from '../context/global'

export function BeeApiUrlChangeForm(): JSX.Element {
  const globalStateContext = useContext(GlobalContext)
  const { dispatch: dispatchGlobalState, state: globalState } = globalStateContext
  const [beeApiUrl, setBeeApiUrl] = useState<string>(globalState.beeApiUrl)
  const [beeDebugApiUrl, setBeeDebugApiUrl] = useState<string>(globalState.beeDebugApiUrl)

  const handleApiUrlSubmit = (event: React.FormEvent<HTMLElement>): void => {
    event.preventDefault()

    if (!/^https?:\/\/.*/i.test(beeApiUrl)) {
      // eslint-disable-next-line no-alert
      alert(`"beeApiUrl" does not start with either "http://" or "https://". Got: ${beeApiUrl}'`)

      return
    }
    console.log('changed api url', beeApiUrl)

    dispatchGlobalState({ type: 'BEE_API_URL_SAVE', newValue: beeApiUrl })
    dispatchGlobalState({ type: 'GLOBAL_POSTAGE_BATCH_ENABLED_SAVE', newValue: false })
    dispatchGlobalState({ type: 'GLOBAL_POSTAGE_BATCH_SAVE', newValue: null })
  }

  const handleDedugUrlSubmit = (event: React.FormEvent<HTMLElement>): void => {
    event.preventDefault()

    if (!/^https?:\/\/.*/i.test(beeDebugApiUrl)) {
      // eslint-disable-next-line no-alert
      alert(`"beeDebugApiUrl" does not start with either "http://" or "https://". Got: ${beeDebugApiUrl}'`)

      return
    }

    dispatchGlobalState({ type: 'BEE_DEBUG_API_URL_SAVE', newValue: beeDebugApiUrl })
    dispatchGlobalState({ type: 'GLOBAL_POSTAGE_BATCH_ENABLED_SAVE', newValue: false })
    dispatchGlobalState({ type: 'GLOBAL_POSTAGE_BATCH_SAVE', newValue: null })
  }

  const handleBeeApiUrlChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setBeeApiUrl(event.target.value)
  }

  const handleBeeDebugApiUrlChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setBeeDebugApiUrl(event.target.value)
  }

  useEffect(() => {
    setBeeApiUrl(globalState.beeApiUrl)
  }, [globalState.beeApiUrl])

  useEffect(() => {
    setBeeDebugApiUrl(globalState.beeDebugApiUrl)
  }, [globalState.beeDebugApiUrl])

  return (
    <div>
      <form id="form-bee-api-url-change" onSubmit={handleApiUrlSubmit}>
        <label>
          Bee node API address:
          <br />
          <input type="text" value={beeApiUrl} onChange={handleBeeApiUrlChange} />
        </label>
        <input type="submit" value="Change" />
      </form>

      <form id="form-bee-debug-api-url-change" onSubmit={handleDedugUrlSubmit}>
        <label>
          Bee node Debug API address:
          <br />
          <input type="text" value={beeDebugApiUrl} onChange={handleBeeDebugApiUrlChange} />
        </label>
        <input type="submit" value="Change" />
      </form>
    </div>
  )
}
