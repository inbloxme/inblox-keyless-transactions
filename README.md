# Password Based Transaction Signing

## How to use

Install the package by running the command,

```npm install @inbloxme/password-based-tx-sign```

Import the package into your project using,

```const InbloxTxSign = require('@inbloxme/password-based-tx-sign');```

Initialise the constructor using,

```const txSign = new InbloxTxSign();```

To encrypt the private key using the password and store it, use the function,

```const encryptPrivateKey = txSign.encrypt(privateKey, password);```

This will encrypt the private key using the password and will store it in the database.

To retrieve the private key and decrypt it at the client side,

```const decryptedPrivateKey = txSign.decrypt(password);```

This will authenticate the password, retrieve the private key and decrypt it.

Now, this decrypted private key can be used to sign trasnactions.
