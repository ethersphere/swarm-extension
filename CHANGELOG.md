# Changelog

## 0.7.0 (2022-11-18)

Since manifest v2 extensions won't be allowed from June 2023, the Swarm Extension now supports manifest v3. But that brings some limitations, not present in v2. Here are the key changes in v3:

- The `swarm` object won't be injected into dApp pages. Instead each dApp should include the [Swarm Extension Library](library/README.md) into its code to comunicate with the extension.
- Blocking interceptors are not allowed in manifest v3, so the new implementation uses the [Declarative Network Request API](https://developer.chrome.com/docs/extensions/reference/declarativeNetRequest/). This requirement prevents the extension from checking session ID for fake URL requests. That means the extension cannot check the security context of the links that are being accessed.
- If bee URL is set to `localhost`, then links are redirected to subdomain based bee URLs. For example, trying to access the `bzz://site.eth` URL will result in accessing the `http://site.swarm.localhost:1633/` URL.

### Features

* manifest v3 ([#142](https://github.com/ethersphere/swarm-extension/issues/142)) ([287edee](https://github.com/ethersphere/swarm-extension/commit/287edee31a0cc85e1803aba121d22383389333e6))
  * remove session-id from url ([#150](https://github.com/ethersphere/swarm-extension/pull/150))
  * add subdomain redirection ([#147](https://github.com/ethersphere/swarm-extension/pull/147))

## [0.6.0](https://github.com/ethersphere/swarm-extension/compare/v0.5.0...v0.6.0) (2022-10-04)

The bzz.link and bzz:// URLs will be redirected to the http://{cid}.localhost:{port} address in case of locally running Bee node.
It allows to leverage the basic security context handling on subdomains for dApps that does not require sandbox rendering anymore.

The Bee Dashboard recently released a new version that again supports running in browser environment.
Because of that, this dependency has been updated in Swarm Extension that fixes some of the problems with older version.

### Features

* localhost subdomain redirection ([#136](https://github.com/ethersphere/swarm-extension/issues/136)) ([082f053](https://github.com/ethersphere/swarm-extension/commit/082f053dd9b59edff33e922898234a2820fdcc2e))


### Bug Fixes

* bee dashboard ([#143](https://github.com/ethersphere/swarm-extension/issues/143)) ([225aec5](https://github.com/ethersphere/swarm-extension/commit/225aec525c40dcf0199c30d8c9dce44feea17e41))

## [0.5.0](https://github.com/ethersphere/swarm-extension/compare/v0.4.0...v0.5.0) (2022-07-06)


### Features

* add method to check if global postage batch is enabled ([#122](https://github.com/ethersphere/swarm-extension/issues/122)) ([#128](https://github.com/ethersphere/swarm-extension/issues/128)) ([b56536f](https://github.com/ethersphere/swarm-extension/commit/b56536f51266d223a1f22ad35d556f95d02e87b7))
* e2e api ([#102](https://github.com/ethersphere/swarm-extension/issues/102)) ([f0091b2](https://github.com/ethersphere/swarm-extension/commit/f0091b2d4b545b00b8b5b2e2511449b6bbe76d7f))

## [0.4.0](https://github.com/ethersphere/swarm-extension/compare/v0.3.1...v0.4.0) (2022-06-30)


### Features

* add option to check whether bee api is available ([#127](https://github.com/ethersphere/swarm-extension/issues/127)) ([34719b0](https://github.com/ethersphere/swarm-extension/commit/34719b03d9ca1cfb921a0fd14bcad605a810e1d1))
* new swarm html elements ([#124](https://github.com/ethersphere/swarm-extension/issues/124)) ([2ce4f00](https://github.com/ethersphere/swarm-extension/commit/2ce4f00b1fa27787c7f54d668703729656a713d1))


### Bug Fixes

* global postage batch ([#125](https://github.com/ethersphere/swarm-extension/issues/125)) ([21be2dc](https://github.com/ethersphere/swarm-extension/commit/21be2dce8627d9e251dc231736ea0315c129c80e))
* set global postage batch on fetch ([#121](https://github.com/ethersphere/swarm-extension/issues/121)) ([f392b7c](https://github.com/ethersphere/swarm-extension/commit/f392b7c50de8641a63114f7a9c552a2e0aaaf28a))

## [0.3.1](https://github.com/ethersphere/swarm-extension/compare/v0.3.0...v0.3.1) (2022-06-11)


### Bug Fixes

* update supported bee version to 1.6.1 with bee-dashboard v0.16.0 ([#119](https://github.com/ethersphere/swarm-extension/issues/119)) ([f808a81](https://github.com/ethersphere/swarm-extension/commit/f808a815b99db44eade0b971ddf62d72703c870b))
* update swarm dependencies ci 3 ([#116](https://github.com/ethersphere/swarm-extension/issues/116)) ([76141e0](https://github.com/ethersphere/swarm-extension/commit/76141e0d0c39dbe086ca29042a471c7226b0220f))

## 0.3.0 (2022-04-20)


### Features

* add extension hot reload ([097565c](https://www.github.com/ethersphere/swarm-extension/commit/097565c04387ee12541b73d5f738b4be5d6245f9))
* bee dashboard integration ([#74](https://www.github.com/ethersphere/swarm-extension/issues/74)) ([eb7ca96](https://www.github.com/ethersphere/swarm-extension/commit/eb7ca96a407d256103b4e9a06c20871b945e8193))
* bee dashboard v0.12 ([#88](https://www.github.com/ethersphere/swarm-extension/issues/88)) ([51dcac8](https://www.github.com/ethersphere/swarm-extension/commit/51dcac890a1b6bec064dd897492dd5d7c0436b83))
* bzz protocol ([#1](https://www.github.com/ethersphere/swarm-extension/issues/1)) ([8cc52ca](https://www.github.com/ethersphere/swarm-extension/commit/8cc52ca764f8bfd5d5541e15ea0dc8371c1d94ae))
* bzz.link ([#51](https://www.github.com/ethersphere/swarm-extension/issues/51)) ([a8a1618](https://www.github.com/ethersphere/swarm-extension/commit/a8a161872ae02f71b3cc4d5fcaaf9a6e3ff8787d))
* changable bee address ([#9](https://www.github.com/ethersphere/swarm-extension/issues/9)) ([8a5dc40](https://www.github.com/ethersphere/swarm-extension/commit/8a5dc407c48ab149cecb81063d57a7ad90dcf9ba))
* cross-domain local storage ([#43](https://www.github.com/ethersphere/swarm-extension/issues/43)) ([b2eacc0](https://www.github.com/ethersphere/swarm-extension/commit/b2eacc055c5cd9157c2f02e888fec934c6b6d7a0))
* csp header ([#47](https://www.github.com/ethersphere/swarm-extension/issues/47)) ([570e283](https://www.github.com/ethersphere/swarm-extension/commit/570e2833611a95cc8b098ef26fd6d292d7c8350e))
* dapp session id registration ([#26](https://www.github.com/ethersphere/swarm-extension/issues/26)) ([9adbf14](https://www.github.com/ethersphere/swarm-extension/commit/9adbf14f8061406d29483b74cc5e44d24a7f1b5f))
* fake url ([#22](https://www.github.com/ethersphere/swarm-extension/issues/22)) ([6bedf5b](https://www.github.com/ethersphere/swarm-extension/commit/6bedf5b14752449d82345e45c4a1d6f94f5545cb))
* global postage stamp ([#40](https://www.github.com/ethersphere/swarm-extension/issues/40)) ([40bddab](https://www.github.com/ethersphere/swarm-extension/commit/40bddabbff5a6bd9ce91ed155dcfc93ad8b4cda8))
* let's roll! ([b8e552d](https://www.github.com/ethersphere/swarm-extension/commit/b8e552dc66e564661597cf9aec7b0f64712f89f3))
* messaging ([#16](https://www.github.com/ethersphere/swarm-extension/issues/16)) ([fb49955](https://www.github.com/ethersphere/swarm-extension/commit/fb49955a80e17a1b26d8957eadcdc759263abadd))
* new bzz link cid format ([#81](https://www.github.com/ethersphere/swarm-extension/issues/81)) ([570edb5](https://www.github.com/ethersphere/swarm-extension/commit/570edb5c8fbc5b9604a26dc6c5d348b9d716988d))
* postage batch on debug ([#69](https://www.github.com/ethersphere/swarm-extension/issues/69)) ([273a4fb](https://www.github.com/ethersphere/swarm-extension/commit/273a4fba095f5399c2ea3ce2bc8b4fe37f5601eb))
* session id handling ([#37](https://www.github.com/ethersphere/swarm-extension/issues/37)) ([4af7a83](https://www.github.com/ethersphere/swarm-extension/commit/4af7a83cd4ea4c17bcdc946873a22df8194b8bc4))
* swarm html ([#29](https://www.github.com/ethersphere/swarm-extension/issues/29)) ([5002d14](https://www.github.com/ethersphere/swarm-extension/commit/5002d14a3898b09aecad3a84b9367c031f539327))
* upgraded extension design ([#84](https://www.github.com/ethersphere/swarm-extension/issues/84)) ([b2363ae](https://www.github.com/ethersphere/swarm-extension/commit/b2363ae18256a24091de1e0a3c57ae0ceeeb776b))


### Bug Fixes

* add ExtraActionsPlugin everywhere ([dc5dc3c](https://www.github.com/ethersphere/swarm-extension/commit/dc5dc3c792b0cf964c0cbdac29b4439b4a81ee6b))
* fix cross platform replace ([14cc869](https://www.github.com/ethersphere/swarm-extension/commit/14cc869676cc6804395161eb4f3600e00f3625eb))
* fix too early initialization of bee dashboard component ([#95](https://www.github.com/ethersphere/swarm-extension/issues/95)) ([#99](https://www.github.com/ethersphere/swarm-extension/issues/99)) ([9ac1146](https://www.github.com/ethersphere/swarm-extension/commit/9ac1146f1758538dcc4d7c35ea46b8edb5580f08))
* hot-reload and compiling ([#31](https://www.github.com/ethersphere/swarm-extension/issues/31)) ([028f1e7](https://www.github.com/ethersphere/swarm-extension/commit/028f1e77f5c4263f501230792fb01f4d07f08924))
* reinit global postage batch at bee api change ([#58](https://www.github.com/ethersphere/swarm-extension/issues/58)) ([7e1ef6c](https://www.github.com/ethersphere/swarm-extension/commit/7e1ef6c25173bdaf97f05187891086e38d9e80e8))
* remove compile types and fix declaration file ref ([#19](https://www.github.com/ethersphere/swarm-extension/issues/19)) ([c0563fd](https://www.github.com/ethersphere/swarm-extension/commit/c0563fd9c5fad5f30fabeef9f579e5d57a7607aa))
* swarm.localStorage mimics window.localStorage with null and undefined set ([#72](https://www.github.com/ethersphere/swarm-extension/issues/72)) ([700ac0c](https://www.github.com/ethersphere/swarm-extension/commit/700ac0ce6dffba03a332f8df0bc727d55df9a923))


### Continuous Integration

* bump release version ([#89](https://www.github.com/ethersphere/swarm-extension/issues/89)) ([47a135e](https://www.github.com/ethersphere/swarm-extension/commit/47a135e044bc6e4eb978dde5c28379f9622362c1))
