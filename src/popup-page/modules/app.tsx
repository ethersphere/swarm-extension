import React, { useEffect, useContext, useState } from 'react'
import { getItem } from '../../utils/storage'
import { GlobalContext } from '../context/global'

function BeeApiUrlChangeForm(): JSX.Element {
  const globalStateContext = useContext(GlobalContext)
  const { dispatch: changeGlobalState, state: globalState } = globalStateContext
  const [beeApiUrl, setBeeApiUrl] = useState(globalState.beeApiUrl)

  const handleSubmit = (event: React.FormEvent<HTMLElement>): void => {
    event.preventDefault()

    if (!/^https?:\/\/.*/i.test(beeApiUrl)) {
      // eslint-disable-next-line no-alert
      alert(`"beeApiUrl" does not start with either "http://" or "https://". Got: ${beeApiUrl}'`)

      return
    }

    changeGlobalState({ type: 'BEE_API_URL_SAVE', newValue: beeApiUrl })
  }

  const handleBeeApiUrlChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setBeeApiUrl(event.target.value)
  }

  return (
    <form id="form-bee-api-url-change" onSubmit={handleSubmit}>
      <label>
        Bee node API address:
        <input type="text" value={beeApiUrl} onChange={handleBeeApiUrlChange} />
      </label>
      <input type="submit" value="Change" />
    </form>
  )
}

export function App(): JSX.Element {
  const globalStateContext = useContext(GlobalContext)
  const { dispatch: changeGlobalState } = globalStateContext

  const asyncInit = async (): Promise<void> => {
    const storedBeeApiUrl = await getItem('beeApiUrl')

    if (storedBeeApiUrl) {
      changeGlobalState({ type: 'BEE_API_URL_SAVE', newValue: storedBeeApiUrl })
    }
  }

  useEffect(() => {
    asyncInit()
  }, [])

  return <BeeApiUrlChangeForm />
}

export default App
