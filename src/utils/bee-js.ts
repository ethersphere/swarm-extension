import { Bee, PostageBatch } from '@ethersphere/bee-js'

export function getPostageBatches(beeApiUrl: string): Promise<PostageBatch[]> {
  const bee = new Bee(beeApiUrl)

  return bee.getAllPostageBatch()
}
