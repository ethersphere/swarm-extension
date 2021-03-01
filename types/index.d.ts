import type puppeteer from 'puppeteer'
export {} //indicate it is a module type declaration

declare global {
  namespace NodeJS {
    interface Global {
      __BROWSER__: puppeteer.Browser
    }
  }
}
