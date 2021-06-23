import type { PostageBatch } from '@ethersphere/bee-js'

export function normalizeUtilization(stamp: PostageBatch): number {
  const { depth, bucketDepth, utilization } = stamp

  return utilization / Math.pow(2, depth - bucketDepth)
}

export function utilizationPercentage(stamp: PostageBatch, precision = 3): string {
  const utilization = normalizeUtilization(stamp)

  return (utilization * 100).toPrecision(precision)
}
