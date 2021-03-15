// Define your message types like that:
// Key: Message name; Value: Feeder functions emit
export type Web2HelperMessage = {
  beeApiUrl: () => Promise<string>
}
