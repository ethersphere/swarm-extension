import React, { useEffect, useState } from 'react'
import { getItem, setItem } from '../../utils/storage'

export function App(): JSX.Element {
  const [beeApiUrl, setBeeApiUrl] = useState('http://localhost:1633')

  const asyncInit = async (): Promise<void> => {
    setBeeApiUrl(await getItem('beeApiUrl'))
  }

  useEffect(() => {
    asyncInit()
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLElement>): Promise<void> => {
    event.preventDefault()
    await setItem('beeApiUrl', beeApiUrl)
  }

  const handleBzzApiUrlChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setBeeApiUrl(event.target.value)
  }

  return (
    <form id="form-bee-api-url-change" onSubmit={handleSubmit}>
      <label>
        Bee node API address:
        <input type="text" value={beeApiUrl} onChange={handleBzzApiUrlChange} />
      </label>
      <input type="submit" value="Change" />
    </form>
  )
}

export default App
