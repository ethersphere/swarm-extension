import { fakeUrl } from './utils/fake-url'
import { BzzLink } from './services/bzz-link'

const bzzLink = new BzzLink()

/** tries to transform the given URL to fake URL or return back the original URL  */
function tryFakeUrlTransform(url: string, newPage = false): string | null {
  return bzzLink.urlToFakeUrl(url, '', newPage)
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

export class SwarmVideo extends HTMLVideoElement {
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

export class SwarmSource extends HTMLSourceElement {
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

if (window.customElements.get('swarm-img') === undefined) {
  window.customElements.define('swarm-img', SwarmImage, { extends: 'img' })
}

if (window.customElements.get('swarm-iframe') === undefined) {
  window.customElements.define('swarm-iframe', SwarmFrame, { extends: 'iframe' })
}

if (window.customElements.get('swarm-a') === undefined) {
  window.customElements.define('swarm-a', SwarmAnchor, { extends: 'a' })
}

if (window.customElements.get('swarm-video') === undefined) {
  window.customElements.define('swarm-video', SwarmVideo, { extends: 'video' })
}

if (window.customElements.get('swarm-source') === undefined) {
  window.customElements.define('swarm-source', SwarmSource, { extends: 'source' })
}
