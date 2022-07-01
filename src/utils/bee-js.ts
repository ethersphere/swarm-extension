import { Bee, BeeDebug, PostageBatch } from '@ethersphere/bee-js'

export function getPostageBatches(beeDebugApiUrl: string): Promise<PostageBatch[]> {
  const bee = new BeeDebug(beeDebugApiUrl)

  return bee.getAllPostageBatch()
}

export async function isBeeApiAvailable(beeApiAddress: string): Promise<boolean> {
  try {
    const bee = new Bee(beeApiAddress)

    await bee.checkConnection()

    return true
  } catch (error) {
    return false
  }
}
