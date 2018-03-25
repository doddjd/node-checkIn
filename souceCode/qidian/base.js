var Index = (function () {
    var allTimes = ~~$("#indexNumber").html();
    var noBreakTimes = ~~$("#noBreakTimes").data("count");
    var restLotteryTimes = ~~$("#doLottery").data("lotterytimes");
    var moneyEnough = (~~$("#hid_enough").val()) === 1;
    var userId = ~~$("#hid_userId").val();
    var platform = JsHelper.isIOS ? 2 : 1;
    var versionCode = JsHelper.getVersionCode();
    var isRunning = false;
    var stepCount = 100000;
    var prizeId = -1;
    var checkInDate = 0;
    var timerKey = "checkInPush";
    var timerType = "1";
    var timerMsg = "【签到提醒】今日奖励待领取，连签享更多福利，点击立即签到>";

    var showMsg = function (title, msg) {
        $("#pop .pop-title").html('<div class="text-title">' + title + '</div>');
        $("#pop .pop-content").html('<div class="just-content">' + msg + '</div>')
        $("#pop").show();
        $("#pop_loading").hide();
    };

    var showErrorMsg = function () {
        showMsg("非常抱歉", "网络错误，请稍候重试");
    }


    function ajax(url, data, success) {
        $.ajax({
            url: url, //请求的URL
            timeout: 3000, //超时时间设置，单位毫秒
            type: 'post', //请求方式，get或post
            data: data, //请求所传参数，json格式
            dataType: 'json', //返回的数据格式
            success: success,
            complete: function (XMLHttpRequest, status) { //请求完成后最终执行参数
                // $("#tip_loading").hide();
                if (status == 'timeout') { //超时,status还有success,error等值的情况
                    $("#pop_loading").hide();
                    showErrorMsg();
                    isRunning = false;
                }

            }
        });
    }

    function setAllTimes(times) {
        allTimes = times > 0 ? times : 0;
        $("#indexNumber").html(allTimes);
    }

    function setRestLotteryTimes(times) {
        restLotteryTimes = times > 0 ? times : 0;
        if (restLotteryTimes > 0) {
            $("#doLottery").addClass("active");
        } else {
            $("#doLottery").removeClass("active");
        }
    }

    function setNoBreakTimes(times) {
        var current = ("0000" + noBreakTimes).substr(-4, 4);
        noBreakTimes = times > 0 ? times : 0;
        var str = "0000" + noBreakTimes;
        str = str.substr(-4, 4);
        $("span.number").each(function (index, item) {
            $(this).html(str[index]).data("count", noBreakTimes);
            //给变化的地方设置active显示特效
            if (str[index] !== current[index]) {
                $(this).addClass("active");
            }
        })
        //查找是否有需要改变状态的礼包
        if ($("div.part3>div.gift-control>div.nonRecieve").length > 0) {
            var lowerLimit = ~~$("div.part3").data("lowerlimit");
            if (noBreakTimes >= lowerLimit) {
                $("div.part3>div.title").html("你有礼包未领取：");
                $("div.part3>div.gift-control>div.nonRecieve").addClass("active").removeClass("nonRecieve").html("领取");
            } else {//修改差距时间
                $("div.part3>div.title").html("距下一个礼包还有" + (lowerLimit - noBreakTimes) + "天");
            }
        }

    };
    function showCheckInReward(coin, exp, lotteryTimes, type) {
        var html = '';
        if (coin > 0) {
            html += '<div class="dib wp30"><span class="add-symbol">+</span><span class="gift-number">' + coin + '</span><br>点' +
                '</div>';
        }
        if (exp > 0) {
            html += '<div class="dib wp30"><span class="add-symbol">+</span><span class="gift-number">' + exp + '</span><br>经验值' +
                '</div>';
        }
        if (lotteryTimes > 0) {
            html += '<div class="dib wp30"><span class="add-symbol">+</span><span class="gift-number">' + lotteryTimes + '</span><br>抽奖' +
                '</div>';
        }
        $("#pop_checkIn div.gift-show").html(html);
        if (type === 1) {//正常签到
            $("#pop_checkIn div.text-title").html("签到成功");
        } else {//补签
            $("#pop_checkIn div.text-title").html("补签成功");
        }
        $("#pop_checkIn").show();
    };
    //检查用户版本，是否显示底部的定时提醒区域
    function showSchedule() {
        if (JsHelper.isIOSClient) {
            var version = JsHelper.getVersionCode();
            if (version > 171) {
                $("#part5_seperator").show();
                $("#part5_ios").show();
                //获取
                JsHelper.getTimerTask(timerKey, timerType, function (resp) {
                    if (resp && resp.result === 0) {
                        if (resp.data && resp.data instanceof Array && resp.data.length > 0) {
                            if (resp.data[0] && resp.data[0].isOpen) {
                                $("#part5_ios>div.btn").addClass("active");
                            }
                        }
                    }
                })
            }
        } else if (JsHelper.isAndroidClient) {
            var version = JsHelper.getVersionCode();
            if (version > 264) {
                $("#part5_seperator").show();
                $("#part5_android").show();
                //获取
                JsHelper.getTimerTask(timerKey, timerType, function (resp) {
                    if (resp && resp.result === 0) {
                        if (resp.data && resp.data instanceof Array && resp.data.length > 0) {
                            if (resp.data[0] && resp.data[0].isOpen) {
                                $("#part5_android>div.btn").addClass("active");
                            }
                        }
                    }
                })
            }
        }
    }

    function addOrRemoveTimer(obj) {
        if ($(obj).is(".active")) {//移除
            JsHelper.removeTimerTask(timerKey, timerType, function (resp) {
                if (resp.result === 0) {
                    $(obj).removeClass("active");
                    var param = {
                        activityid: "q_new_qiandao",
                        userid: userId,
                        version: versionCode, platform: platform,
                        logtime: new Date().Format("yyyy-MM-dd hh:mm:ss"),
                        p1: 13
                    };
                    JsHelper.reportStatisticData(param);
                }
            })
        } else {
            var date = new Date();
            date.setHours(22);
            date.setMinutes(0);
            date.setSeconds(0);
            date.setMilliseconds(0);
            var beginTime = date.getTime();
            var endTime = new Date(date.getTime() + 3600 * 24 * 1000 * 3650).getTime() / 1000;
            beginTime = beginTime / 1000;
            var step = 3600 * 24;
            JsHelper.addTimerPush(timerKey, timerType, beginTime, endTime, step, timerMsg, function (resp) {
                if (resp.result === 0) {
                    $(obj).addClass("active");
                    var param = {
                        activityid: "q_new_qiandao",
                        userid: userId,
                        version: versionCode, platform: platform,
                        logtime: new Date().Format("yyyy-MM-dd hh:mm:ss"),
                        p1: 12
                    };
                    JsHelper.reportStatisticData(param);
                }
            })
        }
    }

    //显示抽奖成功弹层
    function showLotteryReward(fromType) {
        var ele = $('#lottery_items>li[data-prizeid=' + prizeId + ']');
        if (ele.length > 0) {//1-起点币,2-经验值,3-积分,4-游戏券
            var arr = ['', '点 ×', "经验值 ×", "积分 ×", "游戏赠券 ×"];
            var img = $(ele).css("background-image");
            var count = ~~$(ele).data("count");
            var type = ~~$(ele).data("type");
            $("#pop_lottery div.pop-title div.gift-title").html(arr[type] + '<span class="gift-value">' + count + '</span>');
            //修改图片
            $("#pop_lottery div.gift-title-icon").css("background-image", img);
            $("#pop_lottery").show();
            //上报签到奖励统计
            var param = {
                activityid: "q_new_qiandao", userid: userId,
                version: versionCode, platform: platform,
                logtime: new Date().Format("yyyy-MM-dd hh:mm:ss"),
                p1: fromType, p2: 0, p3: 0, p4: 0, p5: 0, p6: 0
            };
            $("#pop_lottery div.gift-gt").hide();
            if (type === 1) {  // P3	金额
                param.p3 = count;
            } else if (type === 2) { // P2	经验值
                param.p2 = count;
            } else if (type === 3) {  // p5	积分
                param.p5 = count;
            } else if (type === 4) { // p6	游戏赠券
                param.p6 = count;
                $("#pop_lottery div.gift-gt").show();
            }
            JsHelper.reportStatisticData(param);
        }
    }

    //抽奖相关
    function lotteryMove(index, sec, fromType) {
        if (stepCount < 0) return;
        var length = $("#lottery_items>li").length;
        $("#lottery_items>li").eq(index % length).removeClass("active");
        index++;
        $("#lottery_items>li").eq(index % length).addClass("active");
        if (stepCount <= 20) {
            sec += 10;
            if (stepCount <= length) {
                if (prizeId >= 0) {
                    if ($("#lottery_items>li").eq(index % length).data("prizeid") === prizeId) {
                        setTimeout(function () {
                            showLotteryReward(fromType);
                            isRunning = false;
                            setRestLotteryTimes(restLotteryTimes - 1);
                        }, 100);
                        return;
                    }
                }
            }
        }
        stepCount--;
        setTimeout(function () {
            lotteryMove(index, sec, fromType);
        }, sec);
    };
    function doLottery(fromType) {
        $("div.pop").hide();
        if (restLotteryTimes <= 0) return;
        if (isRunning) return;
        isRunning = true;
        var index = $("ul.gift-items>li").index($("ul.gift-items>li.active"));
        stepCount = 100000;
        prizeId = -1;
        lotteryMove(index, 100, fromType);
        ajax("/Atom.axd/Web/Ajax/CheckInLottery", {}, function (resp) {
            if (resp && resp.Result === 0) {
                prizeId = resp.Data;
                //转盘停止转动
                stopLotteryMove();
            } else {
                if (resp && resp.Result === -1009) {//机会用光
                    setRestLotteryTimes(0);
                    stepCount = 0;
                    showMsg("抱歉", "暂无抽奖机会，如已签到请稍后重试")
                    return;
                }
                showErrorMsg();
            }
        })
    }

    function stopLotteryMove() {
        stepCount = 10;
    }

    //签到
    function checkIn() {
        if ($("#btn_checkIn").is(".active")) return;
        if (isRunning) return;
        isRunning = true;
        $("#pop_loading").show();
        ajax("/Atom.axd/Api/CheckIn/CheckIn", { isAjax: 1 }, function (resp) {
            if (resp && resp.Result >= 0 && resp.Data) {
                var obj = resp.Data.RewardItem;
                $("#btn_checkIn").addClass("active");
                $("#current_day").attr("style", "");
                if (resp.Result !== 1001) {//1001：已签到
                    setAllTimes(resp.Data.AllTimes);
                    setNoBreakTimes(resp.Data.NoBreakTimes);
                    if (obj.LotteryTime && obj.LotteryTime > 0) {
                        setRestLotteryTimes(restLotteryTimes + obj.LotteryTime);
                    }
                    //上报签到奖励统计
                    var param = {
                        activityid: "q_new_qiandao", userid: userId,
                        version: versionCode, platform: platform,
                        logtime: new Date().Format("yyyy-MM-dd hh:mm:ss"),
                        p1: 4, p2: obj.Exp, p3: obj.Coin, p8: obj.LotteryTime, p4: 0
                    };
                    JsHelper.reportStatisticData(param);
                }
                showCheckInReward(obj.Coin, obj.Exp, obj.LotteryTime, 1);
            } else {
                showErrorMsg();
            }
            $("#pop_loading").hide();
            isRunning = false;
        })

    }

    function showPackReward(coin, exp, lotteryTimes, tips) {
        var html = '';
        if (coin > 0) {
            html += '<div class="dib wp30"><span class="add-symbol">+</span><span class="gift-number">' + coin + '</span><br>点' +
                '</div>';
        }
        if (exp > 0) {
            html += '<div class="dib wp30"><span class="add-symbol">+</span><span class="gift-number">' + exp + '</span><br>经验值' +
                '</div>';
        }
        if (lotteryTimes > 0) {
            html += '<div class="dib wp30"><span class="add-symbol">+</span><span class="gift-number">' + lotteryTimes + '</span><br>抽奖' + '</div>';
        }
        $("#pop_pack div.gift-show").html(html);
        $("#pop_pack div.gift-detail").html(tips);
        $("#pop_pack").show();
    }

    //领取礼包
    function recievePack(obj) {
        if (!$(obj).is(".active")) return;
        if (isRunning) return;
        isRunning = true;
        var packType = ~~$("div.gift-control").data("packtype");
        $("#pop_loading").show();
        ajax("/Atom.axd/Web/Ajax/RecievePack", { packType: packType }, function (resp) {
            if (resp && resp.Result >= 0) {
                //显示礼包奖励
                var tips = '';
                var coin = ~~$("div.gift-control").data("coin");
                var exp = ~~$("div.gift-control").data("exp");
                var lotteryTimes = ~~$("div.gift-control").data("lotterytimes");
                if (resp.Data) {
                    var pack = resp.Data;
                    var status = ~~pack.PackStatus;
                    if (status === 0) {
                        var dist = pack.LowerLimit - noBreakTimes;
                        dist = dist > 0 ? dist : 0;
                        $("div.part3 div.title").html("距下一个礼包还有" + dist + "天");
                        $("div.gift-control>div.btn").removeClass("active").addClass("nonRecieve").html("未领取");
                        tips = "再签" + dist + "天可领" + pack.PackReward;
                    } else if (status === 1) {
                        $("div.part3 div.title").html("你有礼包未领取：");
                        tips = "再签0天可领" + pack.PackReward;
                    } else {
                        $("div.part3 div.title").html("恭喜！已领取全部礼包：");
                        $("div.gift-control>div.btn").removeClass("active").addClass("diable").html("已领取");
                        tips = "恭喜！已领取全部礼包";
                    }
                    //
                    if (lotteryTimes > 0) {
                        setRestLotteryTimes(restLotteryTimes + lotteryTimes);
                    }
                    $("div.gift-control").data("packtype", pack.PackType);
                    $("div.gift-control").data("coin", pack.Coin);
                    $("div.gift-control").data("exp", pack.Exp);
                    $("div.gift-control").data("lotterytimes", pack.LotteryTime);
                    $("div.gift-control>div.detail").html(pack.PackReward);
                    $("div.gift-control>div.name").html(pack.PackName);
                    //上报统计数据
                    var param = {
                        activityid: "q_new_qiandao", userid: userId,
                        version: versionCode, platform: platform,
                        logtime: new Date().Format("yyyy-MM-dd hh:mm:ss"),
                        p1: 9, p2: exp, p3: coin, p4: 0, p5: 0, p6: 0, p7: packType, p8: lotteryTimes
                    };
                    JsHelper.reportStatisticData(param);
                } else {
                    $("div.gift-control>div.btn").removeClass("active").addClass("disable").html("已领取")
                }
                showPackReward(coin, exp, lotteryTimes, tips);
            } else {
                showErrorMsg();
            }
            $("#pop_loading").hide();
            isRunning = false;
        });
    }

    //补签
    function reCheckIn(obj) {
        if ($(obj).is(".active")) return;
        //上报点击数据
        var param = {
            activityid: "q_new_qiandao",
            userid: userId,
            version: versionCode, platform: platform,
            logtime: new Date().Format("yyyy-MM-dd hh:mm:ss"),
            p1: 11
        };
        JsHelper.reportStatisticData(param);
        if (!moneyEnough) {
            $("#pop_notEnough").show();
            return;
        }

        var date = ~~$(obj).data("checkindate");
        if (date <= 0) return;
        checkInDate = date;
        $("#pop_pay").show();
    }

    function confirmRecheckIn() {
        if (isRunning) return;
        isRunning = true;
        //上报统计数据
        var param = {
            activityid: "q_new_qiandao", userid: userId,
            version: versionCode, platform: platform,
            logtime: new Date().Format("yyyy-MM-dd hh:mm:ss"),
            p1: 17, p2: 0, p3: 0, p4: 0, p5: 0, p6: 0
        };
        JsHelper.reportStatisticData(param);
        $(".pop").hide();
        $("#pop_loading").show();
        ajax("/Atom.axd/Api/CheckIn/ReCheckIn", { checkInDate: checkInDate }, function (resp) {
            if (resp && resp.Result >= 0 && resp.Data) {
                if (resp.Result !== 1001) {//1001：已补签
                    var obj = resp.Data.RewardItem;
                    setAllTimes(resp.Data.AllTimes);
                    //当前连续次数需要视情况调整
                    var times = ~~resp.Data.NoBreakTimes;

                    moneyEnough = resp.Data.MoneyEnough;
                    if (times > noBreakTimes) {
                        setNoBreakTimes(times);
                    }
                    if (obj && obj.LotteryTime && obj.LotteryTime > 0) {
                        setRestLotteryTimes(restLotteryTimes + obj.LotteryTime);
                    }
                    //上报补签奖励统计
                    var param = {
                        activityid: "q_new_qiandao", userid: userId,
                        version: versionCode, platform: platform,
                        logtime: new Date().Format("yyyy-MM-dd hh:mm:ss"),
                        p1: 4, p2: obj.Exp, p3: obj.Coin, p8: obj.LotteryTime, p4: 1
                    };
                    JsHelper.reportStatisticData(param);
                }
                $("#reCheckInList>li[data-checkindate=" + checkInDate + "]").addClass("active");
                showCheckInReward(obj.Coin, obj.Exp, obj.LotteryTime, 2);
            } else {
                if (resp && resp.Result === -999) {
                    $("#pop_notEnough").show();
                } else if (resp && resp.Result === -989) {
                    showMsg("非常抱歉", resp.Message);
                } else {
                    showErrorMsg();
                }
            }
            $("#pop_loading").hide();
            isRunning = false;
        });
    }

    //跳转广告位并上报统计数据
    function goAdUrl(type, url) {
        var param = {
            activityid: "q_new_qiandao", userid: userId,
            version: versionCode, platform: platform,
            logtime: new Date().Format("yyyy-MM-dd hh:mm:ss"),
            p1: type, p2: 0, p3: 0, p4: url, p5: 0, p6: 0
        };
        JsHelper.reportStatisticData(param);
        if (url) {
            location.href = url;
        }
    }

    //跳转礼包列表页面，上报统计数据
    function goPackList(type) {
        var param = {
            activityid: "q_new_qiandao", userid: userId,
            version: versionCode, platform: platform,
            logtime: new Date().Format("yyyy-MM-dd hh:mm:ss"),
            p1: type, p2: 0, p3: 0, p4: 0, p5: 0, p6: 0
        };
        JsHelper.reportStatisticData(param);
        location.href = "UserGiftPack";
    }

    function goRecharge() {
        var param = {
            activityid: "q_new_qiandao", userid: userId,
            version: versionCode, platform: platform,
            logtime: new Date().Format("yyyy-MM-dd hh:mm:ss"),
            p1: 18, p2: 0, p3: 0, p4: 0, p5: 0, p6: 0
        };
        JsHelper.reportStatisticData(param);
        JsHelper.openRecharge();
    }

    var init = function () {
        //app端不签到，所以进入此页面时不会有弹层
        var ele = $("#hid_remark");
        if (ele.length > 0) {
            var item = sessionStorage.getItem("checkIn_Index_book_pop");
            if (item) return;
            var remark = ele.val();
            if (remark && remark.length > 0) {
                var arr = remark.split('|');
                if (arr.length < 3) return;
                //coin|exp|lotteryTimes
                sessionStorage.setItem("checkIn_Index_book_pop", remark);
                setRestLotteryTimes(~~arr[2]);
                showCheckInReward(~~arr[0], ~~arr[1], ~~arr[2], 1);
            }
        }
        //设置抽奖成功后显示弹层广告
        var ele = $("#hid_ad");
        if (ele.length > 0) {
            var name = $(ele).data('name');
            var img = $(ele).data('img');
            var url = ___pop_ad_url;
            $("#pop_lottery div.pop-content img").attr('src', img).on("click", function () {
                var param = {
                    activityid: "q_new_qiandao", userid: userId,
                    version: versionCode, platform: platform,
                    logtime: new Date().Format("yyyy-MM-dd hh:mm:ss"),
                    p1: 15, p2: 0, p3: 0, p4: url, p5: 0, p6: 0
                };
                JsHelper.reportStatisticData(param);
                location.href = url;
            });
            $("#pop_lottery div.pop-content div.ad-detail").html(name);
            $("#go_ad").attr('href', "javascript:;").on("click", function () {
                var param = {
                    activityid: "q_new_qiandao", userid: userId,
                    version: versionCode, platform: platform,
                    logtime: new Date().Format("yyyy-MM-dd hh:mm:ss"),
                    p1: 16, p2: 0, p3: 0, p4: url, p5: 0, p6: 0
                };
                JsHelper.reportStatisticData(param);
                location.href = url;
            });
            $("#go_ad").show();
        } else {
            $("#pop_lottery div.pop-content").empty();
            $("#go_ad").prev().attr('style', "float:none;display:inline-block;");
            $("#go_ad").hide();
        }

        //设置右上角的规则页面
        if (JsHelper.enable) {
            if ((JsHelper.isIOSClient && versionCode >= 164) || (JsHelper.isAndroidClient && versionCode >= 251)) {
                //隐藏刷新按钮
                if (JsHelper.isAndroidClient) {
                    setTimeout(function () {
                        JsHelper.toggleRefresh(false);
                        JsHelper.unsetNavigationRightButton();
                        JsHelper.setNavigationRightButton("规则", function () {
                            location.href = "CheckInRule";
                        });
                    }, 100);
                } else {
                    JsHelper.toggleRefresh(false);
                    // JsHelper.unsetNavigationRightButton();
                    JsHelper.setNavigationRightButton("规则", function () {
                        location.href = "CheckInRule";
                    });
                }
            } else {
                $("#hid_rule").show();
            }
        } else {
            $("#hid_rule").show();
        }
        showSchedule();
        //上报曝光数据
        var param = {
            activityid: "q_new_qiandao",
            userid: userId, platform: platform,
            version: versionCode,
            logtime: new Date().Format("yyyy-MM-dd hh:mm:ss"),
            p1: 1
        };
        JsHelper.reportStatisticData(param);

    };

    return {
        init: init, doLottery: doLottery, checkIn: checkIn,
        recievePack: recievePack, reCheckIn: reCheckIn,
        confirmRecheckIn: confirmRecheckIn,
        addOrRemoveTimer: addOrRemoveTimer,
        goAdUrl: goAdUrl, goPackList: goPackList, goRecharge: goRecharge
    }

})();

$(function () {
    $(".dialog-close").on("click", function () {
        $(this).closest(".pop").hide();
    });
    Index.init();
});