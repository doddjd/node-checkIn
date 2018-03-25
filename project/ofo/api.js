const axios = require('axios');
const FormData = require('form-data');
var qs = require('qs');
const token = require('../../ticketInfo').ofoToken;

var ofoAjax = axios.create({
    timeout: 5000,
    proxy: {
        host: '127.0.0.1',
        port: 8888
    },
    headers: {
        // 'X-Requested-With': 'XMLHttpRequest' ,
        'user-agent': 'Mozilla/5.0 (Linux; Android 7.0; Redmi Note 4X Build/NRD90M; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/64.0.3282.137 Mobile Safari/537.36 OfoApp/15450',
        'cookie': 'loginType=4; _csrfToken=hM7oUo8UAPa0XabmnxuE0hU6qfgfNVhc3D7GhduF; cmfuToken=N((j7i2KWPUkKB7jQ7-dbn88LCO-d5LCAJGfAlp9Qw_Ta3K2gzlG3UEiiw8qhFNf4vaa5U6urILxiTmNsQ4G1Ouau_gctZkm0vMh5SVQSE8pVwiSk2smz-bE2ZTOVpQXYuNkoQHPzG8JevvcSWf_qTzK5W3jU-SvqXIZetLa7gmsmRLwLGFGbAFJmBRc7yX9jDZgVAG7qrRnYs1YR1z0_sCNmjYBp4vWpQOHz1ikGv9x9AcUElV-FtUGeYC1T586RYZgKYuG8P6i7xz4XnfvqLzqUnQuf31qkd8YoFGVYrsGdg1;',

    }
})

let formParmas = {
    'token': token,
    'source-version': 9999,
    'source': 2
}

function getPars(params) {
    let tmObj = Object.assign(formParmas, params)
    return qs.stringify(tmObj)
}

const setPaymen = (params) => ofoAjax.post('http://san.ofo.so/ofo/Api/v3/payment', getPars(params))
const getUserInfo = (params) => ofoAjax.post('http://san.ofo.so/ofo/Api/v4/info/user', getPars(params))
const getMainHome = (params) => ofoAjax.post('http://activity.api.ofo.com/activity/morning/home', getPars(params))
const checkIn = (params) => ofoAjax.post('http://activity.api.ofo.com/activity/morning/checkIn', getPars(params))

module.exports = {
    setPaymen,
    getUserInfo,
    checkIn,
    getMainHome
}
// http://san.ofo.so/ofo/Api/v4/info/user
