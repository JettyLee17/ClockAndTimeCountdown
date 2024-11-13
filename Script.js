function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const timeString = `${hours}:${minutes}:${seconds}`; // 显示秒
    document.getElementById('clock').textContent = timeString;

    // 更新日历信息
    updateCalendar(now);
}

function updateCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekDays = ["日", "一", "二", "三", "四", "五", "六"];
    const weekDay = weekDays[date.getDay()];

    const dateString = `${year}年${month}月${day}日 星期${weekDay}`;
    document.getElementById('calendar').textContent = dateString;

    // 更新农历信息
    updateLunarCalendar(year, month, day);
}

function updateLunarCalendar(year, month, day) {
    const lunarResult = calendar.solar2lunar(year, month, day);
    const lunarYear = convertToChineseNumber(lunarResult.lYear);

    // 计算天干地支
    const Stem = lunarResult.gzYear;
    const zodiac = lunarResult.Animal;

    const lunarDateString =
        `${lunarYear} ${Stem} ${zodiac}年 ${lunarResult.IMonthCn} ${lunarResult.IDayCn}`;

    const festival = lunarResult.festival ? `节日：${lunarResult.festival}` : '';
    const lunarFestival = lunarResult.lunarFestival ? `农历节日：${lunarResult.lunarFestival}` : '';
    const term = lunarResult.Term ? `节气：${lunarResult.Term}` : '';


    const additionalInfo = festival || lunarFestival || term ?
        `${festival} ${lunarFestival} ${term}` : ` 又是平凡的一天`;

    document.getElementById('lunar').textContent = lunarDateString;
    document.getElementById('festival').textContent = additionalInfo;
}



function convertToChineseNumber(num) {
    const chineseNumbers = ["〇", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
    return String(num).split('').map(digit => chineseNumbers[+digit]).join('');
}

setInterval(updateClock, 1000);
updateClock();


/*时间进度条*/
function updateProgress() {
    const now = new Date();

    // 计算进度的函数
    function calculateProgress(start, end) {
        return (now - start) / (end - start) * 100;
    }

    // 计算并设置进度条
    function setProgress(elementId, start, end, textId) {
        const progress = calculateProgress(start, end);
        const remainingProgress = 100 - progress; // 剩余进度
        const progressBar = document.getElementById(elementId);
        const progressText = document.getElementById(textId);
        progressBar.style.width = remainingProgress + "%"; // 更新进度条宽度
        progressBar.style.backgroundColor = getColor(remainingProgress); // 设置颜色
        progressText.textContent = Math.floor(remainingProgress) + "%"; // 显示百分比
    }

    // 根据剩余进度计算颜色
    function getColor(remainingProgress) {
        let red, green;

        if (remainingProgress >= 50) {
            // 从橙色到绿色
            red = Math.floor((100 - remainingProgress) * 2.55); // 0-50对应255到0
            green = 255; // 始终为255
        } else {
            // 从红色到橙色
            red = 255; // 始终为255
            green = Math.floor(remainingProgress * 5.1); // 0-50对应0到255
        }

        return `rgb(${red}, ${green}, 0)`; // 返回RGB颜色
    }

    // 今年
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear() + 1, 0, 1);
    setProgress("year-progress", startOfYear, endOfYear, "year-text");

    // 这个月
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    setProgress("month-progress", startOfMonth, endOfMonth, "month-text");

    // 这个星期
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1)); // 设置为本周一
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7); // 设置为下周一
    setProgress("week-progress", startOfWeek, endOfWeek, "week-text");

    // 今天
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    setProgress("day-progress", startOfDay, endOfDay, "day-text");

}

// 初始更新
updateProgress();
// 每分钟更新一次
setInterval(updateProgress, 60000);


/*下一个节日或节气*/
// 获取今天的日期
var today = new Date(); // 设置为2024-11-12
var todayYear = today.getFullYear();
var todayMonth = today.getMonth() + 1; // getMonth() 返回0-11，表示1-12月
var todayDay = today.getDate();

// 转换今天的公历日期为农历
var todayLunar = calendar.solar2lunar(todayYear, todayMonth, todayDay);

// 获取所有节日和节气
var allFestivals = Object.assign({}, calendar.getFestival(), calendar.getLunarFestival());
var allSolarTerms = todayLunar.allSolarTerms;

// 计算下一个节日或节气的日期
function getNextEventDate(todayLunar, todayYear, todayMonth, todayDay) {
    var nextEventDate = null;
    var minDays = Infinity;

    // 遍历阳历节日(没问题)
    for (var date in calendar.festival) {
        var [month, day] = date.split('-').map(Number);
        var eventYear = month < todayMonth || (month === todayMonth && day <= todayDay) ? todayYear + 1 : todayYear;
        var eventDate = new Date(eventYear, month - 1, day);
        var daysDiff = (eventDate - today) / (1000 * 60 * 60 * 24);
        if (daysDiff >= 0 && daysDiff < minDays) {
            minDays = daysDiff;
            nextEventDate = { date: eventDate, type: 'solar', name: calendar.festival[date].title };
        }
    }

    // 遍历农历节日（没问题）
    for (var lDate in calendar.lFestival) {
        var [lMonth, lDay] = lDate.split('-').map(Number);
        var lYear = todayLunar.lYear;
        if (lMonth < todayLunar.lMonth || (lMonth === todayLunar.lMonth && lDay <= todayLunar.lDay)) {
            lYear += 1; // 如果农历节日在当前月份之前，考虑下一年的节日
        }
        var solarDate = calendar.lunar2solar(lYear, lMonth, lDay, lMonth === calendar.leapMonth(lYear));
        if (solarDate !== -1) {
            var eventDate = new Date(solarDate.cYear, solarDate.cMonth - 1, solarDate.cDay);
            var daysDiff = (eventDate - today) / (1000 * 60 * 60 * 24);
            if (daysDiff >= 0 && daysDiff < minDays) {
                minDays = daysDiff;
                nextEventDate = { date: eventDate, type: 'lunar', name: calendar.lFestival[lDate].title };
            }
        }
    }

    // // 遍历节气
    // for (var i = 1; i <= 24; i++) {
    //     var termDay = calendar.getTerm(todayYear, i);
    //     var termDate = new Date(todayYear, todayMonth - 1, termDay);
    //     var daysDiff = (termDate - today) / (1000 * 60 * 60 * 24);
    //     if (daysDiff < 0) { // 如果当前节气已经过去，考虑下一年的节气
    //         termDay = calendar.getTerm(todayYear + 1, i);
    //         termDate = new Date(todayYear + 1, 0, termDay);
    //         daysDiff = (termDate - today) / (1000 * 60 * 60 * 24);
    //     }
    //     if (daysDiff >= 0 && daysDiff < minDays) {
    //         minDays = daysDiff;
    //         nextEventDate = { date: termDate, type: 'term', name: allSolarTerms[i - 1] };
    //     }
    // }

    return { nextEventDate: nextEventDate, days: Math.round(minDays) - 1 };
}

// 获取下一个节日或节气的日期和倒计时天数
var nextEvent = getNextEventDate(todayLunar, todayYear, todayMonth, todayDay);
//document.getElementById('nextEvent').innerText = '距离 ' + nextEvent.nextEventDate.name + ' 还有' + nextEvent.days + '天';


/*倒计时显示*/
function updateRemainingTime() {
    const now = new Date();
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999); // 设置为今天的结束时间

    const remainingTime = endOfDay - now; // 计算剩余时间（毫秒）

    if (remainingTime >= 0) {
        const hours = Math.floor((remainingTime / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((remainingTime / (1000 * 60)) % 60);
        const seconds = Math.floor((remainingTime / 1000) % 60);

        // 更新显示
        document.getElementById("remaining-time1").innerText =
            `${hours}时 ${minutes}分 ${seconds}秒`;
        // 更新显示
        document.getElementById("remaining-time2").innerText =
            `${hours}时 ${minutes}分 ${seconds}秒`;
        // 更新显示
        document.getElementById("remaining-time3").innerText =
            `${hours}时 ${minutes}分 ${seconds}秒`;
        // 更新显示
        document.getElementById("remaining-time4").innerText =
            `${hours}时 ${minutes}分 ${seconds}秒`;
        // 更新显示
        document.getElementById("nextEvent").innerText =
            '距离 ' + nextEvent.nextEventDate.name + ' 还有 ' + nextEvent.days + '天 ' +
            `${hours}时 ${minutes}分 ${seconds}秒`;
    } else {
        document.getElementById("remaining-time1").innerText = "今天已经结束";
    }
}

// 每秒更新一次剩余时间
setInterval(updateRemainingTime, 1000);
// 初始化显示时间
updateRemainingTime();


function updateRemainingWeek() {
    const now = new Date();
    let currentDay = now.getDay(); // 当前星期几（0-6）

    // 将星期日（0）转换为星期值 7
    currentDay = currentDay === 0 ? 7 : currentDay;

    // 计算还剩多少天，星期一是1，星期天是7
    const daysRemaining = 7 - currentDay;

    // 更新显示
    document.getElementById("remaining-week").innerText = `${daysRemaining}天`;
}

// 初始化显示星期剩余天数
updateRemainingWeek();


function updateRemainingDaysThisMonth() {
    const now = new Date();
    const currentMonth = now.getMonth(); // 当前月份（0-11）
    const currentYear = now.getFullYear(); // 当前年份

    // 获取下个月的第一天
    const nextMonth = new Date(currentYear, currentMonth + 1, 1);
    // 获取本月的最后一天
    const lastDayOfMonth = new Date(nextMonth - 1);
    const daysInMonth = lastDayOfMonth.getDate(); // 本月的天数
    const currentDate = now.getDate(); // 当前日

    const remainingDays = daysInMonth - currentDate; // 计算还剩多少天

    // 更新显示
    document.getElementById("remaining-days-this-month").innerText = `${remainingDays}天`;
}

// 初始化显示本月剩余天数
updateRemainingDaysThisMonth();


function updateRemainingDaysThisYear() {
    const now = new Date();
    const currentYear = now.getFullYear(); // 当前年份
    const endOfYear = new Date(currentYear + 1, 0, 1); // 新年的第一天
    const remainingTime = endOfYear - now; // 计算今年还剩的时间（毫秒）

    // 计算还剩多少天
    const remainingDays = Math.ceil(remainingTime / (1000 * 60 * 60 * 24)) - 1; // 转换为天数

    // 更新显示
    document.getElementById("remaining-days-this-year").innerText = `${remainingDays}天`;
}

// 初始化显示今年剩余天数
updateRemainingDaysThisYear();
