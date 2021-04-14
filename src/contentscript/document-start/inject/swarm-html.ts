import SwarmHtml from 'raw-loader!../../../../dist/swarm-html.js'
import { injectScript } from '../utils'

/** Only does the injection of Swarm library on document start */
export function injectSwarmHtml(): void {
  injectScript(SwarmHtml, 'swarmHtml')
}
