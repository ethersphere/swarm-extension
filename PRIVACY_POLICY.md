# Swarm-Extension Privacy Policy

The Swarm Extension belongs to the Swarm Foundation with the purpose of offering web3 environment
for running decentralised applications (dApps). It means, it provides similar functionalities as web2 browsers,
so sensitive information may be handled by the browser-extension such as Bee client configuration
or cross-domain localStore. Although the extension handles these sensitive information for
the basic security and functionality of dApps, the Swarm Foundation does not share any of these data
with other 3rd parties, nor collect it.

By installing Swarm Extension, you accept this privacy policy.

## Do we collect any information from you?

We do not collect any data from you, including personal data.

## Sharing Data By The Help of The Extension

In Swarm Extension, you can set the connection configuration of an Ethereum Swarm
Bee client node (that is a P2P storage client). The dApps can utilize this by calling
the interfaces of the extension and perform read and write operations on the P2P storage network.
The information stored on this network is publicly available and the encryption handling of
such content is the dApps responsibility.

## Under The Hood

DApp developers can store user session data to the user's swarm-extension storage.
It provides a cross-domain localstorage functionality that dApps can utilize
in order to save and load the same session data on any gateway host.
If dApps use the extension's private localstorage, it depends on the dapp in question
what data will be stored and how, like also in the case of data storing on Swarm network.
The extension does not share the userdata with other 3rd party, or collect it.

You can set the configuration of the Bee client in the extension's popup page
in order to connect dApps to web3 services. This configuration is stored in
the extension's localstore as well. At swarm-extension usage, some centralised
web3 service provider request will be redirected to the configured Bee client.
For example, all `https://*.bzz.link` URLs will be cancelled and will be tunneled
to your Bee client. The BZZ protocol also affects your default search engine usage
because if you search anything starting with `bzz://`, then it will redirect to your
Bee client's bzz path with the given BZZ reference.

The extension also injects a library to every webpage so that dapps can communicate
with your Bee node and utlize web3 features Because of that, webpages can detect
you have Swarm Extension installed by null-checking `window.swarm` object.

All before mentioned features along with others in this project aim at the decentralised usage of the internet.
Because the configured Bee client can be on any host (e.g. `http://localhost:1633` or `https://swarmgateway.org`)
we need permission to any host in order to handle Ethereum Swarm ecosystem domainless components.
The Swarm Extension uses FakeURLs that dApps can call directly like other simple webserver endpoints.
These FakeURL calls will be redirected to the corresponding configured Bee client endpoints based on the configuration,
that you provided in the extension's popup page.

## Will The Privacy Policy Be Changed?

As new versions are coming the Privacy Policy may be affected by that.
Please, check this document every time when a new release come out to be up-to-date
with the changes, it is your responsibility to do so. You can follow back what changes
happened by using [history feature of GitHub](https://github.com/ethersphere/swarm-extension/commits/main/PRIVACY-POLICY.md).
Any time when a new version of this privacy policy is posted, you aggree to all changes that are made.

## Where Can I Raise My Questions?

If there is any concern or question in your mind regarding to this
privacy-policy document, we encourage you to send an e-mail for us about it:
<info@ethswarm.org>.
