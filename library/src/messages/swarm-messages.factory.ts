import { isWebPageEnv } from '../utils/environment.util'
import { SwarmMessages } from './swarm-messages'
import { DappSwarmMessages } from './dapp-swarm-messages'

export function createSwarmMessages(extensionId: string): SwarmMessages {
  if (isWebPageEnv()) {
    return new DappSwarmMessages()
  }
  throw new Error('Swarm: The current environment is not supported.')
}
