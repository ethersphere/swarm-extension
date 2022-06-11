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
  beeDebugApiUrl: string
  postageBatchId: string | null
  globalPostageBatchEnabled: boolean
  web2OriginEnabled: boolean
}

interface ActionBeeUrlSave {
  type: 'BEE_API_URL_SAVE'
  newValue: string
}

interface ActionBeeDebugUrlSave {
  type: 'BEE_DEBUG_API_URL_SAVE'
  newValue: string
}

interface ActionGlobalPostageBatchEnabledSave {
  type: 'GLOBAL_POSTAGE_BATCH_ENABLED_SAVE'
  newValue: boolean
}
interface ActionPostageBatchSave {
  type: 'GLOBAL_POSTAGE_BATCH_SAVE'
  newValue: string | null
}

interface ActionWeb2OriginEnableSave {
  type: 'WEB2_ORIGIN_ENABLED_SAVE'
  newValue: boolean
}

/**
 * The actions types are either ending with `_SAVE` or `_CHANGE`.
 *
 * The former saves the value into the localStorage, the latter only changes the globalState in the React app.
 */
type Action =
  | ActionPostageBatchSave
  | ActionBeeUrlSave
  | ActionGlobalPostageBatchEnabledSave
  | ActionBeeDebugUrlSave
  | ActionWeb2OriginEnableSave

interface ContextValue {
  state: State
  dispatch: (action: Action) => Promise<void> | void
}

async function localStoreDispatch(action: Action): Promise<void> {
  switch (action.type) {
    case 'BEE_API_URL_SAVE':
      await setItem('beeApiUrl', action.newValue)
      break
    case 'WEB2_ORIGIN_ENABLED_SAVE':
      await setItem('web2OriginEnabled', action.newValue)
      break
    case 'GLOBAL_POSTAGE_BATCH_SAVE':
      await setItem('globalPostageBatch', action.newValue)
      break
    case 'GLOBAL_POSTAGE_BATCH_ENABLED_SAVE':
      await setItem('globalPostageStampEnabled', action.newValue)
      break
    case 'BEE_DEBUG_API_URL_SAVE':
      await setItem('beeDebugApiUrl', action.newValue)
      break
    default:
      return // maybe it doesn't have store key
  }
}

const initialState: State = {
  beeApiUrl: 'http://127.0.0.1:1633',
  beeDebugApiUrl: 'http://127.0.0.1:1635',
  postageBatchId: null,
  globalPostageBatchEnabled: false,
  web2OriginEnabled: false,
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
      case 'BEE_API_URL_SAVE':
        return { ...state, beeApiUrl: action.newValue }
      case 'BEE_DEBUG_API_URL_SAVE':
        return { ...state, beeDebugApiUrl: action.newValue }
      case 'WEB2_ORIGIN_ENABLED_SAVE':
        return { ...state, web2OriginEnabled: action.newValue }
      case 'GLOBAL_POSTAGE_BATCH_SAVE':
        return { ...state, postageBatchId: action.newValue }
      case 'GLOBAL_POSTAGE_BATCH_ENABLED_SAVE':
        return { ...state, globalPostageBatchEnabled: action.newValue }
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
    const beeDebugApiUrlListener = (newValue: string, oldValue: string) => {
      if (newValue !== oldValue && newValue !== state.beeDebugApiUrl) {
        uiStateDispatch({ type: 'BEE_DEBUG_API_URL_SAVE', newValue })
      }
    }
    const web2OriginEnableListener = (newValue: boolean, oldValue: boolean) => {
      if (newValue !== oldValue && newValue !== state.web2OriginEnabled) {
        uiStateDispatch({ type: 'WEB2_ORIGIN_ENABLED_SAVE', newValue })
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
    storeObserver.addListener('beeDebugApiUrl', beeDebugApiUrlListener)
    storeObserver.addListener('globalPostageBatch', globalPostageBatchListener)
    storeObserver.addListener('globalPostageStampEnabled', globalPostageBatchEnabledListener)
    storeObserver.addListener('web2OriginEnabled', web2OriginEnableListener)

    return () => {
      storeObserver.removeListener('beeApiUrl', beeApiUrlListener)
      storeObserver.removeListener('beeDebugApiUrl', beeDebugApiUrlListener)
      storeObserver.removeListener('globalPostageBatch', globalPostageBatchListener)
      storeObserver.removeListener('globalPostageStampEnabled', globalPostageBatchEnabledListener)
      storeObserver.removeListener('web2OriginEnabled', web2OriginEnableListener)
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
