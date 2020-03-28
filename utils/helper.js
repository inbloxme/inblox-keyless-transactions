const axios = require('axios');

async function getRequest({ url }) {
    try {
        const response = await axios({
            url,
            method: 'GET',
            headers: {
                Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImJlNmFkMDNmLWIxZDEtNDYwYi1iZDk1LTNjN2Q5N2IxZGJhMiJ9.eyJ1c2VySWQiOiI1ZTYzNjFkODU4ZmU5YTAwMTFjYjRjMzAiLCJuYW1lIjoiQXJqdW4iLCJlbWFpbCI6ImFyanVuMTcwOUBnbWFpbC5jb20iLCJyb2xlIjoiY29tbXVuaXR5IiwiaW5ibG94SGFuZGxlTmFtZSI6ImFyajAiLCJpc0hhbmRsZW5hbWVSZWdpc3RlcmVkT25XZWIzIjp0cnVlLCJwdWJsaWNBZGRyZXNzIjoiMHgxMzUzRkUyMWUzRDZiQTQ5ZDkyMUY3NjI2M2EyYTVDYWFmMDlBNTViIiwiaWF0IjoxNTg0NzczNDk1LCJleHAiOjE1ODUzNzgyOTUsImF1ZCI6WyJwbGF0Zm9ybSJdLCJpc3MiOiJJbmJsb3ggbmV0d29ya3MgcHJpdmF0ZSBsaW1pdGVkIiwic3ViIjoiZGV2ZWxvcGVya0BpbmJsb3gubWUifQ.e3nNdA-rAA_hje0aaLQRSmrjtkUPocabWK_Wv8M27Pri_dJJQ7XDVOlxsOT1JMiByI5RWVCX6nRq7NnItD6S0vRp7IbqzHieP-X70W2UjiGa8ov-2Uh1hohKj4AsEkoEuwhXfHpssZ8naVDIl1cmC_7n4MxI_V-MWrDCb2nGDjg',
            },
        });

        return response;
    } catch (error) {
        return { error };
    }
};

async function postRequest({ params, url }) {
    try {
        const response = await axios({
            url,
            method: 'POST',
            headers: {
                Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImJlNmFkMDNmLWIxZDEtNDYwYi1iZDk1LTNjN2Q5N2IxZGJhMiJ9.eyJ1c2VySWQiOiI1ZTYzNjFkODU4ZmU5YTAwMTFjYjRjMzAiLCJuYW1lIjoiQXJqdW4iLCJlbWFpbCI6ImFyanVuMTcwOUBnbWFpbC5jb20iLCJyb2xlIjoiY29tbXVuaXR5IiwiaW5ibG94SGFuZGxlTmFtZSI6ImFyajAiLCJpc0hhbmRsZW5hbWVSZWdpc3RlcmVkT25XZWIzIjp0cnVlLCJwdWJsaWNBZGRyZXNzIjoiMHgxMzUzRkUyMWUzRDZiQTQ5ZDkyMUY3NjI2M2EyYTVDYWFmMDlBNTViIiwiaWF0IjoxNTg0NzczNDk1LCJleHAiOjE1ODUzNzgyOTUsImF1ZCI6WyJwbGF0Zm9ybSJdLCJpc3MiOiJJbmJsb3ggbmV0d29ya3MgcHJpdmF0ZSBsaW1pdGVkIiwic3ViIjoiZGV2ZWxvcGVya0BpbmJsb3gubWUifQ.e3nNdA-rAA_hje0aaLQRSmrjtkUPocabWK_Wv8M27Pri_dJJQ7XDVOlxsOT1JMiByI5RWVCX6nRq7NnItD6S0vRp7IbqzHieP-X70W2UjiGa8ov-2Uh1hohKj4AsEkoEuwhXfHpssZ8naVDIl1cmC_7n4MxI_V-MWrDCb2nGDjg',
            },
            data: params
        });

        return response;
    } catch (error) {
        return { error };
    }
};

module.exports = { getRequest, postRequest }