# Changelog

## 0.7.0 (2022-11-18)

Since manifest v2 extensions won't be allowed from June 2023, the Swarm Extension now supports manifest v3. But that brings some limitations,
including that the `swarm` object won't be injected into dApp pages. 
Instead each dApp should include the Swarm Extension Library into its code to comunicate with the extension.

The library supports all legacy methods of the `swarm` object.
The methods can be accessed by instantiating the Swarm class of the library.
It got two new methods:
* `echo`: checking whether the user has Swarm Extension installed.
* `register`: because the sessionId registration was done by the injected script, the applications integrated with the extension have to call `register` manually in order to use the swarm instance related functionalities.

The Swarm HTML elements was configured automatically with manifest-v2 but now the applications must include the corresponding HTML definitions from the library before rendering any Swarm HTML elements.

### Features

* manifest v3 ([#142](https://github.com/ethersphere/swarm-extension/issues/142)) ([287edee](https://github.com/ethersphere/swarm-extension/commit/287edee31a0cc85e1803aba121d22383389333e6))
