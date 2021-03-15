import { StoreObserver } from '../utils/storage'
import { Web2HelperFeeder } from './feeder/web2-helper.feeder'
import { BeeApiListener } from './listener/bee-api.listener'
import { DebugListener } from './listener/debug.listener'

console.log('Swarm Backend script started...')
const storeObserver = new StoreObserver()
const beeApiListener = new BeeApiListener(storeObserver)
new DebugListener()
new Web2HelperFeeder(beeApiListener)
