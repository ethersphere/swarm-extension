/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/en/configuration.html
 */
import type from './types/index' //FIXME: jest does not recognize own global types without this
import type { Config } from '@jest/types'
import { BeeDebug } from '@ethersphere/bee-js'
import { join } from 'path'

export default async (): Promise<Config.InitialOptions> => {
  if (!process.env.BEE_STAMP) {
    try {
      console.log('Creating postage stamps...')
      const beeDebugUrl = process.env.BEE_DEBUG_API_URL || 'http://localhost:1635'
      const bee = new BeeDebug(beeDebugUrl)
      process.env.BEE_STAMP = await bee.createPostageBatch('1', 20)
      console.log('Queen stamp: ', process.env.BEE_STAMP)
      // sleep for 11 seconds (10 blocks with ganache block time = 1s)
      // needed for postage batches to become usable
      // FIXME: sleep should be imported for this, but then we fail with
      //        Could not find a declaration file for module 'tar-js'
      await new Promise<void>(resolve => setTimeout(() => resolve(), 11_000))
    } catch (e) {
      // It is possible that for unit tests the Bee nodes does not run
      // so we are only logging errors and not leaving them to propagate
      console.error(e)
    }
  }

  return Promise.resolve({
    // Indicates whether the coverage information should be collected while executing the test
    // collectCoverage: false,

    // The directory where Jest should output its coverage files
    coverageDirectory: 'coverage',

    // An array of regexp pattern strings used to skip coverage collection
    coveragePathIgnorePatterns: ['/node_modules/'],

    // An array of directory names to be searched recursively up from the requiring module's location
    moduleDirectories: ['node_modules'],

    globalSetup: join(__dirname, 'test/config/setup.ts'),
    globalTeardown: join(__dirname, 'test/config/teardown.ts'),
    testEnvironment: join(__dirname, 'test/config/puppeteer_environment.js'),

    testRegex: 'test/.*\\.spec\\.ts',

    // The root directory that Jest should scan for tests and modules within
    rootDir: 'test',

    testTimeout: 60000,

    // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
    testPathIgnorePatterns: ['/node_modules/'],
  })
}
