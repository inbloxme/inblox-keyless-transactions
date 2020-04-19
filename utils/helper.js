const axios = require('axios');
const Web3 = require('web3');
const Tx = require('ethereumjs-tx').Transaction;

const { AUTH_SERVICE_URL } = require('../config')

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
};

async function postRequest({ params, url, authToken, accessToken }) {
    try {
        const response = await axios({
            url,
            method: 'POST',
            headers: {
                Authorization: `Bearer ${authToken}`,
                AccessToken: accessToken,
            },
            data: params
        });

        return { response: response.data };
    } catch (error) {
        return { error: error.response.data.details[0] };
    }
};

async function generateTokenPostRequest({ params, url, authToken }) {
    try {
        const response = await axios({
            url,
            method: 'POST',
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
            data: params
        });

        return { response: response.data };
    } catch (error) {
        return { error: error.response.data.details[0] };
    }
};

async function generateToken(payload) {
    const { handlename, password, authToken } = payload;

    const params = { handlename, password };
    const { response, error } = await generateTokenPostRequest({ params, url: `${AUTH_SERVICE_URL}/auth/transaction-token`, authToken });

    if (error) {
        return { error };
    }

    const { data } = response;
    return { response: data };
}

async function sendTransaction(payload) {
    try {
        const { privateKey, rawTx, infuraKey, rpcUrl } = payload;
        let web3;

        if (infuraKey) {
            web3 = await new Web3(new Web3.providers.HttpProvider(`https://ropsten.infura.io/v3/${infuraKey}`));
        }
        else {
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

module.exports = { getRequest, postRequest, generateToken, sendTransaction }