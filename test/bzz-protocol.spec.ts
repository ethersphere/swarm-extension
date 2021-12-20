/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Bee } from '@ethersphere/bee-js'
import { join } from 'path'
import { ElementHandle, Page } from 'puppeteer'
import { bzzResourceToSubdomain } from '../src/utils/bzz-link'
import {
  BEE_API_URL,
  BEE_DEBUG_API_URL,
  BEE_PEER_API_URL,
  bzzReferenceByGoogle,
  getElementBySelector,
  getExtensionId,
  getStamp,
  replaceInputValue,
} from './utils'

async function getLastBzzPage(): Promise<Page> {
  await new Promise(resolve => setTimeout(() => resolve(true), 1000)) // puppeteer needs time to refresh its page set.
  const pages = await global.__BROWSER__.pages()

  return pages[pages.length - 1]
}

function newBzzPage(url: string): Promise<Page> {
  return new Promise(async (resolve, reject) => {
    const page = await global.__BROWSER__.newPage()
    page.once('requestfailed', async request => {
      const errorText = request.failure()?.errorText

      if (errorText === 'net::ERR_ABORTED') {
        resolve(await getLastBzzPage())
      } else reject(errorText)
    })

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded' })
    } catch {
      //
    }
  })
}

async function openExtensionPage(): Promise<Page> {
  const extensionId = await getExtensionId()
  const extensionPage = await global.__BROWSER__.newPage()
  await extensionPage.goto(`chrome-extension://${extensionId}/popup-page/index.html`, {
    waitUntil: 'networkidle0',
  })

  return extensionPage
}

/**
 * Change Bee API URL on the extension page
 * @returns Previous Bee API URL
 * */
async function changeBeeApiUrl(newBeeApiUrl: string, extensionPage?: Page): Promise<string> {
  let closeExtensionPage = false

  if (!extensionPage) {
    closeExtensionPage = true
    extensionPage = await openExtensionPage()
  }
  const inputSelector = `#bee-api-url-input input[type="text"]`
  const inputText = await getElementBySelector(inputSelector, extensionPage)
  const submitSelector = `#api-button-save`
  const submitButton = await getElementBySelector(submitSelector, extensionPage)
  const originalUrlValue = await (await inputText.getProperty('value')).jsonValue()
  await extensionPage.focus(inputSelector)
  await replaceInputValue(newBeeApiUrl, extensionPage)
  await submitButton.click()

  if (typeof originalUrlValue !== 'string') throw new Error('changeBeeApiUrl: there is no valid original URL')

  if (closeExtensionPage) await extensionPage.close()

  return originalUrlValue
}

/**
 * Change Bee Debug API URL on the extension page
 * @returns Previous Bee Debug API URL
 * */
async function changeBeeDebugApiUrl(newBeeDebugApiUrl: string, extensionPage?: Page): Promise<string> {
  let closeExtensionPage = false

  if (!extensionPage) {
    closeExtensionPage = true
    extensionPage = await openExtensionPage()
  }
  const inputSelector = `#bee-debug-api-url-input input[type="text"]`
  const inputText = await getElementBySelector(inputSelector, extensionPage)
  const submitSelector = `#api-button-save`
  const submitButton = await getElementBySelector(submitSelector, extensionPage)
  const originalUrlValue = await (await inputText.getProperty('value')).jsonValue()
  await extensionPage.focus(inputSelector)
  await replaceInputValue(newBeeDebugApiUrl, extensionPage)
  await submitButton.click()

  if (typeof originalUrlValue !== 'string') throw new Error('changeBeeApiUrl: there is no valid original URL')

  if (closeExtensionPage) await extensionPage.close()

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
    // setup Bee API URL in the extension
    extensionId = await getExtensionId()
    const extensionPage = await openExtensionPage()
    await changeBeeApiUrl(BEE_API_URL, extensionPage)
    await changeBeeDebugApiUrl(BEE_DEBUG_API_URL, extensionPage)
    await extensionPage.close()

    // upload sample pages
    bee = new Bee(BEE_API_URL)
    const uploadOptions = {
      indexDocument: 'index.html',
      pin: true,
    }
    const uploadFilesFromDirectory = async (...relativePath: string[]): Promise<string> => {
      const { reference } = await bee.uploadFilesFromDirectory(
        getStamp(),
        join(__dirname, ...relativePath),
        uploadOptions,
      )

      return reference
    }
    const jinnHash = await uploadFilesFromDirectory('bzz-test-page', 'jinn-page')
    const jafarHash = await uploadFilesFromDirectory('bzz-test-page', 'jafar-page')
    console.log('Jinn and Jafar page has been uploaded', jinnHash, jafarHash)
    localStorageReferece = await uploadFilesFromDirectory('bzz-test-page', 'local-storage')
    console.log('Local Storage handler page has been uploaded', localStorageReferece)
    rootFolderReference = await uploadFilesFromDirectory('bzz-test-page')
    page = await global.__BROWSER__.newPage()
    await page.goto(`${BEE_API_URL}/bzz/${rootFolderReference}`, { waitUntil: 'networkidle0' })

    done()
  })

  beforeEach(async done => {
    await new Promise(resolve => setTimeout(resolve, 1000))
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
    expect(value).toBe(BEE_API_URL) //default value of Bee API URL in the extension

    done()
  })

  test('Allow Global Postage Stamp ID', async done => {
    const extensionPage = await openExtensionPage()
    const stamp = getStamp()

    const checkboxSelector = '#postage-stamps-toggle input[type=checkbox]'
    const checkbox = await getElementBySelector(checkboxSelector, extensionPage)
    await checkbox.click()
    const postageBatchSelector = '#postage-stamps-select'
    const postageBatchSelect = await getElementBySelector(postageBatchSelector, extensionPage)
    await postageBatchSelect.select(stamp)
    const globalPostageBatchIdSelector = '#postage-stamp-batch-id'
    const globalPostageBatchId = await extensionPage.$eval(globalPostageBatchIdSelector, e => e.innerHTML)

    expect(globalPostageBatchId).toEqual(stamp)

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

  test('check {cid}.bzz.link image resource loaded', async () => {
    const imageLoaded = await page.evaluate(() => {
      return (document.getElementById('bzz-image-2') as HTMLImageElement).complete
    })

    expect(imageLoaded).toBe(true)
  })

  test('click on web+bzz link reference', async () => {
    // perform navigation
    await page.click('#bzz-ext-ref')
    const currentPage = await getLastBzzPage()
    const jinnPage = await currentPage.$('#jinn-page-title')

    expect(jinnPage).toBeTruthy()
    await currentPage.close()
  })

  test('type in bzz://{content-id} address into the address bar with default search engine Google', async () => {
    const currentPage = await newBzzPage(bzzReferenceByGoogle(rootFolderReference))
    const title = await currentPage.title()
    const bzzPageTitleElement = await currentPage.$('#first-bzz-page-title')

    expect(title).toBe('First Direct BZZ address')
    expect(bzzPageTitleElement).toBeTruthy()
  })

  test('type in https://{cid}.bzz.link address into the address bar', async () => {
    const cid = bzzResourceToSubdomain(rootFolderReference)
    expect(cid).not.toBeNull()
    const currentPage = await newBzzPage(`https://${cid}.bzz.link`)
    const title = await currentPage.title()
    const bzzPageTitleElement = await currentPage.$('#first-bzz-page-title')

    expect(title).toBe('First Direct BZZ address')
    expect(bzzPageTitleElement).toBeTruthy()
    await currentPage.close()
  })

  test('Change Bee API URL', async done => {
    extensionPage = await openExtensionPage()

    // change api url to http://localhost:9999
    const testUrlValue = 'http://localhost:9999'
    const originalUrlValue = await changeBeeApiUrl(testUrlValue, extensionPage)
    //test whether it had affect on routing
    const bzzPage = await newBzzPage(bzzReferenceByGoogle('nevermind-value'))
    // the expected error page URL is 'chrome-error://chromewebdata/' on wrong reference.
    expect(bzzPage.url()).toBe('chrome-error://chromewebdata/')
    await bzzPage.close()
    //set back the original value
    await changeBeeApiUrl(originalUrlValue, extensionPage)

    done()
  })

  test('Check traditional and swarm localStorage usage', async done => {
    // swarm-test-worker-1
    const originalUrlValue = await changeBeeApiUrl(BEE_PEER_API_URL, extensionPage)

    // save sample data
    const commonKeyName = 'Alan Watts'
    const swarmKeyValue =
      'The only way to make sense out of change is to plunge into it, move with it, and join the dance.'
    const localStoragePage = await newBzzPage(bzzReferenceByGoogle(localStorageReferece))
    expect(await localStoragePage.title()).toBe('Local Storage handling')
    // set common storage key for localstorages
    const saveKeyNameSelector = '#save-localstorage-key-name'
    await localStoragePage.waitForSelector(saveKeyNameSelector)
    await localStoragePage.focus(saveKeyNameSelector)
    await replaceInputValue(commonKeyName, localStoragePage)
    const saveKeyValueSelector = '#save-localstorage-key-value'
    // set swarm local storage key value and then save it
    await localStoragePage.waitForSelector(saveKeyValueSelector)
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
      await page.waitForSelector(loadKeyNameSelector)
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
    await changeBeeApiUrl(originalUrlValue, extensionPage)
    const localStoragePage2 = await newBzzPage(bzzReferenceByGoogle(localStorageReferece))
    // check whether the swarm storage is still retreivable on the new page
    await loadAndCheckStorages(localStoragePage2, swarmKeyValue)

    done()
  })

  test('checks window object and content document is not available of iframe because of cross-origin', async done => {
    // check whether the localstorage is accessible from an iframe in a different dApp
    const bzzPage = await newBzzPage(bzzReferenceByGoogle(rootFolderReference))
    expect(await bzzPage.title()).toBe('First Direct BZZ address')
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
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
