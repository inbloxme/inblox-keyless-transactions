const ethers = require('ethers');
const cryptojs = require('crypto-js');
const axios = require('axios');
const Web3 = require('web3');
const Tx = require('ethereumjs-tx').Transaction;
const { AUTH_SERVICE_URL } = require('../config');
const { WRONG_PASSWORD, INVALID_MNEMONIC } = require('../constants/response');

async function getRequestWithAccessToken({ url, authToken, accessToken }) {
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

async function getRequest({ url, authToken }) {
  try {
    const response = await axios({
      url,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authToken}`,
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

async function postRequestForLoginViaInblox({ params, url, accessToken }) {
  try {
    const response = await axios({
      url,
      method: 'POST',
      headers: {
        access_token: `${accessToken}`,
      },
      data: params,
    });

    return { response: response.data.data };
  } catch (error) {
    return { error: error.response.data.details[0] };
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
    return { error: error.response };
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

  return { response: encryptedPrivateKeyString };
}

async function decryptKey({ encryptedPrivateKey, password }) {
  const bytes = cryptojs.AES.decrypt(encryptedPrivateKey, password);
  const privateKey = bytes.toString(cryptojs.enc.Utf8);

  if (privateKey === '') {
    return { error: WRONG_PASSWORD };
  }

  return { response: privateKey };
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

async function extractPrivateKey({
  privateKey, seedPhrase, encryptedJson, password,
}) {
  if (privateKey) {
    const { address } = new ethers.utils.SigningKey(privateKey);

    return { response: { publicAddress: address, privateKey } };
  }

  if (seedPhrase) {
    try {
      const wallet = ethers.Wallet.fromMnemonic(seedPhrase);
      const { privateKey: pkey, address } = wallet;

      return {
        response: {
          publicAddress: address, privateKey: pkey,
        },
      };
    } catch (error) {
      return { error: INVALID_MNEMONIC };
    }
  }

  const json = JSON.stringify(encryptedJson);

  try {
    const wallet = ethers.Wallet.fromEncryptedJson(json, password);

    const { address, privateKey: pKey } = wallet;

    return {
      response: { publicAddress: address, privateKey: pKey },
    };
  } catch (error) {
    return { error: WRONG_PASSWORD };
  }
}

async function verifyPublicAddress({ address, authToken }) {
  const url = `${AUTH_SERVICE_URL}/auth/public-address/${address}`;

  const { error, data } = await getRequest({ url, authToken });

  if (error) {
    return { error: error.response.data.details[0] };
  }

  return { response: data };
}

async function getKey({ password, authToken }) {
  const { error: VALIDATE_PASSWORD_ERROR } = await validatePassword({ password, authToken });

  if (VALIDATE_PASSWORD_ERROR) {
    return { error: VALIDATE_PASSWORD_ERROR };
  }

  const { error: GET_ACCESS_TOKEN_ERROR, response: accessToken } = await getAccessToken({ params: { password }, authToken });

  if (GET_ACCESS_TOKEN_ERROR) {
    return { error: GET_ACCESS_TOKEN_ERROR };
  }

  const { data, error: GET_ENCRYPTED_PRIVATE_KEY } = await getRequestWithAccessToken({
    url: `${AUTH_SERVICE_URL}/auth/private-key`,
    authToken,
    accessToken,
  });

  if (data) {
    return { response: data.data.encryptedPrivateKey };
  }

  return { error: GET_ENCRYPTED_PRIVATE_KEY };
}

module.exports = {
  getRequestWithAccessToken,
  postRequest,
  postRequestForLoginViaInblox,
  getAccessToken,
  sendTransaction,
  encryptKey,
  decryptKey,
  validatePassword,
  updatePasswordAndPrivateKey,
  extractPrivateKey,
  verifyPublicAddress,
  getKey,
};
