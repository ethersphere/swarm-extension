import React, { useContext } from 'react'
import { GlobalContext } from '../context/global'

export function BeeApiUrlChangeForm(): JSX.Element {
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
