import { injectScript } from '../utils'

/** Only does the injection of Swarm library on document start */
export function injectSwarmHtml(): void {
  injectScript('swarm-html.js', 'swarmHtml')
}
