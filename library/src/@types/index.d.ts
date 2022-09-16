import { Browser } from 'puppeteer'

declare global {
  // eslint-disable-next-line no-var
  var __BROWSER__: Browser
  // eslint-disable-next-line no-var
  var __BLOSSOM_ID__: string
}
