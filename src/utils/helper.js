const ethers = require('ethers');
const cryptojs = require('crypto-js');
const axios = require('axios');
const Web3 = require('web3');
const Tx = require('ethereumjs-tx').Transaction;
const { AUTH_SERVICE_URL, RELAYER_SERVICE_URL, INFURA_KEY } = require('../config');
const { WRONG_PASSWORD, INVALID_MNEMONIC, HANDLENAME_REGISTRATION_SUCCESS } = require('../constants/response');

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

async function postRequestWithAccessToken({
  params, url, authToken, accessToken,
}) {
  try {
    const response = await axios({
      url,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
        accessToken,
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

async function getAccessToken({ params, authToken, scope }) {
  try {
    const response = await axios({
      url: `${AUTH_SERVICE_URL}/auth/generate-token/?scope=${scope}`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: params,
    });

    return { response: response.data.data };
  } catch (error) {
    return { error: error.response.data.details[0] };
  }
}

async function sendTransaction(payload) {
  try {
    const { privateKey, rawTx } = payload;
    const web3 = await new Web3(new Web3.providers.HttpProvider(`https://ropsten.infura.io/v3/${INFURA_KEY}`));

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

async function deleteRequest({ url, accessToken, authToken }) {
  try {
    const response = await axios({
      url,
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authToken}`,
        accessToken,
      },
    });

    return { response: response.data.data };
  } catch (error) {
    return { error: error.response.data.details[0] };
  }
}

async function relayTransaction({ publicAddress, privateKey, authToken }) {
  const url = `${RELAYER_SERVICE_URL}/set-handlename`;

  const web3 = await new Web3(new Web3.providers.HttpProvider(`https://ropsten.infura.io/v3/${INFURA_KEY}`));

  const accountObject = web3.eth.accounts.privateKeyToAccount(privateKey);
  const signedData = accountObject.sign(publicAddress, privateKey);

  const params = {
    userAdd: publicAddress,
    signedData,
  };

  const { error } = await postRequest({ params, url, authToken });

  if (error) {
    return { error };
  }

  return { response: HANDLENAME_REGISTRATION_SUCCESS };
}

module.exports = {
  getRequestWithAccessToken,
  postRequestForLoginViaInblox,
  postRequestWithAccessToken,
  getAccessToken,
  sendTransaction,
  encryptKey,
  decryptKey,
  validatePassword,
  updatePasswordAndPrivateKey,
  extractPrivateKey,
  verifyPublicAddress,
  deleteRequest,
  relayTransaction,
};
