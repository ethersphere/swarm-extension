import * as BzzLink from './bzz-link'
import { localStorage } from './local-storage'
import { postageBatch } from './postage-batch'
import { web2HelperContent } from './web2-helper.content'

window.swarm = {
  ...window.swarm,
  web2Helper: web2HelperContent,
  localStorage,
  bzzLink: BzzLink,
  postageBatch: postageBatch,
}

console.log('window.swarm has been inited')
