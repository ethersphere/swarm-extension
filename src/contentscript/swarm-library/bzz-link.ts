import { getSubdomain, subdomainToBzzResource } from '../../utils/bzz-link'
import { fakeUrl } from '../../utils/fake-url'
import { appendSwarmSessionIdToUrl } from '../../utils/swarm-session-id'

/** gives back the fake URL of the BZZ protocol reference or null if the first parameter is not a valid BZZ protocol reference */
export function bzzProtocolToFakeUrl(url: string, newPage = false): string | null {
  if (!url.startsWith('bzz://')) return null

  const bzzReference = url.substr('bzz://'.length)
  const fakeUrlRef = newPage
    ? `${fakeUrl.openDapp}/${bzzReference}` // does not need sessionId because it force redirects
    : appendSwarmSessionIdToUrl(`${fakeUrl.bzzProtocol}/${bzzReference}`)

  return fakeUrlRef
}

/** gives back the fake URL of the bzz.link or null if the first parameter is not a valid bzz.link reference */
export function bzzLinkUrlToFakeUrl(bzzLinkUrl: string, newPage = false): string | null {
  const subdomain = getSubdomain(bzzLinkUrl)

  if (subdomain) {
    let bzzReference = subdomainToBzzResource(subdomain)
    const firstSlash = bzzLinkUrl.indexOf('/', 59) // 59th index is surely after the 'http(s)://' but before any path reference

    // append subpath with arbitrary query params of original url
    if (firstSlash !== -1) {
      bzzReference += bzzLinkUrl.slice(firstSlash)
    }

    const fakeUrlRef = newPage ? `${fakeUrl.openDapp}/${bzzReference}` : `${fakeUrl.bzzProtocol}/${bzzReference}`

    return appendSwarmSessionIdToUrl(fakeUrlRef)
  }

  return null
}

/** transform the given URL to FakeURL or return null if it is not possible */
export function urlToFakeUrl(url: string, newPage = false): string | null {
  return bzzLinkUrlToFakeUrl(url, newPage) || bzzProtocolToFakeUrl(url, newPage) || null
}

export * from '../../utils/bzz-link'
