
# Password Based Transaction Signing - Inbloxme

  

This package enables usage of inblox handlename infrastructure as a signing mechanism.


> **Disclaimer - This is WIP, and release in alpha.**


## Design Principles

 1. **Private Key Abstraction** - Inbloxme infrastructure never have the visibility of the private key, it's encrypted on the client with the user password(unsalted & unencrypted) and sent to the virtual Hardware Security Module for safe storage.
 2. **Password Invisibility** - User password is never exposed in plain text to any of the systems apart from the client.
 3. **Non-Custodial Relationship** - User Private Key is always exportable and encrypted version can be deleted (redundant) from the inbloxme infrastructure.
 4. **App Agnostic** - Any application without getting an API key can access inbloxme handlename service, password based transaction signing requires special access which can be requested for. (In Alpha Testing).

## Installation and Usage

> Installation

Install the package by running the command,

```npm i @inbloxme/password-based-tx-sign```


Import the package into your project using,

```const InbloxTxSign = require('@inbloxme/password-based-tx-sign').PBTS;```


> Initialising

Initialise the constructor using,

```const txSign = new InbloxTxSign(authenticationToken);```


> Encryption & Storage

To encrypt the private key using the password and store it, use the function,

```const encryptPrivateKey = txSign.encryptedAndSavePrivateKey({ handlename, password, privateKey });```

`handlename` - The Inblox Handlename of the user.
`password` - The Inblox password of the user. This password is used to encrypt the private key.
`privateKey` - The private key to be encrypted and stored in the database.

This will encrypt the private key using the password and send for storage.

    
> Retrieval and Decryption

To retrieve the private key and decrypt it at the client side,

```const decryptedPrivateKey = txSign.decryptAndSignTransaction({ password, handlename, rawTx, infuraKey, rpcUrl });```

`password` - The Inblox password of the user. This will be used to decrypt the encrypted private key at the client side.
`handlename` - The Inblox Handlename of the user.
`rawTx` - The transaction object. This will consist of `from`, `to`, `value`, `nonce`, `gas` and `gasPrice`.
`infuraKey` or `rpcUrl` - This is used to initialise the web3 provider which is used to send the signed transaction to the blockchain.


## WIP

Want to contribute, we would :heart: that!

We are a Global :earth_asia::earth_africa::earth_americas: team! :muscle:

Write to dev@inblox.me, or follow us on twitter, [https://twitter.com/inblox_me](https://twitter.com/inblox_me)
