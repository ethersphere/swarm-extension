import { isExtensionServiceWorkerEnv, isWebPageEnv } from '../utils/environment.util'
import { SwarmMessages } from './swarm-messages'
import { DappSwarmMessages } from './dapp-swarm-messages'
import { E2ESwarmMessages } from './e2e-swarm-messages'

export function createSwarmMessages(extensionId: string): SwarmMessages {
  if (isWebPageEnv()) {
    return new DappSwarmMessages()
  }
  if (isExtensionServiceWorkerEnv()) {
    return new E2ESwarmMessages(extensionId)
  }
  throw new Error('Swarm: The current environment is not supported.')
}
