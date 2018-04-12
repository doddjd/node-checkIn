const sendMail = require('../../sendMail')
const apis = require('./api')
const moment = require('moment');

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
/**
 * 起点打卡
 * @param {Object} 
 */
var qidianCheck = (input) => {
    return new Promise(function (resolve, reject) {
        apis.qidianCheck({ ajax: 1 }).then(res => {
            input.emailTpl = {
                title: '起点',
                date: moment().format('YYYY-MM-DD'),
                innerHtml: `<p>起点打卡结果${res.data.Message};</p>`
            }
            if (res.data.Result == 0||res.data.Result == 1001) {
                // Result为0时为当天首次打卡，1001为之后打卡但请求成功
                console.log('qidian check ok');
                setTimeout(resolve, 5000, input);
            } else {
                reject(input)
            }
        }).catch(function (error) {//加上catch
            reject(error);
        })
    });
}
/**
 * 获取起点打卡抽奖
 */
var qidianCheckInLottery = (input) => {
    return new Promise(function (resolve, reject) {
        apis.qidianCheckInLottery().then(res => {
            // 奖励对照表
            let prizeMap = {
                '1': '500点',
                '2': '10点',
                '3': '50经验值',
                '4': '游戏赠券',
                '5': '5点',
                '6': '5经验值',
                '7': '100积分',
                '8': '10经验值',
            }
            if (res.data.Result == 0) {
                console.log('qidian checkInLottery ok');
                input.emailTpl.innerHtml += `<p>起点抽奖成功，抽到了${prizeMap[res.data.Data]}</p>`
                resolve(input)
            } else {
                input.emailTpl.innerHtml += `<p>起点抽奖失败，因${res.data.Message}</p>`
                reject(input)
            }
        }).catch(function (error) {//加上catch
            reject(error);
        })
    });
}

function qiDianChecking() {
    startPromise().then(qidianCheck)
        .then(qidianCheckInLottery)
        // .then(sendMail)
        .catch(sendMail)
}

module.exports = qiDianChecking