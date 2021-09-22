import puppeteer from 'puppeteer'
import fs from 'fs'
import os from 'os'
import path from 'path'

const DIR = path.join(os.tmpdir(), 'jest_puppeteer_global_setup')
const EXTENSION_PATH = path.join(__dirname, '..', '..', '/dist')

module.exports = async () => {
  console.log('Setup Puppeteer')
  const browser = await puppeteer.launch({
    executablePath: process.env.PUPPETEER_EXEC_PATH, // set by docker container
    headless: false, // extensions only supported in full chrome.
    args: [`--disable-extensions-except=${EXTENSION_PATH}`, `--load-extension=${EXTENSION_PATH}`, '--no-sandbox'],
  })
  // This global is not available inside tests but only in global teardown
  global.__BROWSER__ = browser
  // Instead, we expose the connection details via file system to be used in tests
  fs.mkdirSync(DIR)
  fs.writeFileSync(path.join(DIR, 'wsEndpoint'), browser.wsEndpoint())
}
