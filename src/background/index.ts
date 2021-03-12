import { StoreObserver } from '../utils/storage'
import { BeeApiListener } from './listener/bee-api.listener'
import { DebugListener } from './listener/debug.listener'

console.log('Swarm Backend script started...')
const storeObserver = new StoreObserver()
new BeeApiListener(storeObserver)
new DebugListener()
