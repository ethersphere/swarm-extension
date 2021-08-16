/** bzz.link CID implementaion */
import CID from 'cids'

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    const hexByte = hex.substr(i * 2, 2)
    bytes[i] = parseInt(hexByte, 16)
  }

  return bytes
}

function bytesToHex(bytes: Uint8Array) {
  const hexByte = (n: number) => n.toString(16).padStart(2, '0')
  const hex = Array.from(bytes, hexByte).join('')

  return hex
}

export function hashToCID(input: string): CID {
  const hashBytes = hexToBytes(input)
  const multihash = new Uint8Array([0x1b, hashBytes.length, ...hashBytes])
  const cid = new CID(1, 'dag-pb', multihash)

  return cid
}

export function CIDToHash(input: string): string {
  const cid = new CID(input)
  const hashBytes = cid.multihash.slice(2)

  return bytesToHex(hashBytes)
}

export function isCID(input: string): boolean {
  return input.startsWith('bafyb') && input.length === 59
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

export function subdomainToBzzResource(subdomain: string): string {
  if (isCID(subdomain)) {
    const contentHash = CIDToHash(subdomain)

    return contentHash
  }

  return `${subdomain}.eth`
}

export function bzzResourceToSubdomain(bzzReference: string): string | null {
  const lastSlash = bzzReference.indexOf('/')

  if (lastSlash) bzzReference.slice(0, lastSlash)

  if (isHash(bzzReference)) {
    const cid = hashToCID(bzzReference)

    return cid.toString()
  }

  if (bzzReference.endsWith('.bzz')) {
    return bzzReference.slice(0, -'.bzz'.length)
  }

  return null
}
