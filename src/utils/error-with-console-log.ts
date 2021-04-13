/* eslint-disable @typescript-eslint/no-explicit-any */
export class ErrorWithConsoleLog extends Error {
  constructor(message: string, ...consoleMessages: any[]) {
    console.error(message, ...consoleMessages)
    super(message)
  }
}
