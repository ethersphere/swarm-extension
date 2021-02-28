# Swarm Extension

**Warning: This project has Proof of Concept state now. There will be breaking changes continuously in the future. Also, no guarantees can be made about its stability, efficiency, and security at this stage. It only provides a platform currently to show workarounds and examples for the current problems in dApp environments top on Swarm**

This extension is a Chromium based extension since this platform seems the be the bottleneck for creating custom behaviours.
The whole project is a hack. It only points out the current problems within dApp ecosystem in regular Web2 browsers,
but on the other hand its goal to show alternatives how to build a real Web3 environment for dApps in structural sense.

## Custom Protocol

Only supported Swarm protocol currently is `bzz`. It makes a redirect to the BZZ endpoint of the Bee node(, which is fixed `localhost:1633`, will be changeable later).
There will be need for other Swarm specific protocols, which handles different type of feeds and mutable content.

The extension currently [injects a script](src/contentscript/index.ts) on document load in order to dApp pages could refer other P2P resources.
It is injected to every page basically, because in [manifest.json](manifest.json) you need to define where the injection happens by a fixed pattern for URLs and the host can be determenistic and changeable in this case.
Unfortunately, [Chrome does not have exposed function to register custom protocol](https://raw.githubusercontent.com/DefinitelyTyped/DefinitelyTyped/master/types/chrome/index.d.ts) in the [background script](src/background/index.ts)(, although it turned out some functionalities are not defined in this interface to keep them hidden, so analyzing the properties of `chrome` object is justified later).

Chrome lets you to register custom protocol in the context of the webpage, but only with prefix `web+`.
It means you can only refer to external P2P content by `web+bzz://{content-address}`

In search bar the `bzz://{content-address}` will be redirected to `http(s)://{localgateway}/bzz/{content-address}`, but now it only reacts like this if the default search engine of the browser is set to Google. It also works the same on simple google search.

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
if everything went great, you can see the test pages in a Chromium browser.

### BZZ protocol test

For BZZ protocol there are test pages to illustrate the functionality.
The test page folder is located in [test/bzz-test-page](test/bzz-test-page).
In its [index page](test/bzz-test-page/index.html), you see how you can refer to external Swarm content in HTML files without assuming any gateway host.
