
const sendMail = require('../../sendMail')
const apis = require('./api')
const moment = require('moment');

let pays = {
    rate: 1, // 我猜是金额
    payment: 901, //固定
    dPayTag: 10 //固定
}
// myBalance 字段为钱包可用金额

var startPromise = () => {
    return new Promise((resolve, reject) => {
        console.log('start new Promise...');
        let actInfo = {
            emailTpl: {
                title: '默认',
                date: moment().format('YYYY-MM-DD'),
                innerHtml: ' '
            }
        }
        resolve(actInfo);
    })
}

var getActInfo = (input) => {
    return new Promise(function (resolve, reject) {
        apis.getMainHome().then(res => {
            input.emailTpl = {
                title: 'ofo打卡',
                date: moment().format('YYYY-MM-DD'),
                innerHtml: ' '
            }
            if (res.data.errorCode == 200) {
                console.log(1);
                console.log('resolve inp 1: ' + input);
                input.emailTpl.innerHtml=''
                input.res = res.data.values
                resolve(input)
            } else {
                input.emailTpl.innerHtml = res.data.msg
                reject(input)
            }
        }).catch(function (error) {//加上catch
            reject(error);
        })
    });
}
var setCheckIn = (input) => {
    return new Promise(function (resolve, reject) {
        apis.checkIn().then(res => {
            if (res.data.errorCode == 200) {
                console.log('resolve inp 2: ' + input);
                if (input.res.myBalance >= 1) {
                    if ([5, 6].indexOf(moment().day()) > -1 && input.res.myBalance >= 5) {
                        pays.rate = 5
                    } else {
                        pays.rate = 1
                    }
                    setTimeout(resolve, 20000, res.data);
                } else {
                    reject('已打卡，余额不足，为预定明日打卡')
                }
            } else {
                input.emailTpl.innerHtml = res.data.msg
                reject(input)
            }
        }).catch(function (error) {//加上catch
            reject(error);
        })
    });
}

var payNextDay = (input) => {
    return new Promise(function (resolve, reject) {
        apis.setPaymen(pays).then(res => {
            if (res.data.errorCode == 200) {
                console.log('all done');
                resolve(`打卡流程完成，已预定明日打卡${pays.rate}元`)
            } else {
                reject(res.data.msg)
            }
        }).catch(function (error) {//加上catch
            reject(error);
        })
    });
}

function ofoChecking() {
    startPromise().then(getActInfo)
        .then(setCheckIn)
        .then(payNextDay)
        .then(sendMail)
        .catch(sendMail)
}

module.exports = ofoChecking