/**
 * Swarm Session ID operations on URLs
 */
export const SWARM_SESSION_ID_KEY = 'swarm-session-id'

/**
 * It removes the Swarm Session ID query parameter from the URL
 *
 * Swarm Session ID has to be removed from the URL so that the ID won't be exposed.
 *
 * @param bzzUrl BZZ URL with arbitrary query parameters, e.g. http://.../1231abcd.../valami.html?swarm-session-id=vmi&smth=5
 * @returns url without the SwarmSessionID
 */
export function removeSwarmSessionIdFromUrl(bzzUrl: string): string {
  const queryIndex = bzzUrl.indexOf('?')

  if (queryIndex === -1) return bzzUrl

  const invalidQueryEnds = bzzUrl.indexOf('/', queryIndex + 1)

  if (invalidQueryEnds !== -1) {
    // remove the whole string chunk starting from the invalid '?' query sign up to the first slash
    return bzzUrl.slice(0, queryIndex) + bzzUrl.slice(invalidQueryEnds)
  }

  // if the process reaches this point, the given url can be handled as with valid query parameter
  const constructedUrl = new URL(bzzUrl)
  constructedUrl.searchParams.delete(SWARM_SESSION_ID_KEY)

  return constructedUrl.toString()
}

export function appendSwarmSessionIdToUrl(fakeUrlRef: string): string {
  const fakeUrl = new URL(fakeUrlRef)
  const fakeUrlRefParams = new URLSearchParams(fakeUrl.search.slice(1))
  fakeUrlRefParams.append(SWARM_SESSION_ID_KEY, window.swarm.sessionId)

  return `${fakeUrlRef}?${fakeUrlRefParams.toString()}`
}
