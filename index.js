const {
  getRequest, postRequest, getAccessToken, sendTransaction, encryptKey, decryptKey,
} = require('./utils/helper');
const { AUTH_SERVICE_URL } = require('./config');

class PBTS {
  constructor(authToken) {
    this.authToken = authToken;
  }

  async storeKey({ privateKey, password }) {
    const encryptedPrivateKey = await encryptKey({ privateKey, password });

    const url = `${AUTH_SERVICE_URL}/auth/private-key`;
    const { response, error } = await postRequest({ params: { encryptedPrivateKey }, url, authToken: this.authToken });

    if (error) {
      return { error };
    }

    return { response };
  }

  async getKey({ handlename, password }) {
    const params = { handlename, password };

    const { error, response: accessToken } = await getAccessToken({ params, authToken: this.authToken });

    if (error) {
      return { error };
    }

    const { data } = await getRequest({ url: `${AUTH_SERVICE_URL}/auth/private-key`, authToken: this.authToken, accessToken });

    if (data) {
      return { encryptedPrivateKey: data.data.encryptedPrivateKey };
    }

    return { error: 'Error occured. Please try again.' };
  }

  // eslint-disable-next-line class-methods-use-this
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
    oldPassword, newPassword, confirmPassword, handlename,
  }) {
    const { error: getKeyError, encryptedPrivateKey } = await this.getKey({ handlename, password: oldPassword });

    if (getKeyError) {
      return { error: getKeyError };
    }

    const { error: decryptError, privateKey } = await decryptKey({ encryptedPrivateKey, password: oldPassword });

    if (decryptError) {
      return { error: decryptError };
    }

    const newEncryptedPrivateKey = await encryptKey({ privateKey, password: newPassword });

    const params = {
      oldPassword, newPassword, confirmPassword, encryptedPrivateKey: newEncryptedPrivateKey,
    };
    const url = `${AUTH_SERVICE_URL}/auth/update-private-key`;

    const { error } = await postRequest({ params, url, authToken: this.authToken });

    if (error) {
      return { error };
    }

    return { response: 'Password changed and private key has been encrypted with new password and stored successfully.' };
  }
}

module.exports = PBTS;
