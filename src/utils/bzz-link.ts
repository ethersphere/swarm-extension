/** bzz.link CID implementaion */
import * as swarmCid from '@ethersphere/swarm-cid'

const subdomainUsedRegex = RegExp('^.*\\.swarm\\.localhost(:\\d+)?$')

export function hashToCid(
  input: string,
  type: swarmCid.ReferenceType = swarmCid.ReferenceType.FEED,
): ReturnType<typeof swarmCid.encodeReference> {
  return swarmCid.encodeReference(input, type)
}

export function CidToHash(input: string): string {
  let ref: swarmCid.Reference
  // FIXME: after https://github.com/ethersphere/swarm-cid-js/issues/7
  try {
    ref = swarmCid.decodeFeedCid(input)
  } catch (e) {
    ref = swarmCid.decodeManifestCid(input)
  }

  return ref
}

export function isSwarmCid(input: string): boolean {
  // FIXME: after https://github.com/ethersphere/swarm-cid-js/issues/7
  try {
    swarmCid.decodeFeedCid(input)

    return true
  } catch (e) {
    try {
      swarmCid.decodeManifestCid(input)

      return true
    } catch (e) {
      return false
    }
  }
}

export function isHash(input: string): boolean {
  return /^[0-9a-f]{64}$/i.test(input)
}

/** Returns back the subdomain of bzz.link or returns null */
export function getSubdomain(url: string): string | null {
  const dotArray = url.split('.')

  if (dotArray[1] !== 'bzz' || !dotArray[2].startsWith('link')) return null

  const subdomainSlashArray = dotArray[0].split('/') // dotArray[0] -> http(s)://{subdomain}

  return subdomainSlashArray[subdomainSlashArray.length - 1]
}

export function isLocalhost(url: string): boolean {
  const { host } = new URL(url)

  return host === 'localhost' || host.startsWith('localhost:')
}

export function isSubdomainUsed(url: string): boolean {
  const { host } = new URL(url)

  return subdomainUsedRegex.test(host)
}

export function createSubdomainUrl(beeApiUrl: string, subdomain: string): string {
  const [protocol, host] = beeApiUrl.split('://')

  return `${protocol}://${subdomain}.swarm.${host}`
}

export function subdomainToBzzResource(subdomain: string): string {
  if (isSwarmCid(subdomain)) {
    const contentHash = CidToHash(subdomain)

    return contentHash
  }

  return `${subdomain}.eth`
}

export function isLocalhost(url: string): boolean {
  const { host } = new URL(url)

  return host === 'localhost' || host.startsWith('localhost:')
}

export function isSubdomainUsed(url: string): boolean {
  const { host } = new URL(url)

  return subdomainUsedRegex.test(host)
}

export function createSubdomainUrl(beeApiUrl: string, subdomain: string): string {
  const [protocol, host] = beeApiUrl.split('://')

  return `${protocol}://${subdomain}.swarm.${host}`
}

export function bzzResourceToSubdomain(
  bzzReference: string,
  type: swarmCid.ReferenceType = swarmCid.ReferenceType.FEED,
): string | null {
  const lastSlash = bzzReference.indexOf('/')

  if (lastSlash) bzzReference.slice(0, lastSlash)

  if (isHash(bzzReference)) {
    const cid = hashToCid(bzzReference, type)

    return cid.toString()
  }

  if (bzzReference.endsWith('.bzz')) {
    return bzzReference.slice(0, -'.bzz'.length)
  }

  return null
}
