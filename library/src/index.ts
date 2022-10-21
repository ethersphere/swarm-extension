import { register } from './services/session'
import { isWebPageEnv } from './utils/environment.util'

export * from './swarm'

if (isWebPageEnv()) {
  register()
}
