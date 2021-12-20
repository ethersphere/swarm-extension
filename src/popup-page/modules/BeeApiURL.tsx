import React, { useContext, useEffect, useState } from 'react'
import EditForm from './EditForm'
import { GlobalContext } from '../context/global'

export default function BeeApiUrl(): JSX.Element {
  const globalStateContext = useContext(GlobalContext)
  const { dispatch: dispatchGlobalState, state: globalState } = globalStateContext
  const [beeApiUrl, setBeeApiUrl] = useState<string>(globalState.beeApiUrl)

  const onSubmit = (value: string): void => {
    if (!/^https?:\/\/.*/i.test(value)) {
      // eslint-disable-next-line no-alert
      alert(`"beeApiUrl" does not start with either "http://" or "https://". Got: ${value}'`)

      return
    }
    console.log('changed api url', value)

    dispatchGlobalState({ type: 'BEE_API_URL_SAVE', newValue: value })
    dispatchGlobalState({ type: 'GLOBAL_POSTAGE_BATCH_ENABLED_SAVE', newValue: false })
    dispatchGlobalState({ type: 'GLOBAL_POSTAGE_BATCH_SAVE', newValue: null })
  }

  const onChange = (value: string): void => {
    setBeeApiUrl(value)
  }

  useEffect(() => {
    setBeeApiUrl(globalState.beeApiUrl)
  }, [globalState.beeApiUrl])

  return <EditForm label="Bee API URL" value={beeApiUrl} onChange={onChange} onSubmit={onSubmit} />
}
