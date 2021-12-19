import BeeDashboard from '@ethersphere/bee-dashboard'
import React, { useContext, useEffect, useState } from 'react'
import { getItem } from '../../utils/storage'
import { GlobalContext } from '../context/global'
import { BeeApiUrlChangeForm } from './bee-api-url-change-form'
import { PostageBatchElement } from './postage-batch-element'
import Web2Origin from './Web2Origin'
import Logo from '../assets/logo.svg'
import Row from './Row'
import Button from './Button'
import Toggle from './Toggle'

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
          <div style={{ height: 30, width: 88, marginLeft: 20 }}>
            <img style={{ height: '100%', width: '100%' }} src={Logo} />
          </div>
          <Button
            variant="dark"
            style={{ marginRight: 16 }}
            href={window.location.href + '?app=bee-dashboard'}
            target="_blank"
          >
            Open Bee Dashboard
          </Button>
        </div>

        {/* Body */}
        <div
          style={{
            padding: 16,
            width: '100%',
          }}
        >
          <Row style={{ marginBottom: 2 }}>Node error</Row>
          <Row style={{ marginBottom: 2 }}>Connected peers</Row>
          <Row style={{ marginBottom: 2 }}>API address</Row>
          <Row>Debug API address</Row>
          <Button
            variant="light"
            style={{ marginTop: 8 }}
            href={window.location.href + '?app=bee-dashboard'}
            target="_blank"
          >
            Modify settings
          </Button>
          <div style={{ marginTop: 16, marginBottom: 16, width: '100%', height: 1, backgroundColor: '#dadada' }} />
          <Row style={{ marginBottom: 2 }}>
            <Web2Origin />
          </Row>
          <Row>
            <PostageBatchElement />
          </Row>
          {/*<BeeApiUrlChangeForm />
          <div style={{ margin: '12px 0px' }}>
            <a href={window.location.href + '?app=bee-dashboard'} target="_blank">
              Open Bee Dashboard
            </a>
          </div>
          <Web2Origin />
          <hr></hr>
          <PostageBatchElement />*/}
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
