import React, { createContext, useReducer } from 'react'

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
        if (action.newValue === undefined) {
          throw new Error('No "newValue" property has been given on "BEE_API_URL_CHANGE" action')
        }

        return { ...state, beeApiUrl: action.newValue }
      default:
        throw new Error(`No valid action type given. Got: "${action.type}"`)
    }
  }, initialState)

  return <Provider value={{ state, dispatch }}>{children}</Provider>
}

export { GlobalContext, GlobalStateProvider }
