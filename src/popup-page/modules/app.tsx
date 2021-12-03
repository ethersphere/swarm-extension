import BeeDashboard from '@ethersphere/bee-dashboard'
import React, { useContext, useEffect, useState } from 'react'
import { getItem } from '../../utils/storage'
import { GlobalContext } from '../context/global'
import { BeeApiUrlChangeForm } from './bee-api-url-change-form'
import { PostageBatchElement } from './postage-batch-element'

export function App(): JSX.Element {
  const globalStateContext = useContext(GlobalContext)
  const { dispatch: changeGlobalState } = globalStateContext
  const [showBeeApp, setShowBeeApp] = useState(false)

  const asyncInit = async (): Promise<void> => {
    // Read variables from the localstore and
    // update the globalstate in need.
    const storedBeeApiUrl = await getItem('beeApiUrl')
    const storedBeeDebugApiUrl = await getItem('beeDebugApiUrl')
    const storedGlobalPostageBatchId = await getItem('globalPostageBatch')
    const storedGlobalPostageBatchEnabled = await getItem('globalPostageStampEnabled')

    if (storedBeeApiUrl) {
      changeGlobalState({ type: 'BEE_API_URL_SAVE', newValue: storedBeeApiUrl })
    }

    if (storedBeeDebugApiUrl) {
      changeGlobalState({ type: 'BEE_DEBUG_API_URL_SAVE', newValue: storedBeeDebugApiUrl })
    }

    if (storedGlobalPostageBatchId) {
      changeGlobalState({ type: 'GLOBAL_POSTAGE_BATCH_SAVE', newValue: storedGlobalPostageBatchId })
    }

    if (storedGlobalPostageBatchEnabled) {
      changeGlobalState({ type: 'GLOBAL_POSTAGE_BATCH_ENABLED_SAVE', newValue: storedGlobalPostageBatchEnabled })
    }
  }

  useEffect(() => {
    asyncInit()
    // init url param resolution
    const url = new URL(window.location.href)
    const openAppName = url.searchParams.get('app')

    if (openAppName && openAppName === 'bee-dashboard') {
      setShowBeeApp(true)
    }
  }, [])

  return (
    <>
      <div id="app-extension" hidden={showBeeApp}>
        <div>
          <BeeApiUrlChangeForm />
          <hr></hr>
          <PostageBatchElement />
        </div>
        <div>
          <a href={window.location.href + '?app=bee-dashboard'} target="_blank">
            Open Bee Dashboard
          </a>
        </div>
      </div>
      <div id="app-bee-dashboard" hidden={!showBeeApp}>
        <BeeDashboard beeApiUrl={globalStateContext.state.beeApiUrl}></BeeDashboard>
      </div>
    </>
  )
}

export default App
