
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

```const InbloxTxSign = require('@inbloxme/password-based-tx-sign');```


> Initialising

Initialise the constructor using,

```const txSign = new InbloxTxSign();```


> Encryption & Storage

To encrypt the private key using the password and store it, use the function,

```const encryptPrivateKey = txSign.encrypt(privateKey, password);```

This will encrypt the private key using the password and send for storage.

    
> Retrieval and Decryption

To retrieve the private key and decrypt it at the client side,

```const decryptedPrivateKey = txSign.decrypt(password);```

This will authenticate the password, retrieve the private key and decrypt it.

## WIP

Want to contribute, we would :heart: that!

We are a Global :earth_asia::earth_africa::earth_americas: team! :muscle:

Write to dev@inblox.me, or follow us on twitter, [https://twitter.com/inblox_me](https://twitter.com/inblox_me)
