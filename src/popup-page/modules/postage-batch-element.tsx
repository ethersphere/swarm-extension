import { PostageBatch } from '@ethersphere/bee-js'
import React, { ReactElement, useContext, useEffect, useState } from 'react'
import { getPostageBatches } from '../../utils/bee-js'
import { GlobalContext } from '../context/global'

export function PostageBatchElement(): ReactElement {
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

  const postageBatchElements = (): ReactElement[] => {
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
