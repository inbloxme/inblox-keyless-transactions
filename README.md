
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

```npm install @inbloxme/inblox-keyless-transactions```


Import the package into your project using,

```const inblox = require('@inbloxme/password-based-tx-sign');```


##  Password Based Transaction Sign


> Initialising

Initialise the constructor using,

```const PBTS = new inblox.PBTS(authenticationToken);```


> Encryption & Storage

This method is used to store the private key after encrypting it with the user's password.
The password of the user gets validated first before encrypting the private key and storing it in the Inblox Key Management System (KMS).

```const StoreKey = PBTS.storeKey({ privateKey, password });```

`privateKey` - The private key to be encrypted and stored in the Inblox Key Management System.
`password` - The Inblox password of the user. This password is used to encrypt the private key.


> Get Encrypted Private Key

This method is used to get the encrypted private key of the user from Inblox Key Management System.

```const encryptedPrivateKey = PBTS.getEncryptedPrivateKey({ password });```

`password` - The password of the user.


> Change Password

This method is used to change the existing password of a user. The old password of the user will get validated and it will be used to retrieve the encrypted private key of the user and decrypt it. Then the private key will be encrypted using the new password and it will get sent to the Inblox KMS.

```const changePassword = PBTS.changePassword({ encryptedPrivateKey, oldPassword, newPassword, confirmPassword });```

`encryptedPrivateKey` - Encrypted private key of the user which is obtained using the method `getEncryptedPrivateKey`.
`oldPassword` - The old password of the user.
`newPassword` - The new password of the user.
`confirmPassword` - Confirm new password.


> Reset Password

This method is used to reset the password incase the user forgets thir existing password. The user will have to prove their ownership for their private key before re-encrypting their private key with their new password. This can be done by providing either their private key directly or the 12 word seed phrase or their keystore file with its password. The private key and public address will get extracted which will be used to verify against the public address stored with the Inblox systems.

```const resetPassword = PBTS.resetPassword({ privateKey, seedphrase, encryptedJson, walletPassword, newPassword, });```

`privateKey` - The private key of the user's wallet.
OR
`seedPhrase` - The 12 word seed phrase.
OR
`encryptedJson` - Keystore JSON.
AND
`walletPassword` - Keystore password.
AND
`newPassword` - New password.


> Sign Transaction

This method can be used to sign a transaction using the user's private key. The transaction can be done using the provider as infura by inputting the infura key or the RPC URL.

```const signTx = PBTS.signAndSendTx({ password, rawTx });```

`password` - The Inblox password of the user.
`rawTx` - The raw transaction object.

The `rawTx` object contains,
`to` - Address to send the transaction to.
`from` - Address of the sender.
`gasPrice` - Price of gas in wei.
`gasLimit` - Gas Limit for the transaction.
`nonce` - Nonce of the sender address.
`value` - Amount to be sent in the transaction.
`data` - Data to be passed in the transaction. Can be a contract call data.


##  Wallet Generation


> Initialising

Initialise the constructor for Wallet generation and wallet import methods using,

```const Wallet = new inblox.InbloxWallet();```


> Generate New Wallet

This method is used to generate a new Ethereum wallet.

```const newWallet = Wallet.createWallet();```


> Import Wallet From Mnemonic

This method is used to import an Ethereum wallet from it's 12 word mnemonic phrase.

```const wallet = Wallet.importFromMnemonic(mnemonic);```

`mnemonic` - 12 word mnemonic phrase.


> Import Wallet From Keystore JSON

This method is used to import an Ethereum wallet from it's keystore file.

```const wallet = Wallet.importFromEncryptedJson(json, passphrase);```

`json` - Keystore JSON of the wallet.
`passphrase` - Keystore password.


> Generate 2 Random Numbers

This method is used to generate 2 random numbers so that it can be used to validate the user's seed phrase by asking them to provide the word corresponding to that number.

```const wallet = Wallet.generateRandomNumber();```


> Validate Seed Phrase

This method is used to validate the user's seed phrase by asking them to provide the words corresponding to the 2 numbers generated above.

```const wallet = Wallet.validateSeeds({ firstWord, secondWord });```

`firstWord` - Word corresponding to the first number.
`secondWord` - Word corresponding to the second number.


##  Login Via Inblox


> Initialising

To use Login Via Inblox method, initialise the constructor using,

```const loginViaInblox = new inblox.LoginViaInblox(accessToken);```


> Login Via Inblox

This method is used to generate a Bearer token from the Inblox backend systems which can be used to initiate request to access protected resources.

```const token = loginViaInblox.login({ userName, password });```

`userName` - The user's handlename or the email id associated with Inblox platform.
`password` - The Inblox password of the user.


> LogOut

This method is used to logout from the Inblox platform.

```const token = loginViaInblox.logout();```


> **Note - For all the methods, errors are returned under `error` key and success is returned under `response` key.**


## WIP

Want to contribute, we would :heart: that!

We are a Global :earth_asia::earth_africa::earth_americas: team! :muscle:

Write to dev@inblox.me, or follow us on twitter, [https://twitter.com/inblox_me](https://twitter.com/inblox_me)