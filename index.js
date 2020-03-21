const cryptojs = require('crypto-js');
const { getRequest, postRequest } = require('./utils/helper')
const { AUTH_SERVICE_URL } = require('./config')

class PBTS {
    async encrypt(password, privateKey) {
        var encryptedPrivateKey = cryptojs.AES.encrypt(privateKey, password)
        const encryptedPrivateKeyString = encryptedPrivateKey.toString();

        const params = { encryptedPrivateKey: encryptedPrivateKeyString };

        const response = await postRequest({ params, url: `${AUTH_SERVICE_URL}/auth/private-key` });
        if (response.status === 201) {
            return "Private key encrypted and stored successfully."
        }
        return response;
    }

    async decrypt(password) {
        const { data } = await getRequest({ url: `${AUTH_SERVICE_URL}/auth/private-key` })

        if (data) {
            var bytes = cryptojs.AES.decrypt(data.data.encryptedPrivateKey, password);
            var privateKey = bytes.toString(cryptojs.enc.Utf8);
            return privateKey;
        }
        return "Error occured. Please try again."
    }
}

module.exports = PBTS;