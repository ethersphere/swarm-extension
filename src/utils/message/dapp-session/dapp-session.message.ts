// Define your message types like that:
// Key: Message name; Parameter: payload data from sender side, Return Value: Feeder functions emit
export interface IDappSessionMessage {
  registerDappSession: (sessionId: string) => void
}
