import * as echarts from '../../ec-canvas/echarts.min.js';
const baseDate = getDateText(new Date());
const lastDate = getDateText(new Date(new Date().setDate(new Date().getDate()+7)));
const dataRules = [
    {
        'place': '地点1',
        'timeGroup': [
            {
                'weekday': [0, 1, 3, 5],
                'time': [
                    ['9:00', '11:30'], ['13:30', '16:00'], ['18:00','20:00']
                ]
            },
            {
                'weekday': [2, 4, 6],
                'time': [
                    ['13:30', '16:00']
                ]
            }
        ]
    },
    {
        'place': '地点2',
        'timeGroup': [
            {
                'weekday': [0, 1, 2, 3, 4, 5, 6],
                'time': [
                    ['7:30', '10:30'], ['17:30', '20:30']
                ]
            }
        ]
    },
    {
        'place': '地点3',
        'timeGroup': [
            {
                'weekday': [0, 1, 2, 3, 4, 5, 6],
                'time': [
                    ['7:00', '10:30'], ['18:30', '21:00']
                ]
            }
        ]
    },
    {
        'place': '地点4',
        'timeGroup': [
            {
                'weekday': [0, 1, 2, 3, 4, 5, 6],
                'time': [
                    ['8:00', '16:00']
                ]
            }
        ]
    }
];
const dataCache = {
    categories:[],
    canvasData:{}
};
function generateDataES6() {
    for (let [category, index] of dataRules) {
        categories.push(category);
        for (let timeGroup of category.timeGroup) {
            if (timeGroup.contains(weekDay)) {
                for (let timeSheet of timeGroup.time) {
                    const withDateTime = timeSheet.map(item => `${baseDate} item`);
                    data.push({
                        name: category.place,
                        value: [index, withDateTime[0], withDateTime[2]]
                    });
                }
            }
        }
    }
}
function getDateText(dateObj){
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth()+1;
    const monthD = month<10?`0${month}`:month;
    const date = dateObj.getDate();
    const dateD = date<10?`0${date}`:date;
    return `${year}-${monthD}-${dateD}`;
}
function getWeekDay(date){
    return +new Date(date).getDay();
}
function getWeekDayText(date){
    const weekDayText = {0:"天",1:'一',2:'二',3:'三',4:'四',5:'五',6:'六'};
    return weekDayText[getWeekDay(date)];
}
function generateCanvasData(date) {
    const weekDay = getWeekDay(date);
    if(dataCache.canvasData[date]===undefined){
        dataCache.categories = [];
        const dateData = [];
        dataRules.forEach(function (category, index) {
            dataCache.categories.push(category.place);
            category.timeGroup.forEach(function (timeGroup) {
                if (timeGroup.weekday.indexOf(weekDay) !== -1) {
                    timeGroup.time.forEach(function (timeSheet) {
                        const withDateTime = timeSheet.map(item => `${date} ${item}`);
                        dateData.push({
                            name: category.place,
                            value: [index, withDateTime[0], withDateTime[1]]
                        });
                    });
                }
            });
        });
        dataCache.canvasData[date]=dateData;
    }
    return dataCache.canvasData[date];
}
const colorSets={
    text:'#6d6e62',
    line:'#b1b39f',
    bar:'#bfd508',
    bg:'rgba(245, 245, 245, 1)'
}
const axisDesign = {
    axisTick: {
        show: true,
        lineStyle: {
            color: colorSets.line
        }
    },
    axisLine: {
        show: true,
        lineStyle: {
            color: colorSets.line
        }
    },
    splitLine: {
        show: true,
        lineStyle: {
            color: colorSets.line
        }
    },
    axisLabel: {
        color: colorSets.text
    }
}
const canvasOptions = {
    grid: {
        show: true,
        left:'20%',
        top:'5%',
        bottom:'5%',
        backgroundColor: colorSets.bg
    },
    xAxis: {
        data: [],
        axisTick:axisDesign.axisTick,
        axisLine:axisDesign.axisLine,
        splitLine:axisDesign.splitLine,
        axisLabel:axisDesign.axisLabel
    },
    yAxis: {
        type: 'time',
        inverse: true,
        //interval: 1800 * 1000,
        min: 'dataMin',//axisStartTime,
        max: function (value) {
            return value.max + 30;
        },
        splitNumber: 28,
        axisLabel: {
            formatter: {
                minute: '{HH}:{mm}'
            },
        },
        axisTick:axisDesign.axisTick,
        axisLine:axisDesign.axisLine,
        splitLine:axisDesign.splitLine,
        axisLabel:axisDesign.axisLabel
    },
    series: [
        { name: '', type: 'bar', data: [] },
        { name: '', type: 'bar', data: [] },
        { name: '', type: 'bar', data: [] },
        {
            type: 'custom',
            renderItem: function (params, api) {
                const categoryIndex = api.value(0);
                const start = api.coord([categoryIndex, api.value(1)]);
                const end = api.coord([categoryIndex, api.value(2)]);
                const width = api.size([0, 1])[0];
                const rectShape = echarts.graphic.clipRectByRect(
                    {
                        x: start[0] - width / 2,
                        y: start[1],
                        width: width,
                        height: end[1] - start[1]
                    },
                    {
                        x: params.coordSys.x,
                        y: params.coordSys.y,
                        width: params.coordSys.width,
                        height: params.coordSys.height
                    }
                );
                return (
                    rectShape && {
                        type: 'rect',
                        transition: ['shape'],
                        shape: rectShape,
                        style: api.style({ fill: colorSets.bar,opacity:0.7 })
                    }
                );
            },
            encode: {
                x: 0,
                y: [1, 2]
            },
            data: []
        }
    ]
};
function generateCanvasOptions(date){
    canvasOptions.series[3].data = generateCanvasData(date);
    canvasOptions.xAxis.data = dataCache.categories;
    return canvasOptions;
}
Page({
    data: {
        ec: {
            lazyLoad: true
        },
        baseDate: baseDate,
        date: baseDate,
        lastDate: lastDate,
        weekDay:""
    },
    bindDateChange: function(e) {
        this.setData({
          date: e.detail.value,
          weekDay: getWeekDayText(e.detail.value)
        })
        this.refreshBar(e.detail.value);
      },
    onReady: function () {
        this.setData({
            weekDay: getWeekDayText(baseDate)
        })
        this.compBar = this.selectComponent('#mychart-dom-bar')
        this.initBar(generateCanvasOptions(baseDate));
    },
    initBar: function (options) {
        this.compBar.init((canvas, width, height, dpr) => {
            const chart = echarts.init(canvas, null, {
                width: width,
                height: height,
                devicePixelRatio: dpr
            });
            chart.setOption(options)
            return chart;
        })
    },
    refreshBar: function(date){
        this.compBar.chart.setOption(generateCanvasOptions(date),{notMerge: true});
    }
});
