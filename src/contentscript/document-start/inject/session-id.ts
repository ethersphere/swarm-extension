import { injectScript } from '../utils'

export function injectSessionId(sessionId: string): void {
  injectScript(`window.swarmSessionId = '${sessionId}'`, 'swarmSessionId')
}
