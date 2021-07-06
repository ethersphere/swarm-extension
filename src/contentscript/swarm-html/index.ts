import { fakeUrl } from '../../utils/fake-url'
import { appendSwarmSessionIdToUrl } from '../../utils/swarm-session-id'

export class SwarmImage extends HTMLImageElement {
  static get observedAttributes(): string[] {
    return ['src']
  }

  constructor() {
    super()
    console.log(`swarm-html: loaded. src ${this.src}`)

    this.addEventListener('load', () => {
      if (!this.src.startsWith(fakeUrl.bzzProtocol)) {
        console.error(
          `Swarm element with ID "${this.id}" does not have valid bzz reference in the "src" attribute. Got ${this.src}`,
        )
      }
    })
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    if (newValue.startsWith('bzz://')) {
      const bzzReference = newValue.substr('bzz://'.length)
      const fakeUrlRef = `${fakeUrl.bzzProtocol}/${bzzReference}`
      this.src = appendSwarmSessionIdToUrl(fakeUrlRef)
    }
  }
}

export class SwarmFrame extends HTMLIFrameElement {
  static get observedAttributes(): string[] {
    return ['src']
  }

  constructor() {
    super()
    console.log(`swarm-html: loaded. src ${this.src}`)

    this.addEventListener('load', () => {
      if (!this.src.startsWith(fakeUrl.bzzProtocol)) {
        console.error(
          `Swarm element with ID "${this.id}" does not have valid bzz reference in the "src" attribute. Got ${this.src}`,
        )
      }
    })
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    if (newValue.startsWith('bzz://')) {
      const bzzReference = newValue.substr('bzz://'.length)
      const fakeUrlRef = `${fakeUrl.bzzProtocol}/${bzzReference}`
      this.src = appendSwarmSessionIdToUrl(fakeUrlRef)
    }
  }
}

export class SwarmAnchor extends HTMLAnchorElement {
  static get observedAttributes(): string[] {
    return ['href']
  }

  constructor() {
    super()
    console.log(`swarm-html: loaded. href ${this.href}`)

    this.addEventListener('load', () => {
      if (!this.href.startsWith(fakeUrl.openDapp)) {
        console.error(
          `Swarm element with ID "${this.id}" does not have valid bzz reference in the "href" attribute. Got ${this.href}`,
        )
      }
    })
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    if (newValue.startsWith('bzz://')) {
      const bzzReference = newValue.substr('bzz://'.length)
      const fakeUrlRef = `${fakeUrl.openDapp}/${bzzReference}`
      this.href = fakeUrlRef
    }
  }
}

window.customElements.define('swarm-image', SwarmImage, { extends: 'img' })
window.customElements.define('swarm-frame', SwarmFrame, { extends: 'iframe' })
window.customElements.define('swarm-a', SwarmAnchor, { extends: 'a' })
