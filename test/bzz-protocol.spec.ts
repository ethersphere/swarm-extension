/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { join } from 'path'
import { ElementHandle, Page } from 'puppeteer'
import { BEE_API_URL } from './utils'
import { Bee } from '@ethersphere/bee-js'

describe('BZZ protocol', () => {
  let page: Page
  let bee: Bee
  let rootFolderReference: string
  const checkJinnIframePage = async (element: ElementHandle<Element> | null) => {
    expect(element).toBeTruthy()

    const jinnPage = await element!.contentFrame()

    expect(jinnPage).toBeTruthy()

    const jinnPageTitle = await jinnPage!.$('#jinn-page-title')

    expect(jinnPageTitle).toBeTruthy()
  }

  beforeAll(async done => {
    bee = new Bee(BEE_API_URL)
    const uploadOptions = {
      indexDocument: 'index.html',
    }
    await bee.uploadFilesFromDirectory(join(__dirname, 'bzz-test-page', 'jinn-page'), true, uploadOptions)
    await bee.uploadFilesFromDirectory(join(__dirname, 'bzz-test-page', 'jafar-page'), true, uploadOptions)
    rootFolderReference = await bee.uploadFilesFromDirectory(join(__dirname, 'bzz-test-page'), true, uploadOptions)
    page = await global.__BROWSER__.newPage()
    await page.goto(`${BEE_API_URL}/bzz/${rootFolderReference}`, { waitUntil: 'networkidle0' })

    done()
  })

  test('checks inner iframe reference load', async () => {
    const ref = await page.$('#localhost-inner-ref')

    checkJinnIframePage(ref)
  })

  test('checks iframe has been loaded with web+bzz reference', async () => {
    const ref = await page.$('#bzz-iframe')

    checkJinnIframePage(ref)
  })

  test('click on web+bzz link reference', async () => {
    // perform navigation
    await page.click('#bzz-ext-ref')

    const jinnPage = await page.$('#jinn-page-title')

    expect(jinnPage).toBeTruthy()

    await page.close()
  })

  test('reference content with bzz://{content-id} with default search engine Google', async () => {
    const bzzPage = await global.__BROWSER__.newPage()
    await bzzPage.goto(
      `https://www.google.com/search?&q=bzz%3A%2F%2F${rootFolderReference}&oq=bzz%3A%2F%2F${rootFolderReference}`,
      { waitUntil: 'networkidle0' },
    )

    const bzzPageTitle = await bzzPage.$('#first-bzz-page-title')

    expect(bzzPageTitle).toBeTruthy()
  })
})
