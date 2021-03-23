// Define your message types like that:
// Key: Message name; Value: Feeder functions emit
export interface IWeb2HelperMessage {
  beeApiUrl: () => Promise<string>
}
