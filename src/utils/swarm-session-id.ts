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
 * @throws if the sessionId is not found in the URL
 */
export function unpackSwarmSessionIdFromUrl(bzzUrl: string): { sessionId: string; originalUrl: string } {
  const searchString = `__${SWARM_SESSION_ID_KEY}~`
  const sessionIdParamIndex = bzzUrl.indexOf(searchString)

  if (sessionIdParamIndex === -1) throw new Error(`There is no ${SWARM_SESSION_ID_KEY} element in url ${bzzUrl}`)

  const sessionIdStartIndex = sessionIdParamIndex + searchString.length
  const sessionIdEndIndex = bzzUrl.indexOf('__', sessionIdStartIndex)

  const sessionId = bzzUrl.substring(sessionIdStartIndex, sessionIdEndIndex)
  console.log('sessionId', sessionId)

  const originalUrl = bzzUrl.split(searchString + sessionId + '__').join('')
  console.log('originalUrl', originalUrl)

  return {
    sessionId,
    originalUrl,
  }
}

export function appendSwarmSessionIdToUrl(fakeUrlRef: string): string {
  return `${fakeUrlRef}__${SWARM_SESSION_ID_KEY}~${window.swarm.sessionId}__`
}
