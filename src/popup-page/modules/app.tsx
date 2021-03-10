import React, { useEffect, useContext, useState } from 'react'
import { getItem } from '../../utils/storage'
import { GlobalContext } from '../context/global'

export function App(): JSX.Element {
  const globalStateContext = useContext(GlobalContext)
  const { dispatch: changeGlobalState, state: globalState } = globalStateContext
  const [beeApiUrl, setBeeApiUrl] = useState(globalState.beeApiUrl)

  const asyncInit = async (): Promise<void> => {
    const storedBeeApiUrl = await getItem('beeApiUrl')

    if (storedBeeApiUrl) {
      changeGlobalState({ type: 'BEE_API_URL_CHANGE', newValue: storedBeeApiUrl })
      setBeeApiUrl(storedBeeApiUrl)
    }
  }

  useEffect(() => {
    asyncInit()
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLElement>): Promise<void> => {
    event.preventDefault()
    await changeGlobalState({ type: 'BEE_API_URL_CHANGE', newValue: beeApiUrl })
  }

  return (
    <form id="form-bee-api-url-change" onSubmit={handleSubmit}>
      <label>
        Bee node API address:
        <input type="text" value={beeApiUrl} onChange={e => setBeeApiUrl(e.target.value)} />
      </label>
      <input type="submit" value="Change" />
    </form>
  )
}

export default App
