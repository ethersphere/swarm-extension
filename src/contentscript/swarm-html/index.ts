import { fakeUrl } from '../../utils/fake-url'

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
      this.src = `${fakeUrl.bzzProtocol}/${bzzReference}`
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
      this.src = `${fakeUrl.bzzProtocol}/${bzzReference}`
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
      if (!this.href.startsWith(fakeUrl.bzzProtocol)) {
        console.error(
          `Swarm element with ID "${this.id}" does not have valid bzz reference in the "href" attribute. Got ${this.href}`,
        )
      }
    })
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    if (newValue.startsWith('bzz://')) {
      const bzzReference = newValue.substr('bzz://'.length)
      this.href = `${fakeUrl.bzzProtocol}/${bzzReference}`
    }
  }
}

window.customElements.define('swarm-image', SwarmImage, { extends: 'img' })
window.customElements.define('swarm-frame', SwarmFrame, { extends: 'iframe' })
window.customElements.define('swarm-a', SwarmAnchor, { extends: 'a' })
