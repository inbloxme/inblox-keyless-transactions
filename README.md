
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

```npm install @inbloxme/password-based-tx-sign```


Import the package into your project using,

```const inblox = require('@inbloxme/password-based-tx-sign');```


> Initialising

Initialise the constructor using,

```const txSign = new inblox.PBTS(authenticationToken);```

> **NOTE - Wallet generation and recover methods do not require constructor initialization.**


> Encryption & Storage

This method is used to store the private key after encrypting it with the user's password.
The password of the user gets validated first before encrypting the private key and storing it in the Inblox Key Management System (KMS).

```const StoreKey = txSign.storeKey({ privateKey, password });```

`privateKey` - The private key to be encrypted and stored in the Inblox Key Management System.
`password` - The Inblox password of the user. This password is used to encrypt the private key.

    
> Encrypted Private Key Retrieval

This method is used to get the encrypted private key from Inblox KMS.

```const EncryptedPrivateKey = txSign.getKey({ password });```

`password` - The Inblox password of the user. This will be used to decrypt the encrypted private key at the client side.


> Change Password

This method is used to change the existing password of a user. The old password of the user will get validated and it will be used to retrieve the encrypted private key of the user and decrypt it. Then the private key will be encrypted using the new password and it will get sent to the Inblox KMS.

```const changePassword = txSign.changePassword({ oldPassword, newPassword, confirmPassword });```

`oldPassword` - The old password of the user.
`newPassword` - The new password of the user.
`confirmPassword` - Confirm new password.


> Reset Password

This method is used to reset the password incase the user forgets thir existing password. The user will have to prove their ownership for their private key before re-encrypting their private key with their new password. This can be done by providing either their private key directly or the 12 word seed phrase or their keystore file with its password. The private key and public address will get extracted which will be used to verify against the public address stored with the Inblox systems.

```const resetPassword = txSign.resetPassword({ privateKey, seedphrase, encryptedJson, walletPassword, newPassword, });```

`privateKey` - The private key of the user's wallet.
OR
`seedPhrase` - The 12 word seed phrase.
OR
`encryptedJson` - Keystore JSON.
AND
`walletPassword` - Keystore password.
AND
`newPassword` - New password.


> **NOTE - Below methods doesn't need constructor initialization.**


> Generate New Wallet

This method is used to generate a new Ethereum wallet.

```const newWallet = inblox.createWallet();```


> Import Wallet From Mnemonic

This method is used to import an Ethereum wallet from it's 12 word mnemonic phrase.

```const wallet = inblox.importFromMnemonic(mnemonic);```

`mnemonic` - 12 word mnemonic phrase.


> Import Wallet From Keystore JSON

This method is used to import an Ethereum wallet from it's keystore file.

```const wallet = inblox.importFromEncryptedJson(json, passphrase);```

`json` - Keystore JSON of the wallet.
`passphrase` - Keystore password.


## WIP

Want to contribute, we would :heart: that!

We are a Global :earth_asia::earth_africa::earth_americas: team! :muscle:

Write to dev@inblox.me, or follow us on twitter, [https://twitter.com/inblox_me](https://twitter.com/inblox_me)
