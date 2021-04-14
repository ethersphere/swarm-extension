import SwarmLibrary from 'raw-loader!../../../../dist/swarm-library.js'
import { injectScript } from '../utils'

/** Only does the injection of Swarm library on document start */
export function injectSwarmLibrary(): void {
  injectScript(SwarmLibrary, 'swarm')
}