import BeeDashboard from '@ethersphere/bee-dashboard'
import React, { useContext, useEffect, useState, ReactElement } from 'react'
import { ExternalLink } from 'react-feather'

import { getItem } from '../../utils/storage'
import { GlobalContext } from '../context/global'
import GlobalPostageStamp from './GlobalPostageStamp'
import Web2Origin from './Web2Origin'
import Row from './Row'
import Button from './Button'
import BeeEndpoints from './BeeEndpoints'
import Logo from './Logo'

export function App(): ReactElement {
  const globalStateContext = useContext(GlobalContext)
  const { dispatch: changeGlobalState } = globalStateContext
  const [showBeeApp, setShowBeeApp] = useState(false)
  const [initialized, setInitialized] = useState(false)

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

    setInitialized(true)
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

  if (!initialized) {
    return <></>
  }

  return (
    <>
      <div
        id="app-extension"
        hidden={showBeeApp}
        style={{
          backgroundColor: '#ededed',
          color: '#303030',
          fontFamily: 'iA Writer Quattro V',
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        {/*  Header with logo and action */}
        <div
          style={{
            height: 74,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#303030',
          }}
        >
          <Logo style={{ marginLeft: 20 }} />
          <Button
            variant="dark"
            style={{ marginRight: 16 }}
            href={window.location.href + '?app=bee-dashboard'}
            target="_blank"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <ExternalLink size="18" style={{ marginRight: 8 }} />
              Open Dashboard
            </div>
          </Button>
        </div>

        {/* Body */}
        <div
          style={{
            padding: 16,
            width: '100%',
          }}
        >
          <BeeEndpoints />
          <div style={{ marginTop: 16, marginBottom: 16, width: '100%', height: 1, backgroundColor: '#dadada' }} />
          <Row style={{ marginBottom: 2 }}>
            <Web2Origin />
          </Row>
          <GlobalPostageStamp />
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
