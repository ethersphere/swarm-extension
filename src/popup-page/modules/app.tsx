import BeeDashboard from '@ethersphere/bee-dashboard'
import React, { useContext, useEffect, useState } from 'react'
import { getItem } from '../../utils/storage'
import { GlobalContext } from '../context/global'
import { BeeApiUrlChangeForm } from './bee-api-url-change-form'
import { PostageBatchElement } from './postage-batch-element'
import { Web2Origin } from './web2-origin'

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
    const storedWeb2OriginEnabled = await getItem('web2OriginEnabled')

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

    if (storedWeb2OriginEnabled) {
      changeGlobalState({ type: 'WEB2_ORIGIN_ENABLED_SAVE', newValue: storedWeb2OriginEnabled })
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
          <div style={{ margin: '12px 0px' }}>
            <a href={window.location.href + '?app=bee-dashboard'} target="_blank">
              Open Bee Dashboard
            </a>
          </div>
          <Web2Origin />
          <hr></hr>
          <PostageBatchElement />
        </div>
      </div>
      <div id="app-bee-dashboard" hidden={!showBeeApp}>
        <BeeDashboard
          beeApiUrl={globalStateContext.state.beeApiUrl}
          beeDebugApiUrl={globalStateContext.state.beeDebugApiUrl}
          lockedApiSettings={true}
        ></BeeDashboard>
      </div>
    </>
  )
}

export default App
