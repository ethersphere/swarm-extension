import type puppeteer from 'puppeteer'
import type { Web2HelperContent } from '../src/contentscript/web2-helper.content'
export {} //indicate it is a module type declaration

declare global {
  namespace NodeJS {
    interface Global {
      __BROWSER__: puppeteer.Browser
    }
  }
  interface Window {
    swarm: {
      web2Helper: Web2HelperContent
    }
    swarmSessionId: string
  }
}
