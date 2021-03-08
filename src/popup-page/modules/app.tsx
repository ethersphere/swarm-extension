import React, { useEffect, useContext } from 'react'
import { getItem, setItem } from '../../utils/storage'
import { GlobalContext } from '../context/global'

export function App(): JSX.Element {
  const globalStateContext = useContext(GlobalContext)
  const { dispatch, state: globalState } = globalStateContext

  const asyncInit = async (): Promise<void> => {
    const beeApiUrl = await getItem('beeApiUrl')

    if (beeApiUrl) dispatch({ type: 'BEE_API_URL_CHANGE', newValue: beeApiUrl })
  }

  useEffect(() => {
    asyncInit()
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLElement>): Promise<void> => {
    event.preventDefault()
    await setItem('beeApiUrl', globalState.beeApiUrl)
  }

  const handleBzzApiUrlChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch({ type: 'BEE_API_URL_CHANGE', newValue: event.target.value })
  }

  return (
    <form id="form-bee-api-url-change" onSubmit={handleSubmit}>
      <label>
        Bee node API address:
        <input type="text" value={globalState.beeApiUrl} onChange={handleBzzApiUrlChange} />
      </label>
      <input type="submit" value="Change" />
    </form>
  )
}

export default App
