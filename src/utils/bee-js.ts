import { BeeDebug, PostageBatch } from '@ethersphere/bee-js'

export function getPostageBatches(beeDebugApiUrl: string): Promise<PostageBatch[]> {
  const bee = new BeeDebug(beeDebugApiUrl)

  return bee.getAllPostageBatch()
}
