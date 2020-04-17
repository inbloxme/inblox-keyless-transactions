const cryptojs = require('crypto-js');

const { getRequest, postRequest, generateToken, sendTransaction } = require('./utils/helper')
const { AUTH_SERVICE_URL } = require('./config')

class PBTS {
    constructor(authToken) {
        this.authToken = authToken;
    }
    
    async encryptedAndSavePrivateKey(payload) {
        const { handlename, password, privateKey } = payload;

        var encryptedPrivateKey = cryptojs.AES.encrypt(privateKey, password)
        const encryptedPrivateKeyString = encryptedPrivateKey.toString();

        const params = { encryptedPrivateKey: encryptedPrivateKeyString };

        const { response: accessToken, error } = await generateToken({ handlename, password, authToken: this.authToken });

        if (error) {
            return error;
        }

        const { response } = await postRequest({ params, url: `${AUTH_SERVICE_URL}/auth/private-key`, authToken: this.authToken, accessToken });
        
        if (response) {
            return response;
        }
        return "There has been an issue. Pleaser try again later."
    }

    async decryptAndSignTransaction(payload) {
        const { password, handlename, rawTx, infuraKey, rpcUrl } = payload;

        const { response: accessToken, error } = await generateToken({ handlename, password, authToken: this.authToken });

        if (error) {
            return error;
        }

        const { data } = await getRequest({ url: `${AUTH_SERVICE_URL}/auth/private-key`, authToken: this.authToken, accessToken })

        if (data) {
            var bytes = cryptojs.AES.decrypt(data.data.encryptedPrivateKey, password);
            var privateKey = bytes.toString(cryptojs.enc.Utf8);

            const { response, error } = await sendTransaction({ privateKey, rawTx, infuraKey, rpcUrl });

            if (error) {
                return error;
            }

            return response;
        }
        return "Error occured. Please try again."
    }
}

module.exports = PBTS;