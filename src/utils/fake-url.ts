/** API endpoints that the extension can serve out */
class FakeUrl {
  /**
   * base for the fake URLs
   * */
  private readonly baseUrl: string

  public readonly webBzzProtocol: string

  public readonly bzzProtocol: string

  constructor() {
    // bee default API address, which is reserved on this localhost port number,
    // should not overlap with any other service
    // 'fake-url' part does not exist and should not in the future
    // does not need to change even if the client set other URL for bzz protocol
    // does not change during the workflow
    this.baseUrl = 'http://localhost:1633/fake-url'
    this.webBzzProtocol = `${this.baseUrl}/web-bzz`
    this.bzzProtocol = `${this.baseUrl}/bzz`
  }
}

export const fakeUrl = new FakeUrl()
