import { PostageBatch } from '@ethersphere/bee-js'
import React, { ReactElement, useContext, useEffect, useState } from 'react'
import { createUseStyles } from 'react-jss'

import Toggle from './Toggle'
import { getPostageBatches } from '../../utils/bee-js'
import { GlobalContext } from '../context/global'
import { utilizationPercentage } from '../utils'

const useStyles = createUseStyles({
  button: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
})

export function PostageBatchElement(): ReactElement {
  const classes = useStyles()
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

  const handleUseGlobalPostageBatch = (checked: boolean): void => {
    dispatchGlobalState({ type: 'GLOBAL_POSTAGE_BATCH_ENABLED_SAVE', newValue: checked })

    if (checked) {
      retrievePostageBatches()
    }
  }

  const truncatePostageBatchId = (postageBatchId: string) => {
    const idLength = 5

    return (
      postageBatchId.substr(0, idLength) + '...' + postageBatchId.substr(postageBatchId.length - idLength, idLength)
    )
  }

  const retrievePostageBatches = async () => {
    console.log('fetch postagethings')
    setFetchedPostageBatches(await getPostageBatches(globalState.beeDebugApiUrl))
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
          <td>{truncatePostageBatchId(postageBatch.batchID)}</td>
          <td>{utilizationPercentage(postageBatch)}%</td>
          <td>{selected ? 'selected' : selectButton}</td>
        </tr>
      )
    })
  }

  return (
    <div>
      <div>
        <div className={classes.button}>
          Use global Postage Batch
          <Toggle checked={globalState.globalPostageBatchEnabled} onToggle={handleUseGlobalPostageBatch} />
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
