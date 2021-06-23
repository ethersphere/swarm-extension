import type { PostageBatch } from '@ethersphere/bee-js'

export function calculateUsagePercentage(stamp: PostageBatch): number {
  const { depth, bucketDepth, utilization } = stamp

  return utilization / Math.pow(2, depth - bucketDepth)
}
