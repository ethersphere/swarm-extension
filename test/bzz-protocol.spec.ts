/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Bee } from '@ethersphere/bee-js'
import { join } from 'path'
import { ElementHandle, Page } from 'puppeteer'
import {
  BEE_API_URL,
  bzzReferenceByGoogle,
  getElementBySelector,
  getExtensionId,
  getStamp,
  replaceInputValue,
} from './utils'

async function getLastBzzPage(): Promise<Page> {
  await new Promise(resolve => setTimeout(() => resolve(true), 500))
  const pages = await global.__BROWSER__.pages()

  return pages[pages.length - 1]
}

function newBzzpage(url: string): Promise<Page> {
  return new Promise(async (resolve, reject) => {
    const page = await global.__BROWSER__.newPage()
    page.once('requestfailed', async request => {
      const errorText = request.failure()?.errorText

      if (errorText === 'net::ERR_ABORTED') resolve(await getLastBzzPage())
      else reject(errorText)
    })

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded' })
    } catch {
      //
    }
  })
}

/**
 * Change Bee API URL on the extension page
 * @returns Previous Bee API URL
 * */
async function changeBeeApiUrl(extensionPage: Page, newBeeApiUrl: string): Promise<string> {
  const formId = 'form-bee-api-url-change'
  const inputSelector = `form[id="${formId}"] input[type="text"]`
  const inputText = await getElementBySelector(inputSelector, extensionPage)
  const submitSelector = `form[id="${formId}"] input[type="submit"]`
  const submitButton = await getElementBySelector(submitSelector, extensionPage)
  const originalUrlValue = await (await inputText.getProperty('value')).jsonValue()
  await extensionPage.focus(inputSelector)
  await replaceInputValue(newBeeApiUrl, extensionPage)
  await submitButton.click()

  if (typeof originalUrlValue !== 'string') throw new Error('changeBeeApiUrl: there is no valid original URL')

  return originalUrlValue
}

describe('BZZ protocol', () => {
  let page: Page
  let extensionPage: Page
  let bee: Bee
  let rootFolderReference: string
  let extensionId: string
  let localStorageReferece: string

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
      pin: true,
    }
    const uploadFilesFromDirectory = (...relativePath: string[]): Promise<string> => {
      return bee.uploadFilesFromDirectory(getStamp(), join(__dirname, ...relativePath), uploadOptions)
    }
    const jinnHash = await uploadFilesFromDirectory('bzz-test-page', 'jinn-page')
    const jafarHash = await uploadFilesFromDirectory('bzz-test-page', 'jafar-page')
    console.log('Jinn and Jafar page has been uploaded', jinnHash, jafarHash)
    localStorageReferece = await uploadFilesFromDirectory('bzz-test-page', 'local-storage')
    console.log('Local Storage handler page has been uploaded', localStorageReferece)
    rootFolderReference = await uploadFilesFromDirectory('bzz-test-page')
    page = await global.__BROWSER__.newPage()
    await page.goto(`${BEE_API_URL}/bzz/${rootFolderReference}`, { waitUntil: 'networkidle0' })

    extensionId = await getExtensionId()

    done()
  })

  test('checks inner iframe reference load', async done => {
    const ref = await page.$('#localhost-inner-ref')

    checkJinnIframePage(ref)
    done()
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

  test('Allow Global Postage Stamp ID', async done => {
    const extensionPage = await global.__BROWSER__.newPage()
    await extensionPage.goto(`chrome-extension://${extensionId}/popup-page/index.html`, {
      waitUntil: 'networkidle0',
    })

    const checkboxSelector = '#global-postage-stamp-enabled'
    const checkbox = await getElementBySelector(checkboxSelector, extensionPage)
    await checkbox.click()
    const firstPostageBatchSelector = '#postage-batch-list tbody tr:nth-child(1) td:nth-child(3) a'
    const firstPostageBatchSelectButton = await getElementBySelector(firstPostageBatchSelector, extensionPage)
    await firstPostageBatchSelectButton.click()
    const globalPostageBatchIdSelector = '#global-postage-batch-id'
    const globalPostageBatchId = await extensionPage.$eval(globalPostageBatchIdSelector, e => e.innerHTML)

    expect(globalPostageBatchId).toHaveLength(64) // valid postage batch ID

    await extensionPage.close()

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
    const currentPage = await getLastBzzPage()
    const jinnPage = await currentPage.$('#jinn-page-title')

    expect(jinnPage).toBeTruthy()
    await currentPage.close()
  })

  test('reference content with bzz://{content-id} with default search engine Google', async () => {
    const currentPage = await newBzzpage(bzzReferenceByGoogle(rootFolderReference))
    const title = await currentPage.title()
    const bzzPageTitleElement = await currentPage.$('#first-bzz-page-title')

    expect(title).toBe('First Direct BZZ address')
    expect(bzzPageTitleElement).toBeTruthy()
  })

  test('Change Bee API URL', async done => {
    extensionPage = await global.__BROWSER__.newPage()
    await extensionPage.goto(`chrome-extension://${extensionId}/popup-page/index.html`, {
      waitUntil: 'networkidle0',
    })

    // change api url to http://localhost:9999
    const testUrlValue = 'http://localhost:9999'
    const originalUrlValue = await changeBeeApiUrl(extensionPage, testUrlValue)
    //test whether it had affect on routing
    const bzzPage = await newBzzpage(bzzReferenceByGoogle('nevermind-value'))
    // the expected error page URL is 'chrome-error://chromewebdata/' on wrong reference.
    expect(bzzPage.url()).toBe('chrome-error://chromewebdata/')
    await bzzPage.close()
    //set back the original value
    await changeBeeApiUrl(extensionPage, originalUrlValue)

    done()
  })

  test('Check traditional and swarm localStorage usage', async done => {
    // swarm-test-worker-1
    const newUrlValue = 'http://localhost:11633'
    const originalUrlValue = await changeBeeApiUrl(extensionPage, newUrlValue)

    // save sample data
    const commonKeyName = 'Alan Watts'
    const swarmKeyValue =
      'The only way to make sense out of change is to plunge into it, move with it, and join the dance.'
    const localStoragePage = await newBzzpage(bzzReferenceByGoogle(localStorageReferece))
    // set common storage key for localstorages
    const saveKeyNameSelector = '#save-localstorage-key-name'
    await localStoragePage.focus(saveKeyNameSelector)
    await replaceInputValue(commonKeyName, localStoragePage)
    const saveKeyValueSelector = '#save-localstorage-key-value'
    // set swarm local storage key value and then save it
    await localStoragePage.focus(saveKeyValueSelector)
    await replaceInputValue(swarmKeyValue, localStoragePage)
    const saveSwarmSelector = '#button-save-swarm-localstorage'
    const saveSwarm = await getElementBySelector(saveSwarmSelector, localStoragePage)
    await saveSwarm.click()

    // load saved localstorage elements
    const loadKeyNameSelector = '#load-localstorage-key-name'
    const loadKeyValueSelector = '#load-localstorage-key-value'
    const getKeyValue = (page: Page): Promise<string> => {
      return page.$eval(loadKeyValueSelector, element => {
        return element.innerHTML
      })
    }
    const loadAndCheckStorages = async (page: Page, swarmKeyValue: string) => {
      // set common key for retriaval
      await page.focus(loadKeyNameSelector)
      await replaceInputValue(commonKeyName, page)
      // load swarm storage and then check
      const loadSwarmSelector = '#button-load-swarm-localstorage'
      const loadSwarm = await getElementBySelector(loadSwarmSelector, page)
      await loadSwarm.click()
      await new Promise(resolve => setTimeout(resolve, 100)) // wait for async function run on the page
      expect(await getKeyValue(page)).toBe(swarmKeyValue)
    }
    // change back the host to the original and try to fetch again
    await localStoragePage.close()
    await changeBeeApiUrl(extensionPage, originalUrlValue)
    const localStoragePage2 = await newBzzpage(bzzReferenceByGoogle(localStorageReferece))
    // check whether the swarm storage is still retreivable on the new page
    await loadAndCheckStorages(localStoragePage2, swarmKeyValue)

    done()
  })

  test('checks window object and content document is not available of iframe because of cross-origin', async done => {
    // check whether the localstorage is accessible from an iframe in a different dApp
    const bzzPage = await newBzzpage(bzzReferenceByGoogle(rootFolderReference))
    const iframeWindowIsNotReachable = await bzzPage.evaluate(() => {
      const iframe = document.getElementById('localstorage-iframe')

      if (!iframe) {
        throw new Error('there is no "localstorage-iframe" element')
      }
      const iframeWindow = (iframe as HTMLIFrameElement).contentWindow

      if (!iframeWindow) {
        throw new Error('there is no window object under "localstorage-iframe" element')
      }

      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const swarm = iframeWindow.window.swarm
      } catch (e) {
        if (
          e.stack &&
          typeof e.stack === 'string' &&
          e.stack.startsWith(`Error: Blocked a frame with origin "null" from accessing a cross-origin frame.`)
        ) {
          return true
        }
      }

      return false
    })
    expect(iframeWindowIsNotReachable).toBeTruthy()

    const iframeContentIsNotReachable = await bzzPage.evaluate(() => {
      const iframe = document.getElementById('localstorage-iframe')

      if (!iframe) {
        throw new Error('there is no "localstorage-iframe" element')
      }
      const iframeContent = (iframe as HTMLIFrameElement).contentDocument

      return iframeContent === null
    })

    expect(iframeContentIsNotReachable).toBeTruthy()

    await bzzPage.close()

    done()
  })
})
