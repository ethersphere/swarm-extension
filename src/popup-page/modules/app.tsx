import { PostageBatch } from '@ethersphere/bee-js'
import React, { useEffect, useContext, useState } from 'react'
import { getPostageBatches } from '../../utils/bee-js'
import { getItem } from '../../utils/storage'
import { GlobalContext } from '../context/global'

function BeeApiUrlChangeForm(): JSX.Element {
  const globalStateContext = useContext(GlobalContext)
  const { dispatch: dispatchGlobalState, state: globalState } = globalStateContext

  const handleSubmit = (event: React.FormEvent<HTMLElement>): void => {
    event.preventDefault()

    if (!/^https?:\/\/.*/i.test(globalState.beeApiUrl)) {
      // eslint-disable-next-line no-alert
      alert(`"beeApiUrl" does not start with either "http://" or "https://". Got: ${globalState.beeApiUrl}'`)

      return
    }

    dispatchGlobalState({ type: 'BEE_API_URL_SAVE', newValue: globalState.beeApiUrl })
  }

  const handleBeeApiUrlChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    // not async method, it just changes the ui state
    dispatchGlobalState({ type: 'BEE_API_URL_CHANGE', newValue: event.target.value })
  }

  return (
    <form id="form-bee-api-url-change" onSubmit={handleSubmit}>
      <label>
        Bee node API address:
        <input type="text" value={globalState.beeApiUrl} onChange={handleBeeApiUrlChange} />
      </label>
      <input type="submit" value="Change" />
    </form>
  )
}

function PostageBatchElement(): JSX.Element {
  const globalStateContext = useContext(GlobalContext)
  const { dispatch: dispatchGlobalState, state: globalState } = globalStateContext
  const [fetchedPostageBatches, setFetchedPostageBatches] = useState<PostageBatch[]>([])

  const init = (): void => {
    console.log('globalstate', globalState.globalPostageBatchEnabled)

    if (globalState.globalPostageBatchEnabled) retrievePostageBatches()
  }

  useEffect(() => {
    init()
  }, [globalState.globalPostageBatchEnabled])

  const handleUseGlobalPostageBatch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const { checked } = event.target
    dispatchGlobalState({ type: 'GLOBAL_POSTAGE_BATCH_ENABLED_SAVE', newValue: checked })

    if (checked) {
      retrievePostageBatches()
    }
  }

  const retrievePostageBatches = async () => {
    console.log('fetch postagethings')
    setFetchedPostageBatches(await getPostageBatches(globalState.beeApiUrl))
  }

  const postageBatchElements = (): JSX.Element[] => {
    const choosePostageBatch = (postageBatchId: string) => {
      dispatchGlobalState({ type: 'GLOBAL_POSTAGE_BATCH_SAVE', newValue: postageBatchId })
    }

    return fetchedPostageBatches.map(postageBatch => {
      const selected = globalState.postageBatchId === postageBatch.batchID
      const selectButton = (
        <a onClick={() => choosePostageBatch(postageBatch.batchID)} className="a-click">
          select
        </a>
      )

      return (
        <tr key={postageBatch.batchID + selected} className={selected ? 'bold' : ''}>
          <td>{postageBatch.batchID}</td>
          <td>{postageBatch.utilization}</td>
          <td>{selected ? 'selected' : selectButton}</td>
        </tr>
      )
    })
  }

  return (
    <div id="form-postage-batch">
      <div>
        <div className="margin-top">
          <label>
            <input
              id="global-postage-stamp-enabled"
              type="checkbox"
              onChange={handleUseGlobalPostageBatch}
              checked={globalState.globalPostageBatchEnabled}
            />
            Use global Postage Batch
          </label>
        </div>
        <div id="global-postage-batch-details" className="margin-top" hidden={!globalState.globalPostageBatchEnabled}>
          <div>
            <div>Global Postage Batch ID: </div>
            <div id="global-postage-batch-id">
              {globalState.postageBatchId ? globalState.postageBatchId : '<no-chosen-id>'}
            </div>
          </div>
          <div>
            <table id="postage-batch-list">
              <thead>
                <tr>
                  <th>Batch ID</th>
                  <th>Utilization</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>{postageBatchElements()}</tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export function App(): JSX.Element {
  const globalStateContext = useContext(GlobalContext)
  const { dispatch: changeGlobalState } = globalStateContext

  const asyncInit = async (): Promise<void> => {
    // Read variables from the localstore and
    // update the globalstate in need.
    const storedBeeApiUrl = await getItem('beeApiUrl')
    const storedGlobalPostageBatchId = await getItem('globalPostageBatch')
    const storedGlobalPostageBatchEnabled = await getItem('globalPostageStampEnabled')

    if (storedBeeApiUrl) {
      changeGlobalState({ type: 'BEE_API_URL_SAVE', newValue: storedBeeApiUrl })
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
