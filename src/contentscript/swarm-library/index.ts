import * as BzzLink from './bzz-link-page-api'
import { localStorage } from './local-storage'
import { web2HelperContent } from './web2-helper.content'

window.swarm = {
  ...window.swarm,
  web2Helper: web2HelperContent,
  localStorage,
  bzzLink: BzzLink,
}

console.log('window.swarm has been inited')
