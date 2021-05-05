/* eslint-disable no-underscore-dangle */
/* eslint-disable no-return-assign */
const ethers = require('ethers');
const cryptojs = require('crypto-js');
const axios = require('axios');
const Web3 = require('web3');
const Tx = require('ethereumjs-tx').Transaction;
const cryptoRandomString = require('get-random-values');
const crypto = require('crypto');
const jwtDecode = require('jwt-decode');

const {
  AUTH_SERVICE_URL_PROD,
  AUTH_SERVICE_URL_DEV,
  AUTH_SERVICE_URL_TEST,
  RELAYER_SERVICE_URL_PROD,
  RELAYER_SERVICE_URL_DEV,
  RELAYER_SERVICE_URL_TEST,
  RPC_URL_ROPSTEN,
  RPC_URL_RINKEBY,
  RPC_URL_KOVAN,
  RPC_URL_GOERLI,
  RPC_URL_MAINNET,
  MATIC_TESTNET_RPC,
} = require('../config');
const { WRONG_PASSWORD, INVALID_MNEMONIC } = require('../constants/response');

async function _generatePDKeyHash(safleId, password) {
  const passwordDerivedKey = crypto.pbkdf2Sync(safleId, password, 10000, 32, 'sha512');

  const passwordDerivedKeyHash = crypto.createHash('sha512', passwordDerivedKey);
  const passwordDerivedKeyHashHex = passwordDerivedKeyHash._options.toString('hex');

  return passwordDerivedKeyHashHex;
}

async function getBaseUrl(env) {
  if (env === 'test') {
    return { auth: AUTH_SERVICE_URL_TEST, relayer: RELAYER_SERVICE_URL_TEST };
  } if (env === 'dev') {
    return { auth: AUTH_SERVICE_URL_DEV, relayer: RELAYER_SERVICE_URL_DEV };
  }

  return { auth: AUTH_SERVICE_URL_PROD, relayer: RELAYER_SERVICE_URL_PROD };
}

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
    return { error: error.response.data };
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

async function postRequestForLoginViaSafle({ params, url, accessToken }) {
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
    return { error: error.response.data.details };
  }
}

async function getAccessToken({
  params, authToken, scope, env,
}) {
  try {
    const { auth: AUTH_SERVICE_URL } = await getBaseUrl(env);
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
    return { error: error.response.data.details };
  }
}

async function sendTransaction(payload) {
  try {
    const { privateKey, rawTx, network } = payload;

    let web3;

    if (network === 'mainnet') {
      web3 = await new Web3(new Web3.providers.HttpProvider(RPC_URL_MAINNET));
    } else if (network === 'ropsten') {
      web3 = await new Web3(new Web3.providers.HttpProvider(RPC_URL_ROPSTEN));
    } else if (network === 'rinkeby') {
      web3 = await new Web3(new Web3.providers.HttpProvider(RPC_URL_RINKEBY));
    } else if (network === 'kovan') {
      web3 = await new Web3(new Web3.providers.HttpProvider(RPC_URL_KOVAN));
    } else {
      web3 = await new Web3(new Web3.providers.HttpProvider(RPC_URL_GOERLI));
    }

    const pkey = Buffer.from(privateKey, 'hex');
    const tx = new Tx(rawTx, { chain: network });

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

async function decryptKey(encryptedPrivateKey, password) {
  const bytes = cryptojs.AES.decrypt(encryptedPrivateKey, password);
  const privateKey = bytes.toString(cryptojs.enc.Utf8);

  if (privateKey === '') {
    return { error: WRONG_PASSWORD };
  }

  return { response: privateKey };
}

async function _validatePassword({ password, authToken, env }) {
  const { safleId } = jwtDecode(authToken);

  const PDKeyHash = await _generatePDKeyHash(safleId, password);

  const { auth: AUTH_SERVICE_URL } = await getBaseUrl(env);
  const url = `${AUTH_SERVICE_URL}/auth/authenticate-password`;
  const { error } = await postRequest({ params: { PDKeyHash }, url, authToken });

  if (error) {
    return { error };
  }

  return { response: 'Password validated successfully.' };
}

async function updatePasswordAndPrivateKey({
  password, encryptedPrivateKey, authToken, env,
}) {
  const { auth: AUTH_SERVICE_URL } = await getBaseUrl(env);

  const url = `${AUTH_SERVICE_URL}/auth/update-credentials`;
  const { response, error } = await postRequest({ params: { password, encryptedPrivateKey }, url, authToken });

  if (error) {
    return { error };
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

async function verifyPublicAddress({ address, authToken, env }) {
  const { auth: AUTH_SERVICE_URL } = await getBaseUrl(env);

  const url = `${AUTH_SERVICE_URL}/auth/public-address/${address}`;

  const { error, data } = await getRequest({ url, authToken });

  if (error) {
    return { error: error.response.data.details };
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
    return { error: error.response.data.details };
  }
}

async function relayTransaction({
  publicAddress, privateKey, authToken, env,
}) {
  const { relayer: RELAYER_SERVICE_URL } = await getBaseUrl(env);

  const url = `${RELAYER_SERVICE_URL}/set-safleid`;

  const web3 = await new Web3(new Web3.providers.HttpProvider(MATIC_TESTNET_RPC));

  const accountObject = web3.eth.accounts.privateKeyToAccount(privateKey);
  const signedData = accountObject.sign(publicAddress, privateKey);

  const params = {
    userAdd: publicAddress,
    signedData,
  };

  const { error, response } = await postRequest({ params, url, authToken });

  if (error) {
    return { error };
  }

  return { response };
}

async function generateEncryptionKey() {
  const bytes = new Uint8Array(64);
  const encryptionKey = cryptoRandomString(bytes);

  return encryptionKey;
}

module.exports = {
  getRequestWithAccessToken,
  postRequestForLoginViaSafle,
  postRequestWithAccessToken,
  getAccessToken,
  sendTransaction,
  encryptKey,
  decryptKey,
  _validatePassword,
  updatePasswordAndPrivateKey,
  extractPrivateKey,
  verifyPublicAddress,
  deleteRequest,
  relayTransaction,
  getBaseUrl,
  generateEncryptionKey,
  _generatePDKeyHash,
};
