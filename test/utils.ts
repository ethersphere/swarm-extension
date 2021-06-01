/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { ElementHandle, Page } from 'puppeteer'
import { Bee } from '@ethersphere/bee-js'

/**
 * Returns a url for testing the Bee API
 */
export const BEE_API_URL = process.env.BEE_API_URL || 'http://localhost:1633'

let extensionId: string

export async function getExtensionId(): Promise<string> {
  if (extensionId) return extensionId

  const page = await global.__BROWSER__.newPage()
  await page.goto('chrome://extensions', { waitUntil: 'networkidle0' })

  await page.waitForSelector('extensions-manager')

  extensionId = await page.evaluate(() => {
    const extensionsManager = document.querySelector('extensions-manager')
    const extensionsItemList = extensionsManager!.shadowRoot!.querySelector('extensions-item-list')
    const extensionsItem = extensionsItemList!.shadowRoot!.querySelectorAll('extensions-item')
    const exteinsionItems = Array.from(extensionsItem.entries())
    const extension = exteinsionItems[0][1]

    return extension.id
  })
  page.close()

  return extensionId
}

export async function replaceInputValue(newValue: string, page: Page): Promise<void> {
  await page.keyboard.down('Shift')
  await page.keyboard.press('Home')
  await page.keyboard.press('Backspace')
  await page.keyboard.up('Shift')
  await page.keyboard.type(newValue)
}

export async function getElementBySelector(selector: string, page: Page): Promise<ElementHandle<Element>> {
  await page.waitForSelector(selector)
  const element = await page.$(selector)

  if (!element) throw new Error(`Element with selector ${selector} has been not found`)

  return element
}

export function bzzReferenceByGoogle(contentReference: string): string {
  return `https://www.google.com/search?&q=bzz%3A%2F%2F${contentReference}&oq=bzz%3A%2F%2F${contentReference}`
}

export function buyStamp(): Promise<string> {
  console.log(`Buying stamp on the Bee node ${BEE_API_URL}...`)
  const bee = new Bee(BEE_API_URL)

  return bee.createPostageBatch(BigInt('1'), 20)
}

export function getStamp(): string {
  if (!process.env.BEE_STAMP) {
    throw Error('There is no postage stamp under "BEE_STAMP" environment varaible.')
  }

  return process.env.BEE_STAMP
}
