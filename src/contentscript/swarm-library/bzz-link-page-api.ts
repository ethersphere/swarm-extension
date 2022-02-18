import { bzzProtocolToFakeUrl as bzzProtocolToFakeUrlFn, bzzLinkUrlToFakeUrl as bzzLinkUrlToFakeUrlFn, urlToFakeUrl as urlToFakeUrlFn } from './bzz-link'

/** gives back the fake URL of the BZZ protocol reference or null if the first parameter is not a valid BZZ protocol reference */
export function bzzProtocolToFakeUrl(url: string, newPage = false): string | null {
  return bzzProtocolToFakeUrlFn(url, window.swarm.sessionId, newPage)
}

/** gives back the fake URL of the bzz.link or null if the first parameter is not a valid bzz.link reference */
export function bzzLinkUrlToFakeUrl(bzzLinkUrl: string, newPage = false): string | null {
  return bzzLinkUrlToFakeUrlFn(bzzLinkUrl, window.swarm.sessionId, newPage)
}

/** transform the given URL to FakeURL or return null if it is not possible */
export function urlToFakeUrl(url: string, newPage = false): string | null {
  return urlToFakeUrlFn(url, window.swarm.sessionId, newPage)
}
export * from '../../utils/bzz-link'

