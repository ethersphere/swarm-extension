import React, { useContext, useEffect, useState, ReactElement } from 'react'
import { Check, X } from 'react-feather'

import { GlobalContext } from '../context/global'
import Row from './Row'
import Input from './Input'
import Button from './Button'

export default function BeeEndpoints(): ReactElement {
  const globalStateContext = useContext(GlobalContext)
  const { dispatch: dispatchGlobalState, state: globalState } = globalStateContext
  const [beeApiUrl, setBeeApiUrl] = useState<string>(globalState.beeApiUrl)
  const [beeDebugApiUrl, setBeeDebugApiUrl] = useState<string>(globalState.beeDebugApiUrl)

  const submitBeeAPI = (): void => {
    // No need to update
    if (beeApiUrl === globalState.beeApiUrl) return

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

  const submitBeeDebugAPI = (): void => {
    // No need to update
    if (beeDebugApiUrl === globalState.beeDebugApiUrl) return

    if (!/^https?:\/\/.*/i.test(beeDebugApiUrl)) {
      // eslint-disable-next-line no-alert
      alert(`"beeDebugApiUrl" does not start with either "http://" or "https://". Got: ${beeDebugApiUrl}'`)

      return
    }

    dispatchGlobalState({ type: 'BEE_DEBUG_API_URL_SAVE', newValue: beeDebugApiUrl })
    dispatchGlobalState({ type: 'GLOBAL_POSTAGE_BATCH_ENABLED_SAVE', newValue: false })
    dispatchGlobalState({ type: 'GLOBAL_POSTAGE_BATCH_SAVE', newValue: null })
  }

  const onBeeApiUrlChange = (value: string): void => {
    setBeeApiUrl(value)
  }

  const onBeeDebugApiUrlChange = (value: string): void => {
    setBeeDebugApiUrl(value)
  }

  useEffect(() => {
    setBeeApiUrl(globalState.beeApiUrl)
  }, [globalState.beeApiUrl])

  useEffect(() => {
    setBeeDebugApiUrl(globalState.beeDebugApiUrl)
  }, [globalState.beeDebugApiUrl])

  return (
    <>
      <Row style={{ marginBottom: 2 }}>
        <Input id="bee-api-url-input" label="Bee API URL" value={beeApiUrl} onChange={onBeeApiUrlChange} />
      </Row>
      <Row>
        <Input
          id="bee-debug-api-url-input"
          label="Bee Debug API URL"
          value={beeDebugApiUrl}
          onChange={onBeeDebugApiUrlChange}
        />
      </Row>
      <div
        style={{ marginTop: 8 }}
        hidden={beeApiUrl === globalState.beeApiUrl && beeDebugApiUrl === globalState.beeDebugApiUrl}
      >
        <Button
          id="api-button-save"
          variant="light"
          onClick={() => {
            submitBeeAPI()
            submitBeeDebugAPI()
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Check size="18" style={{ marginRight: 8 }} />
            Save
          </div>
        </Button>
        <Button
          id="api-button-cancel"
          variant="light"
          style={{ marginLeft: 8 }}
          onClick={() => {
            setBeeApiUrl(globalState.beeApiUrl)
            setBeeDebugApiUrl(globalState.beeDebugApiUrl)
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <X size="18" style={{ marginRight: 8 }} />
            Cancel
          </div>
        </Button>
      </div>
    </>
  )
}
