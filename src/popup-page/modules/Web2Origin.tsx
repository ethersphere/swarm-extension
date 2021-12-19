import React, { useContext } from 'react'
import { GlobalContext } from '../context/global'
import Toggle from './Toggle'

export default function Web2Origin(): JSX.Element {
  const globalStateContext = useContext(GlobalContext)
  const { dispatch: dispatchGlobalState, state: globalState } = globalStateContext

  const handleWeb2OriginClick = (checked: boolean): void => {
    dispatchGlobalState({ type: 'WEB2_ORIGIN_ENABLED_SAVE', newValue: checked })
  }

  const checked = globalState.web2OriginEnabled

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      Enable Web2 origins for dApps (unsafe)
      <div>
        {checked ? 'on' : 'off'} <Toggle checked={checked} onToggle={handleWeb2OriginClick} />
      </div>
    </div>
  )
}
