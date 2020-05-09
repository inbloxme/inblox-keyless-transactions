const cryptojs = require('crypto-js');

const { getRequest, postRequest, getAccessToken, sendTransaction } = require('./utils/helper')
const { AUTH_SERVICE_URL } = require('./config')

async function AccessToken({ handlename, password, authToken }) {
    const params = { handlename, password }
    const { response, error } = await getAccessToken({ params, authToken });

    if (error) {
        return { error };
    }

    return { accessToken: response }
}

class PBTS {
    constructor(authToken) {
        this.authToken = authToken;
    }

    async encryptKey({ privateKey, password }) {
        const encryptedPrivateKey = cryptojs.AES.encrypt(privateKey, password)
        const encryptedPrivateKeyString = encryptedPrivateKey.toString();
        return { encryptedPrivateKeyString };
    }

    async decryptKey({ encryptedPrivateKey, password }) {
        const bytes = cryptojs.AES.decrypt(encryptedPrivateKey, password);
        const privateKey = bytes.toString(cryptojs.enc.Utf8);

        if (privateKey === "") {
            return { error: 'Wrong password.' }
        }
        return { privateKey };
    }

    async getKey() {
        const { data } = await getRequest({ url: `${AUTH_SERVICE_URL}/auth/private-key`, authToken: this.authToken })
        if (data) {
            return { encryptedPrivateKey: data.data.encryptedPrivateKey }
        }
        return { error: "Error occured. Please try again." }
    }

    async postKey({ encryptedPrivateKey, accessToken }) {
        const params = { encryptedPrivateKey };
        const { response } = await postRequest({ params, url: `${AUTH_SERVICE_URL}/auth/private-key`, authToken: this.authToken, accessToken });
        
        if (response) {
            return { response };
        }
        return { error: "There has been an issue. Pleaser try again later." }
    }

    async storeKey({ privateKey, password, handlename }) {
        const { error, accessToken } = await AccessToken({ handlename, password, authToken: this.authToken });

        if (error) {
            return { error };
        }

        const encryptedPrivateKey = await this.encryptKey({ privateKey, password });

        const { response, error: err } = await this.postKey({ encryptedPrivateKey, accessToken });

        if (err) {
            return { err };
        }
        return { response }
    }

    async signKey({ privateKey, infuraKey, rpcUrl, rawTx }) {
        const { response, error } = await sendTransaction({ privateKey, rawTx, infuraKey, rpcUrl });
        
        if (error) {
            return { error };
        }
        return { response };
    }
}

module.exports = PBTS;
