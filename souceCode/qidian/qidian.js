var request = require("request");

var options = {
    method: 'POST',
    url: 'http://h5.if.qidian.com/Atom.axd/Api/CheckIn/CheckIn',
    headers:
        {
            'cache-control': 'no-cache',
            'cookie': 'loginType=4; _csrfToken=hM7oUo8UAPa0XabmnxuE0hU6qfgfNVhc3D7GhduF; cmfuToken=N((j7i2KWPUkKB7jQ7-dbn88LCO-d5LCAJGfAlp9Qw_Ta3K2gzlG3UEiiw8qhFNf4vaa5U6urILxiTmNsQ4G1Ouau_gctZkm0vMh5SVQSE8pVwiSk2smz-bE2ZTOVpQXYuNkoQHPzG8JevvcSWf_qTzK5W3jU-SvqXIZetLa7gmsmRLwLGFGbAFJmBRc7yX9jDZgVAG7qrRnYs1YR1z0_sCNmjYBp4vWpQOHz1ikGv9x9AcUElV-FtUGeYC1T586RYZgKYuG8P6i7xz4XnfvqLzqUnQuf31qkd8YoFGVYrsGdg1;',
            'accept-language': 'zh-CN,zh;q=0.9',
            'accept-encoding': 'gzip, deflate, br',
            'dnt': '1',
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'user-agent': 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.186 Safari/537.36',
            'upgrade-insecure-requests': '1'
        },
    body: '{\n "isAjax":1\n}'
};

request(options, function (error, response, body) {
    if (error) throw new Error(error);

    console.log(body);
});