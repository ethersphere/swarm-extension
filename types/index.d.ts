import type puppeteer from 'puppeteer'
import type { LocalStorage } from '../src/contentscript/swarm-library/local-storage'
import type { Web2HelperContent } from '../src/contentscript/swarm-library/web2-helper.content'
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
      localStorage: LocalStorage
      sessionId: string
      bzzLink: typeof import('../src/contentscript/swarm-library/bzz-link')
    }
  }
}
