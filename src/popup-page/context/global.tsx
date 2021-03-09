import React, { createContext, useReducer } from 'react'

export class GlobalStateActionError extends Error {
  public action: string
  public message: string
  constructor(action: string, message: string) {
    const formattedMessage = `Error happened on action "${action}": ${message} `
    super(formattedMessage)
    this.action = action
    this.message = message
  }
}

interface IState {
  beeApiUrl: string
}

interface IAction<T = string> {
  type: 'BEE_API_URL_CHANGE'
  newValue?: T
}

interface ContextValue {
  state: IState
  dispatch: React.Dispatch<IAction<string>>
}

const initialState: IState = {
  beeApiUrl: 'http://localhost:1633',
}
const GlobalContext = createContext<ContextValue>({
  state: initialState,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  dispatch: () => {},
})
const { Provider } = GlobalContext

const GlobalStateProvider = ({ children }: { children: React.ReactElement }): React.ReactElement => {
  const [state, dispatch] = useReducer((state: IState, action: IAction): IState => {
    switch (action.type) {
      case 'BEE_API_URL_CHANGE':
        if (!action.newValue || typeof action.newValue !== 'string') {
          throw new GlobalStateActionError(action.type, 'No "newValue" property has been passed')
        }

        if (!/^https?:\/\/[a-zA-Z0-9\.]+/i.test(action.newValue)) {
          throw new GlobalStateActionError(action.type, '"newValue" is not a valid HTTP URL address')
        }

        return { ...state, beeApiUrl: action.newValue }
      default:
        throw new GlobalStateActionError(action.type, `No valid action type given`)
    }
  }, initialState)

  return <Provider value={{ state, dispatch }}>{children}</Provider>
}

export { GlobalContext, GlobalStateProvider }
