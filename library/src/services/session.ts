import { nanoid } from "nanoid"
import { DappSwarmMessages } from "../messages/dapp-swarm-messages"

export const sessionId = nanoid()
export async function register() {
  const messages = new DappSwarmMessages(sessionId)

  await messages.sendMessage(
    'registerDappSession',
    [sessionId],
  )
}
