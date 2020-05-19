const cryptojs = require('crypto-js');
const { Wallet } = require('ethers');

const {
  getRequest, postRequest, generateToken, sendTransaction,
} = require('./utils/helper');
const { AUTH_SERVICE_URL } = require('./config');

async function createWallet() {
  const wallet = Wallet.createRandom();
  const { privateKey, address, mnemonic } = wallet;

  return {
    publicAddress: address, privateKey, mnemonic, wallet,
  };
}

async function importFromMnemonic(mnemonic) {
  const wallet = Wallet.fromMnemonic(mnemonic);
  const { privateKey, address } = wallet;

  return {
    publicAddress: address, privateKey, mnemonic, wallet,
  };
}

class PBTS {
  constructor(authToken) {
    this.authToken = authToken;
  }

  async encryptedAndSavePrivateKey(payload) {
    const { handlename, password, privateKey } = payload;

    const encryptedPrivateKey = cryptojs.AES.encrypt(privateKey, password);
    const encryptedPrivateKeyString = encryptedPrivateKey.toString();

    const params = { encryptedPrivateKey: encryptedPrivateKeyString };

    const { response: accessToken, error } = await generateToken({ handlename, password, authToken: this.authToken });

    if (error) {
      return error;
    }

    const { response } = await postRequest({
      params, url: `${AUTH_SERVICE_URL}/auth/private-key`, authToken: this.authToken, accessToken,
    });

    if (response) {
      return response;
    }

    return 'There has been an issue. Pleaser try again later.';
  }

  async decryptAndSignTransaction(payload) {
    const {
      password, handlename, rawTx, infuraKey, rpcUrl,
    } = payload;

    const { response: accessToken, error } = await generateToken({ handlename, password, authToken: this.authToken });

    if (error) {
      return error;
    }

    const { data } = await getRequest({ url: `${AUTH_SERVICE_URL}/auth/private-key`, authToken: this.authToken, accessToken });

    if (data) {
      const bytes = cryptojs.AES.decrypt(data.data.encryptedPrivateKey, password);
      const privateKey = bytes.toString(cryptojs.enc.Utf8);

      const { response, error: err } = await sendTransaction({
        privateKey, rawTx, infuraKey, rpcUrl,
      });

      if (err) {
        return err;
      }

      return response;
    }

    return 'Error occured. Please try again.';
  }
}

module.exports = { PBTS, createWallet, importFromMnemonic };
