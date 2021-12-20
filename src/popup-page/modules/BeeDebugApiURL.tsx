import React, { useContext, useEffect, useState } from 'react'
import EditForm from './EditForm'
import { GlobalContext } from '../context/global'

export default function BeeDebugApiUrl(): JSX.Element {
  const globalStateContext = useContext(GlobalContext)
  const { dispatch: dispatchGlobalState, state: globalState } = globalStateContext
  const [beeDebugApiUrl, setBeeDebugApiUrl] = useState<string>(globalState.beeDebugApiUrl)

  const onSubmit = (value: string): void => {
    if (!/^https?:\/\/.*/i.test(value)) {
      // eslint-disable-next-line no-alert
      alert(`"beeDebugApiUrl" does not start with either "http://" or "https://". Got: ${value}'`)

      return
    }

    console.log('changed debug api url', value)

    dispatchGlobalState({ type: 'BEE_DEBUG_API_URL_SAVE', newValue: value })
    dispatchGlobalState({ type: 'GLOBAL_POSTAGE_BATCH_ENABLED_SAVE', newValue: false })
    dispatchGlobalState({ type: 'GLOBAL_POSTAGE_BATCH_SAVE', newValue: null })
  }

  const onChange = (value: string): void => {
    setBeeDebugApiUrl(value)
  }

  useEffect(() => {
    setBeeDebugApiUrl(globalState.beeDebugApiUrl)
  }, [globalState.beeDebugApiUrl])

  return <EditForm label="Bee debug API URL" value={beeDebugApiUrl} onChange={onChange} onSubmit={onSubmit} />
}
