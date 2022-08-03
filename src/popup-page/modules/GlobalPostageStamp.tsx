import { BatchId, PostageBatch } from '@ethersphere/bee-js'
import React, { ReactElement, useContext, useEffect, useState } from 'react'
import { createUseStyles } from 'react-jss'

import Toggle from './Toggle'
import { getPostageBatches } from '../../utils/bee-js'
import { GlobalContext } from '../context/global'
import { utilizationPercentage } from '../utils'
import Row from './Row'

const useStyles = createUseStyles({
  button: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
})

export default function GlobalPostageStamp(): ReactElement {
  const classes = useStyles()
  const globalStateContext = useContext(GlobalContext)
  const { dispatch: dispatchGlobalState, state: globalState } = globalStateContext
  const [fetchedPostageBatches, setFetchedPostageBatches] = useState<PostageBatch[]>([])

  useEffect(() => {
    console.log('globalstate', globalState.globalPostageBatchEnabled)

    if (globalState.globalPostageBatchEnabled) retrievePostageBatches()
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
    const postageBatches = await getPostageBatches(globalState.beeDebugApiUrl)
    setFetchedPostageBatches(postageBatches)
    const batchIds = postageBatches.map(batch => batch.batchID)

    if (
      (!globalState.postageBatchId || !batchIds.includes(globalState.postageBatchId as BatchId)) &&
      postageBatches[0]
    ) {
      dispatchGlobalState({ type: 'GLOBAL_POSTAGE_BATCH_SAVE', newValue: postageBatches[0].batchID })
    }
  }

  const getPostageBatchUsage = (): string => {
    const stamp = fetchedPostageBatches.find(b => b.batchID === globalState.postageBatchId)

    if (stamp) return utilizationPercentage(stamp)

    return '-'
  }

  const onChange = (event: any) =>
    dispatchGlobalState({ type: 'GLOBAL_POSTAGE_BATCH_SAVE', newValue: event.target.value })

  const getSelect = () => {
    if (fetchedPostageBatches.length > 0) {
      return (
        <select
          id="postage-stamps-select"
          name="stamps"
          value={globalState.postageBatchId || undefined}
          onChange={onChange}
          style={{
            cursor: 'pointer',
            border: 0,
            backgroundColor: 'rgba(0,0,0,0)',
            fontFamily: 'iA Writer Mono V',
          }}
        >
          {fetchedPostageBatches.map(batch => (
            <option value={batch.batchID}>{truncatePostageBatchId(batch.batchID)}</option>
          ))}
        </select>
      )
    }

    return 'No postage stamps'
  }

  return (
    <>
      <Row>
        <div className={classes.button}>
          Use global Postage Batch
          <Toggle
            id="postage-stamps-toggle"
            checked={globalState.globalPostageBatchEnabled}
            onToggle={handleUseGlobalPostageBatch}
          />
        </div>
      </Row>
      <div hidden={!globalState.globalPostageBatchEnabled}>
        <Row
          style={{
            marginTop: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          Selected stamp
          <div>{getSelect()}</div>
          {/* FIXME: This is used only for tests and should be done differently */}
          <div id="postage-stamp-batch-id" hidden>
            {globalState.postageBatchId}
          </div>
        </Row>
      </div>
      <div
        hidden={
          !globalState.globalPostageBatchEnabled || !globalState.postageBatchId || fetchedPostageBatches.length < 1
        }
      >
        <Row style={{ marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Stamp usage <div>{getPostageBatchUsage()}%</div>
        </Row>
      </div>
    </>
  )
}
