import { SWARM_SESSION_ID_KEY } from './swarm-session-id'

/** API endpoints that the extension can serve out */
class FakeUrl {
  /**
   * base for the fake URLs
   * */
  private readonly baseUrl: string

  /**
   * Used when a tab has to navigate to new dApp page
   *
   * Swarm Session ID is not required
   * it will redirect the current tab
   */
  public readonly openDapp: string

  public readonly bzzProtocol: string

  /** Append neccessary keys to the Bee client requests in the future */
  public readonly beeApiAddress: string

  public readonly bzzProtocolRegex: string

  public readonly bzzSubdomainProtocolRegex: string

  public readonly beeApiAddressRegex: string

  public readonly bzzProtocolRegexWithKey: string

  public readonly bzzSubdomainProtocolRegexWithKey: string

  public readonly beeApiAddressRegexWithKey: string

  constructor() {
    // bee default API address, which is reserved on this localhost port number,
    // should not overlap with any other service
    // 'fake-url' part does not exist and should not in the future
    // does not need to change even if the client set other URL for bzz protocol
    // does not change during the workflow
    this.baseUrl = 'http://swarm.fakeurl.localhost'
    this.bzzProtocol = `${this.baseUrl}/bzz`
    this.beeApiAddress = `${this.baseUrl}/bee-api`
    this.openDapp = `${this.baseUrl}/open-dapp`

    const baseUrlRegex = `^http\\://swarm\\.fakeurl\\.localhost`
    this.bzzProtocolRegex = baseUrlRegex + '/bzz/(.*)'
    this.bzzSubdomainProtocolRegex = baseUrlRegex + '/bzz/(.*)\\.eth(.*)'
    this.beeApiAddressRegex = baseUrlRegex + '/bee-api.*'

    const swarmSessionIdKey = `(__${SWARM_SESSION_ID_KEY}~.*__)`
    this.bzzProtocolRegexWithKey = this.bzzProtocolRegex + swarmSessionIdKey
    this.bzzSubdomainProtocolRegexWithKey = this.bzzSubdomainProtocolRegex + swarmSessionIdKey
    this.beeApiAddressRegexWithKey = baseUrlRegex + `/bee-api${swarmSessionIdKey}/?(.*)`
  }
}

export const fakeUrl = new FakeUrl()
