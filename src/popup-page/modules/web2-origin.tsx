import React, { useContext } from 'react'
import { GlobalContext } from '../context/global'

export function Web2Origin(): JSX.Element {
  const globalStateContext = useContext(GlobalContext)
  const { dispatch: dispatchGlobalState, state: globalState } = globalStateContext

  const handleWeb2OriginClick = (): void => {
    dispatchGlobalState({ type: 'WEB2_ORIGIN_ENABLED_SAVE', newValue: !globalState.web2OriginEnabled })
  }

  return (
    <div id="form-bee-debug-api-url-change">
      <label>
        Enable Web2 origins for dApps (unsafe)
        <input type="checkbox" checked={globalState.web2OriginEnabled} onClick={handleWeb2OriginClick} />
      </label>
    </div>
  )
}
