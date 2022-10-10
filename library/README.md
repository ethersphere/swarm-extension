# Swarm Browser Extension JS Library

Library for interaction with the Swarm Browser Extension, from Dapps or other browser extensions.

## Installation

The library can be installed via npm:

```bash
npm install --save @ethersphere/swarm-extension
```

## Usage

### Swarm class

All interaction with the Swarm browser extension is established through the Swarm class:

```typescript
import { Swarm } from '@fairdatasociety/swarm-extension'
```

By default the class will connect to the Swarm browser extension using its ID from the Google store. If you
are running your version of the extension the class can be configured with a different extension ID.

```typescript
const swarm = new Swarm() // Using the default Swarm ID from the Google store
```

```typescript
const swarm = new Swarm('Swarm Extension ID...') // Using custom Swarm ID
```

### Swarm class functionalities

Before interacting with the library, Dapp should register new session by calling:

```typescript
await swarm.register()
```

or new session will be implicitly created when calling any method for the first time.

After registering a new session, session ID will be available as:

```typescript
swarm.sessionId
```

There are four different objects available in the Swarm calass:

- swarm.bzzLink - utility functions for converting bzz links
- swarm.localStorage - methods for interacting with local storage
- swarm.postageBatch - checking postage batch status
- swarm.web2Helper - getting information about bee URL

### Terminating connection

Once when the instance of the Swarm class is not needed anymore, connection with the extension can be terminated.

```typescript
swarm.closeConnection()
```

### Swarm HTML

To enable Swarm HTML features, include the `swarm-html.js` script into HTML page.

## Development

To watch for changes in the source code and recompile the library on change:

```bash
npm start
```

## Build

To build the library:

```bash
npm run build
```
