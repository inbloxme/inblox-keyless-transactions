const cryptojs = require('crypto-js');
const axios = require('axios');
const Web3 = require('web3');
const Tx = require('ethereumjs-tx').Transaction;
const { AUTH_SERVICE_URL } = require('../config');

async function getRequest({ url, authToken, accessToken }) {
  try {
    const response = await axios({
      url,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authToken}`,
        AccessToken: accessToken,
      },
    });

    return response;
  } catch (error) {
    return { error };
  }
}

async function postRequest({ params, url, authToken }) {
  try {
    const response = await axios({
      url,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: params,
    });

    return { response: response.data };
  } catch (error) {
    return { error: error.response.data.details };
  }
}

async function getAccessToken({ params, authToken }) {
  try {
    const response = await axios({
      url: `${AUTH_SERVICE_URL}/auth/transaction-token`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: params,
    });

    return { response: response.data.data };
  } catch (error) {
    return { error: error.response.data.details };
  }
}

async function sendTransaction(payload) {
  try {
    const {
      privateKey, rawTx, infuraKey, rpcUrl,
    } = payload;
    let web3;

    if (infuraKey) {
      web3 = await new Web3(new Web3.providers.HttpProvider(`https://ropsten.infura.io/v3/${infuraKey}`));
    } else {
      web3 = await new Web3(new Web3.providers.HttpProvider(rpcUrl));
    }

    const pkey = Buffer.from(privateKey, 'hex');
    const tx = new Tx(rawTx, { chain: 'ropsten', hardfork: 'petersburg' });

    tx.sign(pkey);
    const stringTx = `0x${tx.serialize().toString('hex')}`;

    const response = await web3.eth.sendSignedTransaction(stringTx);

    return { response };
  } catch (error) {
    return { error };
  }
}

async function encryptKey({ privateKey, password }) {
  const encryptedPrivateKey = cryptojs.AES.encrypt(privateKey, password);
  const encryptedPrivateKeyString = encryptedPrivateKey.toString();

  return encryptedPrivateKeyString;
}

async function decryptKey({ encryptedPrivateKey, password }) {
  const bytes = cryptojs.AES.decrypt(encryptedPrivateKey, password);
  const privateKey = bytes.toString(cryptojs.enc.Utf8);

  if (privateKey === '') {
    return { error: 'Wrong password.' };
  }

  return { privateKey };
}

async function validatePassword({ password, authToken }) {
  const url = `${AUTH_SERVICE_URL}/auth/authenticate-password`;
  const { response, error } = await postRequest({ params: { password }, url, authToken });

  if (error) {
    return { error: error[0] };
  }

  return { response };
}

async function updatePasswordAndPrivateKey({ password, encryptedPrivateKey, authToken }) {
  const url = `${AUTH_SERVICE_URL}/auth/update-credentials`;
  const { response, error } = await postRequest({ params: { password, encryptedPrivateKey }, url, authToken });

  if (error) {
    return { error: error[0] };
  }

  return { response };
}

module.exports = {
  getRequest, postRequest, getAccessToken, sendTransaction, encryptKey, decryptKey, validatePassword, updatePasswordAndPrivateKey,
};
