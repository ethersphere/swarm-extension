import React, { createContext, useReducer } from 'react'

export class GlobalStateActionError extends Error {
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
  type: 'BEE_API_URL_CHANGE'
  newValue?: T
}

interface ContextValue {
  state: State
  dispatch: React.Dispatch<Action<string>>
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
  const [state, dispatch] = useReducer((state: State, action: Action): State => {
    switch (action.type) {
      case 'BEE_API_URL_CHANGE':
        if (!action.newValue || typeof action.newValue !== 'string') {
          throw new GlobalStateActionError(action.type, 'No "newValue" property has been passed')
        }

        if (!/^https?:\/\/.*/i.test(action.newValue)) {
          throw new GlobalStateActionError(
            action.type,
            `"newValue" does not start with either "http://" or "https://". Got: ${action.type}'`,
          )
        }

        return { ...state, beeApiUrl: action.newValue }
      default:
        throw new GlobalStateActionError(action.type, `No valid action type given`)
    }
  }, initialState)

  return <Provider value={{ state, dispatch }}>{children}</Provider>
}

export { GlobalContext, GlobalStateProvider }
