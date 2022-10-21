import { isExtensionServiceWorkerEnv, isWebPageEnv } from '../utils/environment.util'
import { SwarmMessages } from './swarm-messages'
import { DappSwarmMessages } from './dapp-swarm-messages'
import { E2ESwarmMessages } from './e2e-swarm-messages'
import { SessionId } from '../model/general.types'

export function createSwarmMessages(extensionId: string, sessionId: SessionId): SwarmMessages {
  if (isWebPageEnv()) {
    return new DappSwarmMessages(sessionId)
  }

  if (isExtensionServiceWorkerEnv()) {
    return new E2ESwarmMessages(extensionId, sessionId)
  }
  throw new Error('Swarm: The current environment is not supported.')
}
