/* eslint-disable class-methods-use-this */
const { Wallet } = require('ethers');

const {
  getRequestWithAccessToken,
  postRequest,
  getAccessToken,
  sendTransaction,
  encryptKey,
  decryptKey,
  validatePassword,
  updatePasswordAndPrivateKey,
  extractPrivateKey,
  verifyPublicAddress,
} = require('./utils/helper');

let seeds;
let firstNumber;
let secondNumber;

const { AUTH_SERVICE_URL } = require('./config');

class PBTS {
  constructor(authToken) {
    this.authToken = authToken;
  }

  async createWallet() {
    const wallet = Wallet.createRandom();

    const seedString = wallet.mnemonic;

    seeds = seedString.split(' ');

    return {
      response: { wallet },
    };
  }

  async importFromMnemonic(mnemonic) {
    try {
      const wallet = Wallet.fromMnemonic(mnemonic);

      return {
        response: { wallet },
      };
    } catch (error) {
      return { error: 'Invalid Mnemonic.' };
    }
  }

  async importFromEncryptedJson(jsonData, password) {
    const json = JSON.stringify(jsonData);

    try {
      const wallet = await Wallet.fromEncryptedJson(json, password);

      return {
        response: { wallet },
      };
    } catch (error) {
      return { error: 'Wrong password.' };
    }
  }

  async generateRandomNumber() {
    firstNumber = Math.floor(Math.random() * 11 + 1);
    secondNumber = Math.floor(Math.random() * 11 + 1);

    while (secondNumber === firstNumber) {
      secondNumber = Math.floor(Math.random() * 11 + 1);
    }

    return { response: { firstNumber, secondNumber } };
  }

  async validateSeeds({ firstWord, secondWord }) {
    if (firstWord === seeds[firstNumber - 1] && secondWord === seeds[secondNumber - 1]) {
      return { response: true };
    }

    return { response: false };
  }

  async storeKey({ privateKey, password }) {
    const { error } = await validatePassword({ password, authToken: this.authToken });

    if (error) {
      return { error };
    }

    const encryptedPrivateKey = await encryptKey({ privateKey, password });

    const url = `${AUTH_SERVICE_URL}/auth/private-key`;
    const { response, error: err } = await postRequest({
      params: { encryptedPrivateKey }, url, authToken: this.authToken,
    });

    if (err) {
      return { error: err };
    }

    return { response };
  }

  async getKey({ password }) {
    const { error } = await validatePassword({ password, authToken: this.authToken });

    if (error) {
      return { error };
    }

    const { error: err, response: accessToken } = await getAccessToken({ params: { password }, authToken: this.authToken });

    if (err) {
      return { error: err };
    }

    const { data } = await getRequestWithAccessToken({ url: `${AUTH_SERVICE_URL}/auth/private-key`, authToken: this.authToken, accessToken });

    if (data) {
      return { response: data.data.encryptedPrivateKey };
    }

    return { error: 'Error occured. Please try again.' };
  }

  async decrypt(encryptedPrivateKey, password) {
    const { error, privateKey } = await decryptKey({ encryptedPrivateKey, password });

    if (error) {
      return { error };
    }

    return { response: privateKey };
  }

  async signKey({
    privateKey, infuraKey, rpcUrl, rawTx,
  }) {
    const { response, error } = await sendTransaction({
      privateKey, rawTx, infuraKey, rpcUrl,
    });

    if (error) {
      return { error };
    }

    return { response };
  }

  async changePassword({
    oldPassword, newPassword, confirmPassword,
  }) {
    const { error } = await validatePassword({ password: oldPassword, authToken: this.authToken });

    if (error) {
      return { error };
    } if (newPassword !== confirmPassword) {
      return { error: 'New password and confirm password should match.' };
    }

    const { error: getKeyError, response } = await this.getKey({ password: oldPassword });

    if (getKeyError) {
      return { error: getKeyError };
    }

    const { error: decryptError, privateKey } = await decryptKey({ encryptedPrivateKey: response, password: oldPassword });

    if (decryptError) {
      return { error: decryptError };
    }

    const newEncryptedPrivateKey = await encryptKey({ privateKey, password: newPassword });

    const { error: err } = await updatePasswordAndPrivateKey({
      password: newPassword,
      encryptedPrivateKey: newEncryptedPrivateKey,
      authToken: this.authToken,
    });

    if (err) {
      return { error: err };
    }

    return { response: 'Password changed and private key has been encrypted with new password and stored successfully.' };
  }

  async resetPassword({
    privateKey, seedPhrase, encryptedJson, walletPassword, newPassword,
  }) {
    const { error, response } = await extractPrivateKey({
      privateKey, seedPhrase, encryptedJson, password: walletPassword,
    });

    if (error) {
      return { error };
    }

    const { error: err } = await verifyPublicAddress({ address: response.publicAddress, authToken: this.authToken });

    if (err) {
      return { error: err };
    }

    const newEncryptedPrivateKey = await encryptKey({ privateKey, password: newPassword });

    const { error: errors } = await updatePasswordAndPrivateKey({
      password: newPassword,
      encryptedPrivateKey: newEncryptedPrivateKey,
      authToken: this.authToken,
    });

    if (err) {
      return { error: errors };
    }

    return { response: 'Password changed and private key has been encrypted with new password and stored successfully.' };
  }
}

module.exports = { PBTS };