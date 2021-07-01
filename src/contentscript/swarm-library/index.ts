import { localStorage } from './local-storage'
import { web2HelperContent } from './web2-helper.content'

window.swarm = {
  web2Helper: web2HelperContent,
  localStorage,
}

console.log('window.swarm has been inited')
