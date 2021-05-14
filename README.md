
# Keyless Transactions - GetSafle

  

This package enables usage of SafleId infrastructure as a keyless signing mechanism.


> **Disclaimer - This is WIP, and release in alpha.**

## Keyless Transactions

Talking about user adoption, the bottleneck faced by most of the dApps is the user onboarding flow. The user needs to have a wallet, generating and operating a wallet is cumbersome for a new crypto user.

Keyless transactions abstracts the private key from the user and allows the user to sign transaction in an easy way while having the same level of security as before.

SafleId Keyless Transactions allow users to sign transactions via,

1. Password
2. Biometrics
  A. Fingerprint
  B. FaceID
3. Device based virtual Hardware Security Module

We have made **password based transaction signing** available for anyone to use, build upon and replicate.

This documentation focuses more on that, more coming soon. If you want to know more and enagage with development, you can  email at the address in footnotes.

Happy #BUIDLing

## Design Principles

 1. **Private Key Abstraction** - SafleId infrastructure never have the visibility of the private key, it's encrypted on the client with the user password(unsalted & unencrypted) and sent to the virtual Hardware Security Module for safe storage.
 2. **Password Invisibility** - User password is never exposed in plain text to any of the systems apart from the client.
 3. **Non-Custodial Relationship** - User Private Key is always exportable and encrypted version can be deleted (redundant) from the SafleId infrastructure.
 4. **App Agnostic** - Any application without getting an API key can access SafleId service, password based transaction signing requires special access which can be requested for. (In Alpha Testing).

## Installation and Usage


> Installation

Install the package by running the command,

```npm install @getsafle/keyless-transactions-private```


Import the package into your project using,

```const safle = require('@getsafle/keyless-transactions-private');```


##  Password Based Transaction Sign


> Initialising

Initialise the constructor using,

```const PBTS = new safle.PBTS(authenticationToken);```


> Encryption & Storage

This method is used to store the private key after encrypting it with the user's password.
The password of the user gets validated first before encrypting the private key and storing it in the GetSafle Key Management System (KMS).

```const StoreKey = PBTS.storeKey({ privateKey, password });```

`privateKey` - The private key to be encrypted and stored in the GetSafle Key Management System.
`password` - The SafleId password of the user. This password is used to encrypt the private key.


> Get Encrypted Private Key

This method is used to get the encrypted private key of the user from GetSafle Key Management System.

```const encryptedPrivateKey = PBTS.getEncryptedPrivateKey({ password });```

`password` - The password of the user.


> Change Password

This method is used to change the existing password of a user. The old password of the user will get validated and it will be used to retrieve the encrypted private key of the user and decrypt it. Then the private key will be encrypted using the new password and it will get sent to the GetSafle KMS.

```const changePassword = PBTS.changePassword({ encryptedPrivateKey, oldPassword, newPassword, confirmPassword });```

`encryptedPrivateKey` - Encrypted private key of the user which is obtained using the method `getEncryptedPrivateKey`.
`oldPassword` - The old password of the user.
`newPassword` - The new password of the user.
`confirmPassword` - Confirm new password.


> Reset Password

This method is used to reset the password incase the user forgets thir existing password. The user will have to prove their ownership for their private key before re-encrypting their private key with their new password. This can be done by providing either their private key directly or the 12 word seed phrase or their keystore file with its password. The private key and public address will get extracted which will be used to verify against the public address stored with the Safle systems.

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

`password` - The SafleId password of the user.
`rawTx` - The raw transaction object.

The `rawTx` object contains,
`to` - Address to send the transaction to.
`from` - Address of the sender.
`gasPrice` - Price of gas in wei.
`gasLimit` - Gas Limit for the transaction.
`nonce` - Nonce of the sender address.
`value` - Amount to be sent in the transaction.
`data` - Data to be passed in the transaction. Can be a contract call data.


> Delete Encrypted Private Key

This method is used to delete a user's encypted private key from the GetSafle Key Management System after authenticating the user's password.

```const signTx = PBTS.deleteKey({ password });```

`password` - The Safle password of the user.


> Register SafleID

This method is used to register a user's safleId.

```const signTx = PBTS.registerSafleId({ publicAddress, privateKey, password });```

`publicAddress` - Public address of the user.
`privateKey` - The private key of the address.
`password` - The Safle password of the user.


> Generate Encrypted Encryption Key

This method is used to generate an encrypted encryption key.

```const encryptedEncryptionKey = PBTS.encryptEncryptionKey(safleId, password);```

`safleId` - The safleId of the user.
`password` - The Safle password of the user.


> Generate Hashed Password

This method is used to generate the pbkdf2 hash of the password.

```const hashedPassword = PBTS.hashPassword(safleId, password);```

`safleId` - The safleId of the user.
`password` - The Safle password of the user.


> Generate PDKeyHash

This method is used to generate the PDKeyHash from the user's safleId and password.

```const PDKeyHash = PBTS.generatePDKeyHash(safleId, password);```

`safleId` - The safleId of the user.
`password` - The Safle password of the user.


##  Wallet Generation


> Initialising

Initialise the constructor for Wallet generation and wallet import methods using,

```const Wallet = new safle.SafleWallet();```


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


##  Login Via Safle


> Initialising

To use Login Via Safle method, initialise the constructor using,

```const loginViaSafle = new safle.LoginViaSafle(accessToken);```


> Login Via Safle

This method is used to generate a Bearer token from the GetSafle backend systems which can be used to initiate request to access protected resources.

```const token = loginViaSafle.login({ userName, password });```

`userName` - The user's safleId or the email id associated with Safle platform.
`password` - The SafleId password of the user.


> LogOut

This method is used to logout from the GetSafle platform.

```const token = loginViaSafle.logout();```

##  Vault Methods


> Initialising

To use the Vault methods, initialise the constructor using,

```const vault = new safle.Vault(network, env);```

`network` - The web3 network to be used.
`env` - The safle services evnironment to be used.


> Validate Password

This method is used to validate the safle password of the user.

```const isValid = vault.validatePassword(password, authToken);```

`authToken` - The jwt authentication token associated with the user.
`password` - The SafleId password of the user.


> Generate Vault

This method is used to generate a vault for the user with 1 Ethereum account inside the keyring. The keyring is encrypted with the user's safle password to get the vault.

```const vault = vault.generateVault(password, authToken);```

`authToken` - The jwt authentication token associated with the user.
`password` - The SafleId password of the user.


> Retrieve Vault

This method is used to retrieve the vault stored on the cloud.

```const vault = vault.retrieveVault(password, persistLocation, authToken);```

`authToken` - The jwt authentication token associated with the user.
`password` - The SafleId password of the user.
`persistLocation` - The location where the vault is persisted. The values can be `mobile`, `cloud` or `browser`.


> Add Account

This method is used to retrieve the vault stored on the cloud. Returns the new vault string with an additional account added.

```const vault = vault.addAccount(vault, password, authToken);```

`authToken` - The jwt authentication token associated with the user.
`password` - The SafleId password of the user.
`vault` - The vault instance in string.


> Persist Vault

This method is used to persist the vault onto the cloud or browser extension data or on mobile device.

```const persist = vault.persistVault(vault, password, persistType, persistLocation, authToken);```

`authToken` - The jwt authentication token associated with the user.
`password` - The SafleId password of the user.
`vault` - The vault instance in string.
`persistType` - The request type for persistence. To persist a vault for the first time, `persistType` value would be `POST`. For persistence after updation, the `persistType` value would be `PATCH`.
`persistLocation` - The location for the vault to perist. Values can be `cloud`, `mobile` or `browser`.


> Generate Vault & Persist

This method is used to generate and persist the vault onto the cloud or browser extension data or on mobile device.

```const vault = vault.generateVaultAndPersist(password, persistLocation, authToken);```

`authToken` - The jwt authentication token associated with the user.
`password` - The SafleId password of the user.
`persistLocation` - The location for the vault to perist. Values can be `cloud`, `mobile` or `browser`.


> Add Account & Persist

This method is used to add a new account to the keyring and persist the vault onto the cloud or browser extension data or on mobile device.

```const vault = vault.addAccountAndPersist(vault, password, persistLocation, authToken);```

`authToken` - The jwt authentication token associated with the user.
`password` - The SafleId password of the user.
`vault` - The vault instance in string.
`persistLocation` - The location for the vault to perist. Values can be `cloud`, `mobile` or `browser`.


> Delete Vault

This method is used to delete the vault instance from the cloud.

```const deleteVault = vault.deleteVault(password, authToken);```

`authToken` - The jwt authentication token associated with the user.
`password` - The SafleId password of the user.


> Get Accounts

This method is used to get the list of accounts from the keyring inside the vault.

```const accounts = vault.getAccounts();```


> Export Private Key

This method is used to get the private key of an account from the keyring.

```const privateKey = vault.exportPrivateKey(vault, address, password, authToken);```

`authToken` - The jwt authentication token associated with the user.
`password` - The SafleId password of the user.
`vault` - The vault instance in string.
`address` - The address for which the private key has to be returned.


> Export Seeds

This method is used to get the 12 word mnemonic seeds from which the keyring is generated.

```const seeds = vault.exportSeeds(vault, password, authToken);```

`authToken` - The jwt authentication token associated with the user.
`password` - The SafleId password of the user.
`vault` - The vault instance in string.


> Sign Message

This method is used to sign a message from a given address.

```const signedMessage = vault.signMessage(address, data);```

`address` - The address of the account from which the message is to be signed.
`data` - The data to be signed.


> Sign Transaction

This method is used to sign a transaction from the private key of the `from` address.

```const signedTransaction = vault.signTransaction(rawTx, password, authToken);```

`authToken` - The jwt authentication token associated with the user.
`password` - The SafleId password of the user.
`rawTx` - The rawTx to be signed. The rawTx object should contain `to` and `from`. `value`, `data`, `nonce`, `gasPrice` and `gasLimit` are optional.


> **Note - For all the methods, errors are returned under `error` key and success is returned under `response` key.**


## WIP

Want to contribute, we would :heart: that!

We are a Global :earth_asia::earth_africa::earth_americas: team! :muscle:

Write to dev@getsafle.com, or follow us on twitter, [https://twitter.com/getsafle](https://twitter.com/getsafle)
