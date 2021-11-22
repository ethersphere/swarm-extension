import React, { useContext, useEffect } from 'react'
import { getItem } from '../../utils/storage'
import { GlobalContext } from '../context/global'
import { BeeApiUrlChangeForm } from './bee-api-url-change-form'
import { PostageBatchElement } from './postage-batch-element'

export function App(): JSX.Element {
  const globalStateContext = useContext(GlobalContext)
  const { dispatch: changeGlobalState } = globalStateContext

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
  }, [])

  return (
    <div>
      <BeeApiUrlChangeForm />
      <hr></hr>
      <PostageBatchElement />
    </div>
  )
}

export default App
