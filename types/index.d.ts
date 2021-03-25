import type puppeteer from 'puppeteer'
import type { Web2Helper } from '../src/contentscript/swarm-library/web2-helper'
export {} //indicate it is a module type declaration

declare global {
  namespace NodeJS {
    interface Global {
      __BROWSER__: puppeteer.Browser
    }
  }
  interface Window {
    swarm: {
      web2Helper: Web2Helper
    }
  }
}
