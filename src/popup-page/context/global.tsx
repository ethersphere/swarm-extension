/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { createContext, useReducer } from 'react'
import { setItem } from '../../utils/storage'

export class ActionError extends Error {
  public action: string
  public description: string
  constructor(action: string, description: string) {
    const formattedMessage = `Error happened on action "${action}": ${description} `
    super(formattedMessage)
    this.action = action
    this.description = description
  }
}

interface State {
  beeApiUrl: string
}

interface Action<T = string> {
  type: 'BEE_API_URL_SAVE' | 'BEE_API_URL_CHANGE'
  newValue?: T
}

interface ContextValue {
  state: State
  dispatch: (action: Action<string>) => Promise<void> | void
}

/** Checks dispatched actions have correct values */
function actionCheck<T = string>(action: Action<T>): void | never {
  switch (action.type) {
    case 'BEE_API_URL_SAVE':
      if (!action.newValue || typeof action.newValue !== 'string') {
        throw new ActionError(action.type, 'No "newValue" property has been passed')
      }

      if (!/^https?:\/\/.*/i.test(action.newValue)) {
        throw new ActionError(
          action.type,
          `"newValue" does not start with either "http://" or "https://". Got: ${action.type}'`,
        )
      }
      break
    case 'BEE_API_URL_CHANGE':
      if (action.newValue === undefined) {
        throw new ActionError(action.type, `"newValue" is undefined`)
      }
    default:
      return
  }
}

async function localStoreDispatch<T = string>(action: Action<T>): Promise<void> {
  switch (action.type) {
    case 'BEE_API_URL_SAVE':
      await setItem('beeApiUrl', (action.newValue as unknown) as string)
      break
    default:
      return // maybe it doesn't have store key
  }
}

const initialState: State = {
  beeApiUrl: 'http://localhost:1633',
}

const GlobalContext = createContext<ContextValue>({
  state: initialState,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  dispatch: () => {},
})

const { Provider } = GlobalContext

const GlobalStateProvider = ({ children }: { children: React.ReactElement }): React.ReactElement => {
  const [state, uiStateDispatch] = useReducer((state: State, action: Action): State => {
    switch (action.type) {
      case 'BEE_API_URL_CHANGE':
        return { ...state, beeApiUrl: action.newValue! }
      case 'BEE_API_URL_SAVE':
        return { ...state, beeApiUrl: action.newValue! }
      default:
        throw new ActionError(action.type, `No valid action type given`)
    }
  }, initialState)

  // with store write
  const dispatch: (action: Action<string>) => Promise<void> = async (action: Action<string>): Promise<void> => {
    actionCheck(action)
    uiStateDispatch(action)
    await localStoreDispatch(action)
  }

  return <Provider value={{ state, dispatch }}>{children}</Provider>
}

export { GlobalContext, GlobalStateProvider }
