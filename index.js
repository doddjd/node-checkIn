const CronJob = require('cron').CronJob;
const qiDianChecking = require('./project/qidin/action')
const ofoChecking = require('./project/ofo/action')

// ofoChecking()

qiDianChecking()
// new CronJob('0 5 8 * * *', ofoChecking , null, true, 'Asia/Shanghai');
