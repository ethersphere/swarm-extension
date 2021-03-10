import React, { useEffect, useContext } from 'react'
import { getItem } from '../../utils/storage'
import { GlobalContext } from '../context/global'

function BeeApiUrlChangeForm(): JSX.Element {
  const globalStateContext = useContext(GlobalContext)
  const { dispatch: changeGlobalState, state: globalState } = globalStateContext

  const asyncInit = async (): Promise<void> => {
    const storedBeeApiUrl = await getItem('beeApiUrl')

    if (storedBeeApiUrl) {
      changeGlobalState({ type: 'BEE_API_URL_CHANGE', newValue: storedBeeApiUrl })
    }
  }

  useEffect(() => {
    asyncInit()
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLElement>): Promise<void> => {
    event.preventDefault()
    await changeGlobalState({ type: 'BEE_API_URL_SAVE', newValue: globalState.beeApiUrl })
  }

  const handleBeeApiUrlChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    // not async method, it just changes the ui state
    changeGlobalState({ type: 'BEE_API_URL_CHANGE', newValue: event.target.value })
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

export function App(): JSX.Element {
  return <BeeApiUrlChangeForm />
}

export default App
