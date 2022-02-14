import { injectScript } from '../utils'

/** Only does the injection of Swarm library on document start */
export function injectSwarmLibrary(): void {
  injectScript('swarm-library.js', 'swarm')
}
