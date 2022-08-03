import { StoreObserver } from '../utils/storage'
import { DappSessionManager } from './dapp-session.manager'
import { DappSessionFeeder } from './feeder/dapp-session.feeder'
import { E2ESessionFeeder } from './feeder/e2e-session.feeder'
import { LocalStorageFeeder } from './feeder/local-storage.feeder'
import { Web2HelperFeeder } from './feeder/web2-helper.feeder'
import { PostageBatchFeeder } from './feeder/postage-batch.feeder'
import { BeeApiListener } from './listener/bee-api.listener'
import { DebugListener } from './listener/debug.listener'
import { setupLiveReload } from './live-reload/live-reload'

console.log('Swarm Backend script started...')
const storeObserver = new StoreObserver()
const beeApiListener = new BeeApiListener(storeObserver)
const dappSessionManager = new DappSessionManager()
new DappSessionFeeder(dappSessionManager)
new E2ESessionFeeder(dappSessionManager)
new LocalStorageFeeder(dappSessionManager)
new DebugListener()
new Web2HelperFeeder(beeApiListener)
new PostageBatchFeeder()

if (process.env.SWARM_DEVELOPMENT) setupLiveReload()
