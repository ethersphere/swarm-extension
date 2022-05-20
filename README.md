# Swarm Extension

**Warning: This project has Proof of Concept state now. There will be breaking changes continuously in the future. Also, no guarantees can be made about its stability, efficiency, and security at this stage. It only provides a platform currently to show workarounds and examples for the current problems in dApp environments top on Swarm**

This browser extension provides an alternative to have a web3 environment in a web2 browser for users and dApps.

Users can interact with the Swarm network in two ways: by running their own Bee client or using a gateway solution.
Either of the cases, users can set the connection data of the desired Bee client within the extension in order to channel all Bee client request to that trusted endpoint.
Other settings can be placed regarding how the user wants to interact with the web3 applications, like using one selected postage batch for any file upload attempt of dApps.

In a web3 architecture the browser is the new server-side backend, therefore frontend applications (dApps) should communicate with it.
For that, there is a pre-defined [API](#fake-url) that dApps can request to and interact with the Bee client of the user in a secure and abstracted manner.
By that, there is no need to assume the user runs a Bee node on the default ports on their computer, or to fallback to a well-known public-gateway when referencing external Swarm resources; just refer to the representative, fixed and abstracted Bee client endpoints that the extension defines [in HTML](#Swarm-HTML) or [in JavaScript](#Custom-Protocol).
The web2 is based on domain-centric considerations, because of that, lot of features cannot be used in a secure way when many applications are loaded from the same (Bee) host.
That is way the extension has its [own Security Context](#dApp-origin-instead-of-host-based-origin) and separates dApps by their root content addresses.
With new Security Context, new governor mechanisms can emerge like [cross-domain localstorage handling](#Cross-Domain-Local-Storage).

## Installation

The extension can be installed to Chromium based browsers currently, but we plan it to have on Firefox later as well.

You can build the project by running
```sh
npm ci
npm run compile
```

commands. If everything went right, then a `dist` folder appeared in the root of the project folder. That folder has to be [added to your browser extensions](chrome://extensions/) as an unpacked extension. You can load unpacked extensions only if you checked in the `Developer mode` (top-right corner).

## Fake URL

There is a need to separate dApp context from the user context in order to restrict dApp actions work with keys and resources of the user.
In a web3 environment the browser acts like a backend server. To accomplish this desired role it has to introduce endpoints that dApps can interact with.
These endpoints are called `Fake URLs`.
The naming came from these URLs should not point to any real existing endpoint that a common server could serve,
so the host part of the URL (probably) is not the real destination.

Web applications can make requests to other decentralized application APIs in the scope of the user
by aiming its corresponding Fake URLs that basically make redirect to these real API address.
It is neccessary, because the targeted services may need additional headers and keys to perform the action that **should not be handled on dApp side**.
The extension can keep these keys and configurations on the side of the user
and it does not expose the secrets to the applications that initialize the call.
In this sense it also works like a `proxy`.

During the redirection, the extension creates separated context by `root content IDs` and performs the action according to that.
(E.g. restrict calls towards the targeted service, cache the returned cookies from the response in the content context, etc.)
This architecture also allows changing the default URLs of decentralized services (Bee) to any arbitrary one,
meanwhile dApps do not have to guess this address.
For example Bee client has default `http://127.0.0.1:1633`, user can change it to any other port or even other gateway host,
the dApps will call it in the same way.

### Callable Endpoints

For any action the Fake URL host is `http://swarm.fakeurl.localhost`.
As it is written earlier, it is not the address of the Bee client,
it is just a reserved host address that the extension took and built its Fake URL paths on it.
If the user changes their Bee API address, these endpoints still remain the same from dApp side.

- `http://swarm.fakeurl.localhost/bzz/*` - `BZZ protocol` redirects to this fake URL, thereby in `*` can be not only content reference with its path, but any BZZ protocol compatible reference. It will be redirected to `bzz` endpoint of the Bee client.
- `http://swarm.fakeurl.localhost/bee-api/*` - it will be forwarded to the Bee API. `*` has to be valid Bee API path

## Custom Protocol

The Swarm protocol to address other P2P content is `bzz`. It makes a redirection to the BZZ endpoint of the Bee node.
If you type `bzz://{content-address}` into the address bar, the page will be redirected to `http(s)://{your-bzz-node-host}/bzz/{content-address}`. This requires the default search engine of the browser to be set to Google.
It also behaves the same on simple google searches on `https://google.com`.

Additionally, the extension currently [injects a script](src/contentscript/index.ts) on document load so that dApp pages could refer any other P2P resources.
These references will request the configured Bee client of the user.
It is injected to every page basically, so any frontend application can utilize this feature.

There will be need for other Swarm specific protocols (or extend the current one), which handle different type of feeds and mutable content.

You can read about it in more detail in the following section

### Swarm HTML

You can refer to any `bzz` resource in html if you add attribute `is=swarm-X` to your html element, where `X` is the name of the HTML tag element, like `<img is="swarm-img" src="bzz://{content-address}" />`.

Current supported elements:
* `a` -> `<a is="swarm-a" (...)`
* `img` -> `<img is="swarm-img" (...)`
* `iframe` -> `<iframe is="swarm-iframe" (...)`

at references, you can use the `bzz` protocol or the `bzz.link` structure that is detailed below.

## CID references and Public Gateway replacement

Swarm has service to get content from its network through public gateways, and you can refer any Swarm content by CIDs or by their ENS names without `.eth` ending in form of `https://{cid}.bzz.link/{path}` or `https://{ens-name}.bzz.link` respectively.
These requests can be tunneled to the configured Bee client of the user instead of using gateways.

With this feature, dApps can satisfy simultaniously gateway users and others who locally run their bee node.
All requests towards the `bzz.link` gateways will be cancelled and tunneled to the local Bee client in case of extension users.

The consequence of this behaviour the dApps which use external bzz.link references in their HTML code and want to available via both bzz.link gateways and private extension connections have to use [Swarm HTML elements](#Swarm-HTML).

Additinonally, the extension provides an injected library `swarm.bzzLink` to get CID of a swarm content hash (and vica versa).

## dApp origin instead of host-based origin

All Swarm content that the extension renders will be put into _sandbox_ mode even in root level by _Content Security Policy_ headers.
It means dApps will act like a different, distinct webpage from the Bee host that serves those.
Therefore no traditional _cookies_ or _localStorage_ is available for dApps, but equivalent services of those are.
(Cookie support is planned in the future, it is possible by this current architecture).

In order to substitue these traditional stateful behaviours of the applications with something else, the Swarm Extension introduces
the `dApp Security Context` as a new abstraction of origins.

### Cross-Domain Local Storage

In Web3, several different and distinct webpages can be rendered under one particular P2P client host.
It is a problem, because if the user changes its P2P client host then they have to rebuild again the dApp state from the start.

This unintended behaviour can be sorted out by the `dApp Security Context` of the extension:
the handling of `localStorage` method happens based on the `sessionId` of the dApp.

Thereby even if the user changes its P2P client host, the state and their session will remain - unlike using only subdomain content address URLs with the traditional `localStorage`.

Of course, it is not necessary to set any ID manually, just call the usual `localStorage` methods but under the `swarm` object:
instead of `window.localStorage.setItem('swarm', 'bzz')` you can call `swarm.localStorage.setItem('swarm', 'bzz')` in order to persist data in the browser.

The `setItem` and `getItem` methods here are `async` methods, so these return with `Promise`.

## Contribution

PRs and any new ideas are welcome!

There is a hot-reload functionality of extension compilation to react on code changes.

```sh
npm run dev
```

if you run [test in demo mode](#Test), the extension in the Chromium browser will be automatically reloaded.

### Test

There are some illustrative tests which show how these PoC ideas work.
For running tests, you need to run a Bee node.
By default, tests are run against `http://127.0.0.1:1633`. You can change it by setting environment variable `BEE_API_URL`.
On test pages, if a Jinn can show up under a section which means it works as it is intended to be.
On other hand, if Jafar comes into the picture, than it points out a bad/insecure use-case.

For tests, execute the following:

```bash
 $ npm run compile && npm run test
```
In order to present or interact with functionalities of `swarm-extension`, run command
```bash
 $ npm run compile && npm run test:demo
```
if everything went great, you can see the test pages in a Chromium browser.

For testing use Node version >= 14!

If you have timeout problems, you can always raise the global timeout limit (in milliseconds) by passing `--testTimeout=60000` for the test.

In case of many subsequent test runs, set `BEE_STAMP` with a valid postage stamp in order to not wait for stamp generation.

### BZZ protocol test

For BZZ protocol, there are test pages to illustrate the functionality.
The test page folder is located in [test/bzz-test-page](test/bzz-test-page).
In its [index page](test/bzz-test-page/index.html), you see how you can refer to external Swarm content in HTML files without assuming any gateway host.

### Maintainers

- [nugaon](https://github.com/nugaon)
- [Cafe137](https://github.com/Cafe137)

See what "Maintainer" means [here](https://github.com/ethersphere/repo-maintainer).
