import { getSubdomain, subdomainToBzzResource } from '../utils/bzz-link'
import { fakeUrl } from '../utils/fake-url'
import { appendSwarmSessionIdToUrl } from '../utils/swarm-session-id'

export class BzzLink {
  /** gives back the fake URL of the BZZ protocol reference or null if the first parameter is not a valid BZZ protocol reference */
  public bzzProtocolToFakeUrl(url: string, sessionId: string, newPage = false): string | null {
    if (!url.startsWith('bzz://')) return null

    const bzzReference = url.substring('bzz://'.length)
    const fakeUrlRef = newPage
      ? `${fakeUrl.openDapp}/${bzzReference}` // does not need sessionId because it force redirects
      : appendSwarmSessionIdToUrl(`${fakeUrl.bzzProtocol}/${bzzReference}`, sessionId)

    return fakeUrlRef
  }

  /** gives back the fake URL of the bzz.link or null if the first parameter is not a valid bzz.link reference */
  public bzzLinkUrlToFakeUrl(bzzLinkUrl: string, sessionId: string, newPage = false): string | null {
    const subdomain = getSubdomain(bzzLinkUrl)

    if (subdomain) {
      let bzzReference = subdomainToBzzResource(subdomain)
      const firstSlash = bzzLinkUrl.indexOf('/', 59) // 59th index is surely after the 'http(s)://' but before any path reference

      // append subpath with arbitrary query params of original url
      if (firstSlash !== -1) {
        bzzReference += bzzLinkUrl.slice(firstSlash)
      }

      const fakeUrlRef = newPage ? `${fakeUrl.openDapp}/${bzzReference}` : `${fakeUrl.bzzProtocol}/${bzzReference}`

      return appendSwarmSessionIdToUrl(fakeUrlRef, sessionId)
    }

    return null
  }

  /** transform the given URL to FakeURL or return null if it is not possible */
  public urlToFakeUrl(url: string, sessionId: string, newPage = false): string | null {
    return (
      this.bzzLinkUrlToFakeUrl(url, sessionId, newPage) || this.bzzProtocolToFakeUrl(url, sessionId, newPage) || null
    )
  }
}
