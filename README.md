# Swarm Extension

**Warning: This project has Proof of Concept state now. There will be breaking changes continuously in the future. Also, no guarantees can be made about its stability, efficiency, and security at this stage. It only provides a platform currently to show workarounds and examples for the current problems in dApp environments top on Swarm**

This extension is a Chromium based extension since this platform seems the be the bottleneck for creating custom behaviours.
The whole project is a hack. It only points out the current problems within dApp ecosystem in regular Web2 browsers,
but on the other hand its goal to show alternatives how to build a real Web3 environment for dApps in structural sense.

## Fake URL

There is a need to separate dApp context from the user context in order to restrict dApp actions work with keys and resources of the user.
In a web3 environment the browser acts like a backend server. To accomplish this desired role it has to introduce endpoints that dApps can interact with.
These endpoints are called `Fake URLs`.
The naming came from these URLs should not point to any real existing endpoint that a common server could serve,
so the host part of the URL (probably) is not the real destination.

Web applications can make requests to other decentralized application APIs in the scope of the user
by aiming its corresponding Fake URLs that basically make redirect to these real API address.
It is neccessary, because the targeted services may need additional headers and keys to perform the action that **should not be handled on dApp side**.
The extension can keep this keys and configurations on the side of the user
and it does not expose the secrets to the applications that initialize the call.
In this sense it also works like a `proxy`.

During the redirect, the extension can create separated context for `root content IDs` and perform the action according to that.
(E.g. restrict calls towards the targeted service, cache the returned cookies from the response in the content context, etc.)
This architecture also allows for used decentralized services to change its default URLs to any arbitrary one,
meanwhile dApps do not have to guess this address.
For example Bee client has default `http://localhost:1633`, user can change it to any other port or even other gateway host,
the dApps will call it in the same way.

### Callable Endpoints

For any action the Fake URL host is `http://localhost:1633`.
As it is written earlier, it is not the address of the Bee client,
it is just a reserved host address that the extension took and built its Fake URL paths on it.
If the user changes their Bee API address, these callings still remain the same from dApp side.

- `http://localhost:1633/fake-url/bzz/*` - `BZZ protocol` redirects to this fake URL, thereby in `*` can be not only content reference with its path, but any BZZ protocol compatible reference. It will be redirected to `bzz` endpoint of the Bee client.
- `http://localhost:1633/fake-url/bee-api/*` - it will be forwarded to the Bee API. `*` has to be valid Bee API path

## Custom Protocol

Only supported Swarm protocol currently is `bzz`.
It makes a redirect to the BZZ endpoint of the Bee node by calling its corresponding Fake URL.
There will be need for other Swarm specific protocols (or extend the current one), which handles different type of feeds and mutable content.

The extension currently [injects a script](src/contentscript/index.ts) on document load in order to dApp pages could refer other P2P resources.
It is injected to every page basically, because in [manifest.json](manifest.json) you need to define where the injection happens by a fixed pattern for URLs and the host can be determenistic and changeable in this case.
Unfortunately, [Chrome does not have exposed function to register custom protocol](https://raw.githubusercontent.com/DefinitelyTyped/DefinitelyTyped/master/types/chrome/index.d.ts) in the [background script](src/background/index.ts)(, although it turned out some functionalities are not defined in this interface to keep them hidden, so analyzing the properties of `chrome` object is justified later).

Chrome lets you to register custom protocol in the context of the webpage, but only with prefix `web+`.
Nevertheless you can refer to any `bzz` resource in html if you add attribute `is=swarm-X` to your html element like `<img is="swarm-img" src="bzz://{content-address}" />`.

Current supported elements:
* `a` -> `<a is="swarm-a" (...)`
* `img` -> `<img is="swarm-image" (...)`
* `iframe` -> `<iframe is="swarm-frame" (...)`

In search bar the `bzz://{content-address}` will be redirected to `http(s)://{localgateway}/bzz/{content-address}`, but now it only reacts like this if the default search engine of the browser is set to Google. It also works the same on simple google search.

## dApp origin instead of host-based origin

All Swarm content that the extension renders will be put into _sandbox_ mode even in root level by _Content Security Policy_ headers.
It means dApps will act like a different, distinct webpage from the Bee host that serves those.
Therefore no traditional _cookies_ or _localStorage_ is available for dApps, but equivalent services of those are.

In order to substitue these traditional stateful behaviours of the applications with something else, the Swarm Extension introduces
the `dApp Security Context` as a new abstraction of origins.

## Cross-Domain Local Storage

In Web3, several different and distinct webpages can be rendered under one particular P2P client host.
It is a problem, because if the user changes its P2P client host then they have to rebuild again the dApp state from the start.

This unintended behaviour can be solved by the `dApp Security Context` of the extension:
the handling of `localStorage` method happens by the `sessionId` of the dApp.

Thereby even if the user changes its P2P client host, the state and their session will remain - unlike using only subdomain content address URLs with the traditional `localStorage`.

Of course, it is not necessary to set any ID manually, just call the usual `localStorage` methods but under the `swarm` object:
instead of `window.localStorage.setItem('swarm', 'bzz')` you can call `swarm.localStorage.setItem('swarm', 'bzz')` in order to persist data in the browser.

The `setItem` and `getItem` methods here are `async` methods, so these return with `Promise`.

## Test

There are some illustrative tests which show how these PoC ideas work.
For running tests, you need to run a Bee node.
By default, tests are run against `http://localhost:1633`. You can change it by setting environment variable `BEE_API_URL`.
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

### BZZ protocol test

For BZZ protocol there are test pages to illustrate the functionality.
The test page folder is located in [test/bzz-test-page](test/bzz-test-page).
In its [index page](test/bzz-test-page/index.html), you see how you can refer to external Swarm content in HTML files without assuming any gateway host.

### Maintainers

- [nugaon](https://github.com/nugaon)
- [Cafe137](https://github.com/Cafe137)

See what "Maintainer" means [here](https://github.com/ethersphere/repo-maintainer).
