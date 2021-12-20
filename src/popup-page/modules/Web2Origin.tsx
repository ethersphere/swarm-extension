import React, { useContext } from 'react'
import { createUseStyles } from 'react-jss'

import { GlobalContext } from '../context/global'
import Toggle from './Toggle'

const useStyles = createUseStyles({
  root: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
})

export default function Web2Origin(): JSX.Element {
  const classes = useStyles()
  const globalStateContext = useContext(GlobalContext)
  const { dispatch: dispatchGlobalState, state: globalState } = globalStateContext

  const handleWeb2OriginClick = (checked: boolean): void => {
    dispatchGlobalState({ type: 'WEB2_ORIGIN_ENABLED_SAVE', newValue: checked })
  }

  const checked = globalState.web2OriginEnabled

  return (
    <div className={classes.root}>
      Enable Web2 origins for dApps (unsafe)
      <div>
        {checked ? 'on' : 'off'} <Toggle checked={checked} onToggle={handleWeb2OriginClick} />
      </div>
    </div>
  )
}
