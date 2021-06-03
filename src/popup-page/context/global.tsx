/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { createContext, useEffect, useReducer } from 'react'
import { setItem, StoreObserver } from '../../utils/storage'

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
  postageBatchId: string | null
  globalPostageBatchEnabled: boolean
}

interface ActionBeeUrlSave {
  type: 'BEE_API_URL_SAVE' | 'BEE_API_URL_CHANGE' | 'GLOBAL_POSTAGE_BATCH_SAVE'
  newValue: string
}
interface ActionGlobalPostageBatchEnabledSave {
  type: 'GLOBAL_POSTAGE_BATCH_ENABLED_SAVE'
  newValue: boolean
}

type Action = ActionBeeUrlSave | ActionGlobalPostageBatchEnabledSave

interface ContextValue {
  state: State
  dispatch: (action: Action) => Promise<void> | void
}

async function localStoreDispatch(action: Action): Promise<void> {
  switch (action.type) {
    case 'BEE_API_URL_SAVE':
      await setItem('beeApiUrl', action.newValue)
      break
    case 'GLOBAL_POSTAGE_BATCH_SAVE':
      await setItem('globalPostageBatch', action.newValue)
      break
    case 'GLOBAL_POSTAGE_BATCH_ENABLED_SAVE':
      await setItem('globalPostageStampEnabled', action.newValue)
    default:
      return // maybe it doesn't have store key
  }
}

const initialState: State = {
  beeApiUrl: 'http://localhost:1633',
  postageBatchId: null,
  globalPostageBatchEnabled: false,
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
      case 'BEE_API_URL_SAVE':
        return { ...state, beeApiUrl: action.newValue! as string }
      case 'GLOBAL_POSTAGE_BATCH_SAVE':
        return { ...state, postageBatchId: action.newValue! as string }
      case 'GLOBAL_POSTAGE_BATCH_ENABLED_SAVE':
        return { ...state, globalPostageBatchEnabled: Boolean(action.newValue!) }
      default:
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        throw new ActionError((action as any).type, `No valid action type given`)
    }
  }, initialState)

  useEffect(() => {
    const storeObserver = new StoreObserver()
    // localstore changes effect back the handled state
    const beeApiUrlListener = (newValue: string, oldValue: string) => {
      if (newValue !== oldValue && newValue !== state.beeApiUrl) {
        uiStateDispatch({ type: 'BEE_API_URL_SAVE', newValue })
      }
    }
    // localstore changes effect back the handled state
    const globalPostageBatchListener = (newValue: string, oldValue: string) => {
      if (newValue !== oldValue && newValue !== state.postageBatchId) {
        uiStateDispatch({ type: 'GLOBAL_POSTAGE_BATCH_SAVE', newValue })
      }
    }
    // localstore changes effect back the handled state
    const globalPostageBatchEnabledListener = (newValue: boolean, oldValue: boolean) => {
      if (newValue !== oldValue && newValue !== state.globalPostageBatchEnabled) {
        uiStateDispatch({ type: 'GLOBAL_POSTAGE_BATCH_ENABLED_SAVE', newValue })
      }
    }
    storeObserver.addListener('beeApiUrl', beeApiUrlListener)
    storeObserver.addListener('globalPostageBatch', globalPostageBatchListener)
    storeObserver.addListener('globalPostageStampEnabled', globalPostageBatchEnabledListener)

    return () => {
      storeObserver.removeListener('beeApiUrl', beeApiUrlListener)
      storeObserver.removeListener('globalPostageBatch', globalPostageBatchListener)
      storeObserver.removeListener('globalPostageStampEnabled', globalPostageBatchEnabledListener)
    }
  }, [])

  // with store write
  const dispatch: (action: Action) => Promise<void> = async (action: Action): Promise<void> => {
    uiStateDispatch(action)
    await localStoreDispatch(action)
  }

  return <Provider value={{ state, dispatch }}>{children}</Provider>
}

export { GlobalContext, GlobalStateProvider }
