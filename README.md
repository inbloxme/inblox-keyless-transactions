# Password Based Transaction Signing

## How to use

Install the package by running the command,

```npm install @inbloxme/password-based-tx-sign```

Import the package into your project using,

```const InbloxTxSign = require('@inbloxme/password-based-tx-sign');```

Initialise the constructor using,

```const txSign = new PBTS(authenticationToken);```

To encrypt the private key using the password and store it, use the function,

```const encryptPrivateKey = txSign.encryptedAndSavePrivateKey({ handlename, password, privateKey });```

`handlename` - The Inblox Handlename of the user.
`password` - The Inblox password of the user. This password is used to encrypt the private key.
`privateKey` - The private key to be encrypted and stored in the database.

This will encrypt the private key using the password and will store it in the database.

To retrieve the private key and decrypt it at the client side,

```const decryptedPrivateKey = txSign.decryptAndSignTransaction({ password, handlename, rawTx, infuraKey, rpcUrl });```

`password` - The Inblox password of the user. This will be used to decrypt the encrypted private key at the client side.
`handlename` - The Inblox Handlename of the user.
`rawTx` - The transaction object. This will consist of `from`, `to`, `value`, `nonce`, `gas` and `gasPrice`.
`infuraKey` or `rpcUrl` - This is used to initialise the web3 provider which is used to send the signed transaction to the blockchain.

This method will authenticate the password, retrieve the private key, decrypt it using the password, sign the transaction using the decrypted private key and send the transaction to the blockchain.