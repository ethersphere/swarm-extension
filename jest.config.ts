/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/en/configuration.html
 */
import type from './types/index' //FIXME: jest does not recognize own global types without this
import type { Config } from '@jest/types'
import { join } from 'path'

export default (): Promise<Config.InitialOptions> => {
  if (!process.env.BEE_STAMP) {
    throw new Error('The BEE_STAMP environment variable not set. Run the test/scripts/buy-stamp.sh script first.')
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
