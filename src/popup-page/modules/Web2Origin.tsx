import React, { useContext } from 'react'
import { GlobalContext } from '../context/global'
import Toggle from './Toggle'

export default function Web2Origin(): JSX.Element {
  const globalStateContext = useContext(GlobalContext)
  const { dispatch: dispatchGlobalState, state: globalState } = globalStateContext

  const handleWeb2OriginClick = (): void => {
    dispatchGlobalState({ type: 'WEB2_ORIGIN_ENABLED_SAVE', newValue: !globalState.web2OriginEnabled })
  }

  return (
    <div>
      <label>Enable Web2 origins for dApps (unsafe) {JSON.stringify(globalState.web2OriginEnabled)}</label>
      <Toggle checked={globalState.web2OriginEnabled} onClick={handleWeb2OriginClick} />
    </div>
  )
}
