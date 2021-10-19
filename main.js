/*
Wx:天氣描述
Pop:降雨機率
MinT:最低溫度
MaxT:最高溫度
*/

const swiperEl = document.querySelector('#swiper-wrapper');
const inputEl = document.querySelector('#input-search');
const btnSearch = document.querySelector('#btn-serch');
const townshipSlecetEl = document.querySelector('#townships');
/*各縣市api-Id*/
const citysId = {
    '宜蘭縣': '003',
    '桃園市': '007',
    '新竹縣': '011',
    '苗栗縣': '015',
    '彰化縣': '019',
    '南投縣': '023',
    '雲林縣': '027',
    '嘉義縣': '031',
    '屏東縣': '035',
    '臺東縣': '039',
    '花蓮縣': '043',
    '澎湖縣': '047',
    '基隆縣': '051',
    '新竹市': '055',
    '嘉義市': '059',
    '臺北市': '063',
    '高雄市': '067',
    '新北市': '071',
    '臺中市': '075',
    '臺南市': '079',
    '連江縣': '083',
    '金門縣': '087',
}
/*氣候圖by POP(0,1-25,26-50,51-80,81-100)*/
const WxIcons = {
    '晴天': `<i class="fas fa-sun"></i>`,
    '晴時多雲': `<i class="fas fa-cloud-sun"></i>`,
    '陰天': `<i class="fas fa-cloud" style="font-size:18px"></i>`,
    '晴時多雲偶陣雨': `<i class="fas fa-cloud-sun-rain"></i>`,
    '雨天': `<i class="fas fa-cloud-rain"></i>`,
}
/*星期*/
const weeks = {
    '0': '星期日',
    '1': '星期一',
    '2': '星期二',
    '3': '星期三',
    '4': '星期四',
    '5': '星期五',
    '6': '星期六',
}


const apiKey = 'CWB-CF46B11A-62D6-464D-A546-872BE0CF81B5';
//一般天氣預報-今明36小時
const apiCity = `https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=${apiKey}&limit=10&format=JSON&locationName=`;

let cityName = '桃園市';
const date = new Date();
const today = date.getDay();
const weeksByToday = getWeeks(today);
//default call
getTownShipWeathers(cityName)


btnSearch.addEventListener('click', function () {
    cityName = inputEl.value;
    getTownShipWeathers(cityName);
});
inputEl.addEventListener('keypress', function (ev) {
    if (ev.key === 'Enter') {
        cityName = inputEl.value;
        getTownShipWeathers(cityName);
    }
});
townshipSlecetEl.addEventListener('change', function (ev) {
    swiper.slideTo(this.selectedIndex, 100, false);
    console.log(this.selectedIndex);
});
//swiper event




async function fetchApi(api) {
    const resp = await fetch(api);
    const respData = await resp.json();
    console.log(respData.records.locations[0].location);
}

//取得某縣市各鄉鎮一周天氣
async function getTownShipWeathers(city) {
    console.log();
    //鄉鎮天氣預報-宜蘭市未來一周
    const apiTownShip = `https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-D0047-${citysId[city]}?Authorization=${apiKey}&elementName=T,MinT,MaxT,PoP12h,Wx`;
    try {
        const resp = await fetch(apiTownShip);
        const respData = await resp.json();
        const townShipsData = respData.records.locations[0].location;
        console.log(townShipsData);

        //reset clear
        swiperEl.innerHTML = '';
        townshipSlecetEl.innerHTML = '';

        townShipsData.forEach(function (item) {
            addWeatherSlide(item);
        });
        swiper.update();
        //更新下拉式選單(獨立)
        const options = townshipSlecetEl.childNodes;
        options[swiper.activeIndex].selected = 'selected';
    } catch (ex) {
        alert('輸入錯誤');
    }
}


//新增Swiper
function addWeatherSlide(townshipData) {
    const { locationName } = townshipData;
    const weArray = townshipData.weatherElement;
    //今日天氣
    const temp = weArray[1].time[0].elementValue[0].value;
    const wx = weArray[2].time[0].elementValue[0].value;
    // console.log('今日天氣:',locationName,temp,wx);
    //一周天氣
    const weekPop = getWeekPOP(weArray[0]);
    const weekWxIcon = getWeekWxIcon(weekPop);
    const weekMintT = getWeekMinT(weArray[3]);
    const weekMaxT = getWeekMaxT(weArray[4]);
    // console.log('一周天氣',weekPop,weekWxIcon,weekMintT,weekMaxT);
    const slide = document.createElement('div');
    slide.classList.add('swiper-slide');
    slide.innerHTML = `
        <div class="w-header">
            <div class="wrap">
                <div class="township-title">${cityName}.${locationName}</div>
            </div>

            <div class="w-info-wrap">
                <span id="temperature" class="bolder-caption">${temp}°</span>
                <span id="description" class="desc-text">${wx}</span>
            </div>
        </div>
        <div class="w-body">
            <ul id="week-weather" class="week-weather">

            </ul>
        </div>
    `;
    //一周天氣
    const weekEl = slide.querySelector('#week-weather');
    for (let d = 0; d < 7; d++) {
        const dayEl = document.createElement('li');
        dayEl.classList.add('day-info');
        dayEl.innerHTML = `
            <span class="day">${weeksByToday[d]}</span>
            <div class="w-desc">
                <span id="wx" class="wx">${weekWxIcon[d]}</span>
                <span id="pop" class="pop">${weekPop[d]}%</span>
                <span id="temp" class="temp">${weekMintT[d]}°~${weekMaxT[d]}°</span>
            </div>
        `;
        weekEl.appendChild(dayEl);
    }

    swiperEl.appendChild(slide);
    updateTownshipSelect(locationName);
}

//更新鄉鎮下拉式選單
function updateTownshipSelect(locatonName) {
    const optionEl = document.createElement('option');
    optionEl.innerHTML = `${locatonName}`;
    townshipSlecetEl.appendChild(optionEl);
}





//取的以今日一周星期排序
function getWeeks(_today) {
    const weeksArray = [];
    let dayId = _today;
    while (weeksArray.length < 7) {
        if (dayId >= 7) {
            dayId = 0;
        }
        weeksArray.push(weeks[dayId++]);
    }
    return weeksArray;
}

//取的一周降雨機率
function getWeekPOP(_pops) {
    const weekPop = [];
    _pops.time.forEach(function (item, idx) {
        if (idx % 2 === 0) {
            const pop = item.elementValue[0].value;
            weekPop.push((pop === ' ') ? '0' : pop);
        }
    });
    return weekPop;
}
//取得一周天氣描述
function getWeekWxIcon(_weekPop) {
    const weekWxIcon = [];
    _weekPop.forEach(function (item, idx) {
        const pop = parseInt(item);
        if (pop === 0) {
            weekWxIcon.push(WxIcons['晴天']);
        }
        else if (0 < pop && pop <= 25) {
            weekWxIcon.push(WxIcons['晴時多雲']);
        }
        else if (25 < pop && pop <= 50) {
            weekWxIcon.push(WxIcons['陰天']);
        }
        else if (50 < pop && pop <= 80) {
            weekWxIcon.push(WxIcons['晴時多雲偶陣雨']);
        }
        else {
            //if(90<pop && pop<=100)
            weekWxIcon.push(WxIcons['雨天']);
        }
    });
    return weekWxIcon;
}
//取的一周最低溫
function getWeekMinT(_minTs) {
    const weekMintT = [];
    _minTs.time.forEach(function (item, idx) {
        if (idx % 2 === 0) {
            weekMintT.push(item.elementValue[0].value);
        }
    });
    return weekMintT;
}
//取的一周最高溫
function getWeekMaxT(_maxT) {
    const weekMaxT = [];
    _maxT.time.forEach(function (item, idx) {
        if (idx % 2 === 0) {
            weekMaxT.push(item.elementValue[0].value);
        }
    });
    return weekMaxT;
}