/* eslint-disable class-methods-use-this */
const { Wallet } = require('ethers');

const {
  WRONG_PASSWORD, INVALID_MNEMONIC, PASSWORD_MATCH_ERROR, PASSWORD_CHANGE_SUCCESS,
} = require('./constants/response');
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
      return { error: INVALID_MNEMONIC };
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
      return { error: WRONG_PASSWORD };
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
    const { error: VALIDATE_PASSWORD_ERROR } = await validatePassword({ password, authToken: this.authToken });

    if (VALIDATE_PASSWORD_ERROR) {
      return { VALIDATE_PASSWORD_ERROR };
    }

    const encryptedPrivateKey = await encryptKey({ privateKey, password });

    const url = `${AUTH_SERVICE_URL}/auth/private-key`;
    const { response, error: STORE_KEY_ERROR } = await postRequest({
      params: { encryptedPrivateKey }, url, authToken: this.authToken,
    });

    if (STORE_KEY_ERROR) {
      return { error: STORE_KEY_ERROR };
    }

    return { response };
  }

  async getKey({ password }) {
    const { error: VALIDATE_PASSWORD_ERROR } = await validatePassword({ password, authToken: this.authToken });

    if (VALIDATE_PASSWORD_ERROR) {
      return { error: VALIDATE_PASSWORD_ERROR };
    }

    const { error: GET_ACCESS_TOKEN_ERROR, response: accessToken } = await getAccessToken({ params: { password }, authToken: this.authToken });

    if (GET_ACCESS_TOKEN_ERROR) {
      return { error: GET_ACCESS_TOKEN_ERROR };
    }

    const { data, error: GET_ENCRYPTED_PRIVATE_KEY } = await getRequestWithAccessToken({
      url: `${AUTH_SERVICE_URL}/auth/private-key`,
      authToken: this.authToken,
      accessToken,
    });

    if (data) {
      return { response: data.data.encryptedPrivateKey };
    }

    return { error: GET_ENCRYPTED_PRIVATE_KEY };
  }

  async signKey({
    privateKey, infuraKey, rpcUrl, rawTx,
  }) {
    const { response, error: SEND_TX_ERROR } = await sendTransaction({
      privateKey, rawTx, infuraKey, rpcUrl,
    });

    if (SEND_TX_ERROR) {
      return { error: SEND_TX_ERROR };
    }

    return { response };
  }

  async changePassword({
    oldPassword, newPassword, confirmPassword,
  }) {
    const { error: VALIDATE_PASSWORD_ERROR } = await validatePassword({ password: oldPassword, authToken: this.authToken });

    if (VALIDATE_PASSWORD_ERROR) {
      return { error: VALIDATE_PASSWORD_ERROR };
    } if (newPassword !== confirmPassword) {
      return { error: PASSWORD_MATCH_ERROR };
    }

    const { error: GET_KEY_ERROR, response } = await this.getKey({ password: oldPassword });

    if (GET_KEY_ERROR) {
      return { error: GET_KEY_ERROR };
    }

    const { error: DECRYPT_KEY_ERROR, privateKey } = await decryptKey({ encryptedPrivateKey: response, password: oldPassword });

    if (DECRYPT_KEY_ERROR) {
      return { error: DECRYPT_KEY_ERROR };
    }

    const newEncryptedPrivateKey = await encryptKey({ privateKey, password: newPassword });

    const { error: UPDATE_PASSWORD_ERROR } = await updatePasswordAndPrivateKey({
      password: newPassword,
      encryptedPrivateKey: newEncryptedPrivateKey,
      authToken: this.authToken,
    });

    if (UPDATE_PASSWORD_ERROR) {
      return { error: UPDATE_PASSWORD_ERROR };
    }

    return { response: PASSWORD_CHANGE_SUCCESS };
  }

  async resetPassword({
    privateKey, seedPhrase, encryptedJson, walletPassword, newPassword,
  }) {
    const { error: PRIVATE_KEY_ERROR, response } = await extractPrivateKey({
      privateKey, seedPhrase, encryptedJson, password: walletPassword,
    });

    if (PRIVATE_KEY_ERROR) {
      return { error: PRIVATE_KEY_ERROR };
    }

    const { error: VERIFY_PUBLIC_ADDRESS_ERROR } = await verifyPublicAddress({ address: response.publicAddress, authToken: this.authToken });

    if (VERIFY_PUBLIC_ADDRESS_ERROR) {
      return { error: VERIFY_PUBLIC_ADDRESS_ERROR };
    }

    const newEncryptedPrivateKey = await encryptKey({ privateKey, password: newPassword });

    const { error: UPDATE_PASSWORD_ERROR } = await updatePasswordAndPrivateKey({
      password: newPassword,
      encryptedPrivateKey: newEncryptedPrivateKey,
      authToken: this.authToken,
    });

    if (UPDATE_PASSWORD_ERROR) {
      return { error: UPDATE_PASSWORD_ERROR };
    }

    return { response: PASSWORD_CHANGE_SUCCESS };
  }
}

module.exports = { PBTS };
