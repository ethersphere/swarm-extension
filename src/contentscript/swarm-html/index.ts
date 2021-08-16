import { fakeUrl } from '../../utils/fake-url'

/** tries to transform the given URL to fake URL or return back the original URL  */
function tryFakeUrlTransform(url: string, newPage = false): string | null {
  return window.swarm.bzzLink.urlToFakeUrl(url, newPage)
}

export class SwarmImage extends HTMLImageElement {
  static get observedAttributes(): string[] {
    return ['src']
  }

  constructor() {
    super()

    this.addEventListener('load', () => {
      if (!this.src.startsWith(fakeUrl.bzzProtocol)) {
        console.error(
          `Swarm element with ID "${this.id}" does not have valid bzz reference in the "src" attribute. Got ${this.src}`,
        )
      }
    })
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    const fakeUrl = tryFakeUrlTransform(newValue)

    if (fakeUrl) this.src = fakeUrl
  }
}

export class SwarmFrame extends HTMLIFrameElement {
  static get observedAttributes(): string[] {
    return ['src']
  }

  constructor() {
    super()

    this.addEventListener('load', () => {
      if (!this.src.startsWith(fakeUrl.bzzProtocol)) {
        console.error(
          `Swarm element with ID "${this.id}" does not have valid bzz reference in the "src" attribute. Got ${this.src}`,
        )
      }
    })
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    const fakeUrl = tryFakeUrlTransform(newValue)

    if (fakeUrl) this.src = fakeUrl
  }
}

export class SwarmAnchor extends HTMLAnchorElement {
  static get observedAttributes(): string[] {
    return ['href']
  }

  constructor() {
    super()

    this.addEventListener('load', () => {
      if (!this.href.startsWith(fakeUrl.openDapp)) {
        console.error(
          `Swarm element with ID "${this.id}" does not have valid bzz reference in the "href" attribute. Got ${this.href}`,
        )
      }
    })
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    const fakeUrl = tryFakeUrlTransform(newValue, true)

    if (fakeUrl) this.href = fakeUrl
  }
}

window.customElements.define('swarm-image', SwarmImage, { extends: 'img' })
window.customElements.define('swarm-frame', SwarmFrame, { extends: 'iframe' })
window.customElements.define('swarm-a', SwarmAnchor, { extends: 'a' })
