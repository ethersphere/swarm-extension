import { injectScript } from '../utils'

export function injectSessionId(sessionId: string): void {
  injectScript(`window.swarm = {...window.swarm, sessionId: '${sessionId}'}`, 'swarmSessionId')
}
