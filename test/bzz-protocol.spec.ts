import { join } from 'path'
import { Page } from 'puppeteer'
import { BEE_API_URL } from './utils'
import { Bee } from '@ethersphere/bee-js'

describe('Bee class - in browser', () => {
  let page: Page
  let bee: Bee

  beforeAll(async done => {
    bee = new Bee(BEE_API_URL)
    const uploadOptions = {
      indexDocument: 'index.html',
    }
    await bee.uploadFilesFromDirectory(join(__dirname, 'bzz-test-page', 'jinn-page'), true, uploadOptions)
    await bee.uploadFilesFromDirectory(join(__dirname, 'bzz-test-page', 'jafar-page'), true, uploadOptions)
    const rootFolderReference = await bee.uploadFilesFromDirectory(
      join(__dirname, 'bzz-test-page'),
      true,
      uploadOptions,
    )
    page = await global.__BROWSER__.newPage()
    await page.goto(`${BEE_API_URL}/bzz/${rootFolderReference}`)

    done()
  })

  it('do smth', () => {
    expect(1).toBe(1)
  })
})
