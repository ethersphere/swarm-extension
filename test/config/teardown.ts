import os from 'os'
import path from 'path'
import rimraf from 'rimraf'

const DIR = path.join(os.tmpdir(), 'jest_puppeteer_global_setup')

module.exports = async () => {
  // close the browser instance
  if (!process.argv.includes('--demo=true')) await global.__BROWSER__.close()

  // clean-up the wsEndpoint file
  rimraf.sync(DIR)
}
