/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { join } from 'path'
import { ElementHandle, Page } from 'puppeteer'
import { BEE_API_URL, bzzReferenceByGoogle, getElementBySelector, getExtensionId, replaceInputValue } from './utils'
import { Bee } from '@ethersphere/bee-js'

describe('BZZ protocol', () => {
  let page: Page
  let bee: Bee
  let rootFolderReference: string
  let extensionId: string

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

    extensionId = await getExtensionId()

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

  test('Fetch Real Bee API URL', async done => {
    await page.click('#button-fetch-real-bee-api-url')
    const placeHolderSelector = '#bee-api-url-placeholder'
    await page.waitForSelector(placeHolderSelector)
    const value = await page.$eval(placeHolderSelector, e => e.innerHTML)
    expect(value).toBe('http://localhost:1633') //default value of Bee API URL in the extension

    done()
  })

  test('Upload file through Fake URL', async done => {
    await page.click('#button-upload-fake-url-file')
    const placeHolderSelector = '#fake-bzz-url-content-1 > a:first-child'
    await page.waitForSelector(placeHolderSelector)
    await page.click(placeHolderSelector)
    const bzzPageTitle = await page.$('h1')
    expect(bzzPageTitle).toBeTruthy()
    await page.goBack()

    done()
  })

  test('Fetch image via Fake URL', async done => {
    await page.click('#button-fetch-jinn-page')
    const placeHolderSelector = '#fake-url-fetch-jinn > img:first-child'
    await page.waitForSelector(placeHolderSelector)
    const completedImageLoad = await page.evaluate(async placeHolderSelector => {
      const image = document.querySelector(placeHolderSelector)

      return await new Promise(resolve => {
        image.addEventListener('load', resolve(true))
        image.addEventListener('error', resolve(false))
      })
    }, placeHolderSelector)
    expect(completedImageLoad).toBeTruthy()

    done()
  })

  test('click on web+bzz link reference', async () => {
    // perform navigation
    await page.click('#bzz-ext-ref')

    const jinnPage = await page.$('#jinn-page-title')

    expect(jinnPage).toBeTruthy()

    await page.close()
  })

  test('reference content with bzz://{content-id} with default search engine Google', async () => {
    const page = await global.__BROWSER__.newPage()
    await page.goto(bzzReferenceByGoogle(rootFolderReference), { waitUntil: 'networkidle0' })

    const bzzPageTitle = await page.$('#first-bzz-page-title')

    expect(bzzPageTitle).toBeTruthy()
  })

  test('Change Bee API URL', async done => {
    const extensionPage = await global.__BROWSER__.newPage()
    await extensionPage.goto(`chrome-extension://${extensionId}/popup-page/index.html`, {
      waitUntil: 'networkidle0',
    })

    // change api url to http://localhost:9999
    const testUrlValue = 'http://localhost:9999'
    const formId = 'form-bee-api-url-change'
    const inputSelector = `form[id="${formId}"] input[type="text"]`
    const inputText = await getElementBySelector(inputSelector, extensionPage)
    const submitSelector = `form[id="${formId}"] input[type="submit"]`
    const submitButton = await getElementBySelector(submitSelector, extensionPage)
    const originalUrlValue = await (await inputText.getProperty('value')).jsonValue()
    const changeUrl = async (changeValue: string) => {
      await extensionPage.focus(inputSelector)
      await replaceInputValue(changeValue, extensionPage)
      await submitButton.click()
    }
    await changeUrl(testUrlValue)
    //test whether it had affect on routing
    const bzzPage = await global.__BROWSER__.newPage()
    const errorRegExp = /^net::ERR_CONNECTION_REFUSED/
    await expect(bzzPage.goto(bzzReferenceByGoogle('nevermind-value'))).rejects.toThrowError(errorRegExp)
    await bzzPage.close()
    //set back the original value
    await changeUrl(originalUrlValue as string)

    done()
  })
})
