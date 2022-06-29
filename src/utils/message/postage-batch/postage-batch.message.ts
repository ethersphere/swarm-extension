export interface PostageBatchMessage {
  isGlobalPostageBatchEnabled(): Promise<string>
}
