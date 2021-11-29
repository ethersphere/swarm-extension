import { nanoid } from 'nanoid'
import { fakeUrl as FakeUrl } from '../src/utils/fake-url'
import { SWARM_SESSION_ID_KEY, unpackSwarmSessionIdFromUrl } from '../src/utils/swarm-session-id'

describe('Unit', () => {
  const testBzzHash = '82de75aa2e4e27eefc3c00f5cdc7a2cb787402906a73609803de0ee25602b4f5'

  test('Unpack Swarm session ID from URL', () => {
    const fakeUrl = `${FakeUrl.beeApiAddress}/bzz/${testBzzHash}`
    const sessionId = nanoid()
    const fakeUrlWithSessionId = `${fakeUrl}__${SWARM_SESSION_ID_KEY}~${sessionId}__`
    const { originalUrl: fakeUrlAgain, sessionId: sessionIdAgain } = unpackSwarmSessionIdFromUrl(fakeUrlWithSessionId)

    expect(fakeUrlAgain).toBe(fakeUrl)
    expect(sessionIdAgain).toBe(sessionId)
  })

  test('Throw error at Unpacking Swarm session ID from wrong URL', () => {
    const fakeUrl = `${FakeUrl.beeApiAddress}/bzz/${testBzzHash}`
    const sessionId = nanoid()
    const fakeUrlWithSessionId = `${fakeUrl}__not-swarm-session-id~${sessionId}__`
    expect(() => unpackSwarmSessionIdFromUrl(fakeUrlWithSessionId)).toThrowError()
  })
})
