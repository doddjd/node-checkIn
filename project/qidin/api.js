const axios = require('axios');
const token = require('../../ticketInfo').qidianCookie;
var qidianAjax = axios.create({
    timeout: 5000,
    proxy: {
        host: '127.0.0.1',
        port: 8888
    },
    headers: {
        'cookie': token,
        'accept-Language': 'zh-CN,en-US;q=0.8',
        'accept-Encoding': 'gzip, deflate',
        'referer': 'https://h5.if.qidian.com/Atom.axd/Web/CheckIn/UserCheckInV2',
        'content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'x-Requested-With': 'XMLHttpRequest',
        'origin': 'https://h5.if.qidian.com',
        'accept': 'application/json, text/javascript, */*; q=0.01',
        'connection': 'keep-alive',
        'host': 'h5.if.qidian.com',
        'user-agent': 'Mozilla/5.0 (Linux; Android 7.0; Redmi Note 4X Build/NRD90M; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/64.0.3282.137 Mobile Safari/537.36',

    }
})

const qidianCheck = (params) => qidianAjax.post('http://h5.if.qidian.com/Atom.axd/Api/CheckIn/CheckIn', params)
const qidianCheckInLottery = (params) => qidianAjax.post('http://h5.if.qidian.com/Atom.axd/Web/Ajax/CheckInLottery', params)

module.exports = {
    qidianCheck,
    qidianCheckInLottery
}