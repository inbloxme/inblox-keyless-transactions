const cryptojs = require('crypto-js');
const axios = require('axios');

class PBTS {
    async encrypt(password, privateKey) {
        var encryptedPrivateKey = cryptojs.AES.encrypt(privateKey, password)
        const encryptedPrivateKeyString = encryptedPrivateKey.toString();
        const url = 'https://dev-auth.inblox.me/auth/private-key';

        const params = { encryptedPrivateKey: encryptedPrivateKeyString };

        const response = await postRequest(params, url);
        return response;
    }

    async decrypt(password) {
        const url = 'http://localhost:3001/auth/private-key';
        const { data } = await getRequest({ url })

        var bytes = cryptojs.AES.decrypt(data.data.encryptedPrivateKey, password);
        var privateKey = bytes.toString(cryptojs.enc.Utf8);
        return privateKey;
    }

    async getRequest({ url }) {
        try {
            const response = await axios({
                url,
                method: 'GET',
                headers: {
                    Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImJlNmFkMDNmLWIxZDEtNDYwYi1iZDk1LTNjN2Q5N2IxZGJhMiJ9.eyJ1c2VySWQiOiI1ZTJlNzllMzI3N2M0MTAwMTNkNmY3ZTEiLCJuYW1lIjoiTWFub2oiLCJlbWFpbCI6ImFyanVuMTcwOUBnbWFpbC5jb20iLCJyb2xlIjoiY29tbXVuaXR5IiwiaW5ibG94SGFuZGxlTmFtZSI6ImthdXNoaWtrIiwiaXNIYW5kbGVuYW1lUmVnaXN0ZXJlZE9uV2ViMyI6dHJ1ZSwicHVibGljQWRkcmVzcyI6IjB4MTJlQzE0NmY2M2E4ZjNEMmZhZUMwNjMyOTVhMThiMDNCNjVmNzdhNSIsImlhdCI6MTU4MzM4ODc5MCwiZXhwIjoxNTgzOTkzNTkwLCJhdWQiOlsicGxhdGZvcm0iXSwiaXNzIjoiSW5ibG94IG5ldHdvcmtzIHByaXZhdGUgbGltaXRlZCIsInN1YiI6ImRldmVsb3BlcmtAaW5ibG94Lm1lIn0.LNBLcf3W6PteAjUaaK9_vw8ZrCBAUSHBSaGz8x3hF_g8ZmcVLGbDqKwuX54k4AhWclFNFsCnI1VBAm089M-Q1Ni2awparDS8EaWxigwaYnyFXVuvUANfJzKlaq6nfyiIhnv6kE78a6QIt5_ZxNFDpzGYwBTx3PDI-851WiNUY1A',
                },
            });

            return response;
        } catch (error) {
            return { error: [{ name: 'server', messages: 'There is some issue, Please try after some time' }] };
        }
    };

    async postRequest(params, url) {
        try {
            const response = await axios({
                url,
                method: 'POST',
                headers: {
                    Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImJlNmFkMDNmLWIxZDEtNDYwYi1iZDk1LTNjN2Q5N2IxZGJhMiJ9.eyJ1c2VySWQiOiI1ZTJlNzllMzI3N2M0MTAwMTNkNmY3ZTEiLCJuYW1lIjoiTWFub2oiLCJlbWFpbCI6ImFyanVuMTcwOUBnbWFpbC5jb20iLCJyb2xlIjoiY29tbXVuaXR5IiwiaW5ibG94SGFuZGxlTmFtZSI6ImthdXNoaWtrIiwiaXNIYW5kbGVuYW1lUmVnaXN0ZXJlZE9uV2ViMyI6dHJ1ZSwicHVibGljQWRkcmVzcyI6IjB4MTJlQzE0NmY2M2E4ZjNEMmZhZUMwNjMyOTVhMThiMDNCNjVmNzdhNSIsImlhdCI6MTU4MzM4ODc5MCwiZXhwIjoxNTgzOTkzNTkwLCJhdWQiOlsicGxhdGZvcm0iXSwiaXNzIjoiSW5ibG94IG5ldHdvcmtzIHByaXZhdGUgbGltaXRlZCIsInN1YiI6ImRldmVsb3BlcmtAaW5ibG94Lm1lIn0.LNBLcf3W6PteAjUaaK9_vw8ZrCBAUSHBSaGz8x3hF_g8ZmcVLGbDqKwuX54k4AhWclFNFsCnI1VBAm089M-Q1Ni2awparDS8EaWxigwaYnyFXVuvUANfJzKlaq6nfyiIhnv6kE78a6QIt5_ZxNFDpzGYwBTx3PDI-851WiNUY1A',
                },
                data: params
            });

            return response;
        } catch (error) {
            return { error };
        }
    };

}

module.exports = PBTS