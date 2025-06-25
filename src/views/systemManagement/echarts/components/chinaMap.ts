import zhongguo from '../mapInfo/chinaMap/data-china.json';
import hainan from '../mapInfo/chinaMap/data-hainan.json';
import xizang from '../mapInfo/chinaMap/data-xizang.json';
import zhejiang from '../mapInfo/chinaMap/data-zhejiang.json';
import yunnan from '../mapInfo/chinaMap/data-yunnan.json';
import xinjiang from '../mapInfo/chinaMap/data-xinjiang.json';
import tianjin from '../mapInfo/chinaMap/data-tianjin.json';
import sichuan from '../mapInfo/chinaMap/data-sichuan.json';
import shanxi from '../mapInfo/chinaMap/data-shanxi.json';
import shangxi from '../mapInfo/chinaMap/data-shangxi.json';
import shanghai from '../mapInfo/chinaMap/data-shanghai.json';
import shangdong from '../mapInfo/chinaMap/data-shangdong.json';
import qinghai from '../mapInfo/chinaMap/data-qinghai.json';
import ningxia from '../mapInfo/chinaMap/data-ningxia.json';
import neimenggu from '../mapInfo/chinaMap/data-neimenggu.json';
import liaoning from '../mapInfo/chinaMap/data-liaoning.json';
import jilin from '../mapInfo/chinaMap/data-jilin.json';
import jiangxi from '../mapInfo/chinaMap/data-jiangxi.json';
import jiangsu from '../mapInfo/chinaMap/data-jiangsu.json';
import hunan from '../mapInfo/chinaMap/data-hunan.json';
import hubei from '../mapInfo/chinaMap/data-hubei.json';
import henan from '../mapInfo/chinaMap/data-henan.json';
import heilongjiang from '../mapInfo/chinaMap/data-heilongjiang.json';
import hebei from '../mapInfo/chinaMap/data-hebei.json';
import guizhou from '../mapInfo/chinaMap/data-guizhou.json';
import guangxi from '../mapInfo/chinaMap/data-guangxi.json';
import guangdong from '../mapInfo/chinaMap/data-guangdong.json';
import gansu from '../mapInfo/chinaMap/data-gansu.json';
import chongqing from '../mapInfo/chinaMap/data-chongqing.json';
import aomen from '../mapInfo/chinaMap/data-aomen.json';
import anhui from '../mapInfo/chinaMap/data-anhui.json';
import beijing from '../mapInfo/chinaMap/data-beijing.json';
import fujian from '../mapInfo/chinaMap/data-fujian.json';
import xianggang from '../mapInfo/chinaMap/data-xianggang.json';

let curGeoJson = {};
const opt = {
  mapName: 'china', // 地图展示
  goDown: false, // 是否下钻
  bgColor: '#404a59', // 画布背景色
  activeArea: [], // 区域高亮,同echarts配置项
  data: [],
  // 下钻回调(点击的地图名、实例对象option、实例对象)
  callback: function (name, option, instance) {}
};
const pos = {
  leftPlus: 115,
  leftCur: 150,
  left: 198,
  top: 50
};
// style
const style = {
  font: '18px "Microsoft YaHei", sans-serif',
  textColor: '#eee',
  lineColor: 'rgba(147, 235, 248, .8)'
};
const cityMap = {
  中国: zhongguo,
  上海: shanghai,
  河北: hebei,
  山西: shangxi,
  内蒙古: neimenggu,
  辽宁: liaoning,
  吉林: jilin,
  黑龙江: heilongjiang,
  江苏: jiangsu,
  浙江: zhejiang,
  安徽: anhui,
  福建: fujian,
  江西: jiangxi,
  山东: shangdong,
  河南: henan,
  湖北: hubei,
  湖南: hunan,
  广东: guangdong,
  广西: guangxi,
  海南: hainan,
  四川: sichuan,
  贵州: guizhou,
  云南: yunnan,
  西藏: xizang,
  陕西: shanxi,
  甘肃: gansu,
  青海: qinghai,
  宁夏: ningxia,
  新疆: xinjiang,
  北京: beijing,
  天津: tianjin,
  重庆: chongqing,
  香港: xianggang,
  澳门: aomen
};

let name = [opt.mapName];
let idx = 0;
let line = [
  [0, 0],
  [8, 11],
  [0, 22]
];
let handleEvents = {
  /**
   * i 实例对象
   * o option
   * n 地图名
   **/
  resetOption: function (i, o, n) {
    let breadcrumb = this.createBreadcrumb(n);
    let j = name.indexOf(n);
    let l = o.graphic.length;
    if (j < 0) {
      o.graphic.push(breadcrumb);
      o.graphic[0].children[0].shape.x2 = 145;
      o.graphic[0].children[1].shape.x2 = 145;
      if (o.graphic.length > 2) {
        let cityData = [];
        let cityJson;
        for (let x = 0; x < opt.data.length; x++) {
          if (n === opt.data[x].city) {
            [opt.data[x]].forEach((index, data)=> {
              cityJson = {
                city: data.city,
                name: data.name,
                value: data.value,
                crew: data.crew,
                company: data.company,
                position: data.position,
                region: data.region
              };
              cityData.push(cityJson);
            });
          }
        }

        if (cityData != null) {
          o.series[0].data = handleEvents.initSeriesData(cityData);
        } else {
          o.series[0].data = [];
        }
      }
      name.push(n);
      idx++;
    } else {
      o.graphic.splice(j + 2, l);
      if (o.graphic.length <= 2) {
        o.graphic[0].children[0].shape.x2 = 60;
        o.graphic[0].children[1].shape.x2 = 60;
        o.series[0].data = handleEvents.initSeriesData(opt.data);
      }
      name.splice(j + 1, l);
      idx = j;
      pos.leftCur -= pos.leftPlus * (l - j - 1);
    }

    o.geo.map = n;
    o.geo.zoom = 0.4;
    i.clear();
    i.setOption(o);
    this.zoomAnimation();
    opt.callback(n, o, i);
  },

  /**
   * name 地图名
   **/
  createBreadcrumb: function (name) {
    let cityToPinyin = {
      中国: 'zhongguo',
      上海: 'shanghai',
      河北: 'hebei',
      山西: 'shangxi',
      内蒙古: 'neimenggu',
      辽宁: 'liaoning',
      吉林: 'jilin',
      黑龙江: 'heilongjiang',
      江苏: 'jiangsu',
      浙江: 'zhejiang',
      安徽: 'anhui',
      福建: 'fujian',
      江西: 'jiangxi',
      山东: 'shangdong',
      河南: 'henan',
      湖北: 'hubei',
      湖南: 'hunan',
      广东: 'guangdong',
      广西: 'guangxi',
      海南: 'hainan',
      四川: 'sichuan',
      贵州: 'guizhou',
      云南: 'yunnan',
      西藏: 'xizang',
      陕西: 'shanxi',
      甘肃: 'gansu',
      青海: 'qinghai',
      宁夏: 'ningxia',
      新疆: 'xinjiang',
      北京: 'beijing',
      天津: 'tianjin',
      重庆: 'chongqing',
      香港: 'xianggang',
      澳门: 'aomen'
    };
    let breadcrumb = {
      type: 'group',
      id: name,
      left: pos.leftCur + pos.leftPlus,
      top: pos.top + 3,
      children: [
        {
          type: 'polyline',
          left: -90,
          top: -5,
          shape: {
            points: line
          },
          style: {
            stroke: '#fff',
            key: name
            // lineWidth: 2,
          },
          onclick: function () {
            let name = this.style.key;
            handleEvents.resetOption(chart, option, name);
          }
        },
        {
          type: 'text',
          left: -68,
          top: 'middle',
          style: {
            text: name,
            textAlign: 'center',
            fill: style.textColor,
            font: style.font
          },
          onclick: function () {
            let name = this.style.text;
            handleEvents.resetOption(chart, option, name);
          }
        },
        {
          type: 'text',
          left: -68,
          top: 10,
          style: {
            name: name,
            text: cityToPinyin[name] ? cityToPinyin[name].toUpperCase() : '',
            textAlign: 'center',
            fill: style.textColor,
            font: '12px "Microsoft YaHei", sans-serif'
          },
          onclick: function () {
            // console.log(this.style);
            let name = this.style.name;
            handleEvents.resetOption(chart, option, name);
          }
        }
      ]
    };

    pos.leftCur += pos.leftPlus;

    return breadcrumb;
  },

  // 设置effectscatter
  initSeriesData: function (data) {
    let temp = [];
    for (let i = 0; i < data.length; i++) {
      let geoCoord = geoCoordMap[data[i].name];
      if (geoCoord) {
        temp.push({
          name: data[i].name,
          value: geoCoord.concat(data[i].value),
          crew: data[i].crew,
          company: data[i].company,
          position: data[i].position,
          region: data[i].region
        });
      }
    }
    return temp;
  },
  zoomAnimation: function () {
    let count = null;
    let zoom = function (per) {
      if (!count) count = per;
      count = count + per;
      // console.log(per,count);
      chart.setOption({
        geo: {
          zoom: count
        }
      });
      if (count < 1)
        window.requestAnimationFrame(function () {
          zoom(0.2);
        });
    };
    window.requestAnimationFrame(function () {
      zoom(0.2);
    });
  }
};
export const chinaOption = {
  backgroundColor: opt.bgColor,
  tooltip: {
    show: true,
    trigger: 'item',
    alwaysShowContent: false,
    backgroundColor: 'rgba(50,50,50,0.7)',
    hideDelay: 100,
    triggerOn: 'mousemove',
    enterable: true,
    position: ['60%', '70%'],
    formatter: function (params, ticket, callback) {
      return (
        '简称：' +
        params.data.name +
        '<br/>' +
        '机组：' +
        params.data.crew +
        '万千瓦' +
        '<br/>' +
        '公司名称：' +
        params.data.company +
        '<br/>' +
        '所属大区：' +
        params.data.region +
        '<br/>' +
        '所在位置：' +
        params.data.position
      );
    }
  },
  graphic: [
    {
      type: 'group',
      left: pos.left,
      top: pos.top - 4,
      children: [
        {
          type: 'line',
          left: 0,
          top: -20,
          shape: {
            x1: 0,
            y1: 0,
            x2: 60,
            y2: 0
          },
          style: {
            stroke: style.lineColor
          }
        },
        {
          type: 'line',
          left: 0,
          top: 20,
          shape: {
            x1: 0,
            y1: 0,
            x2: 60,
            y2: 0
          },
          style: {
            stroke: style.lineColor
          }
        }
      ]
    },
    {
      id: name[idx],
      type: 'group',
      left: pos.left + 2,
      top: pos.top,
      children: [
        {
          type: 'polyline',
          left: 90,
          top: -12,
          shape: {
            points: line
          },
          style: {
            stroke: 'transparent',
            key: name[0]
          },
          onclick: function () {
            let name = this.style.key;
            handleEvents.resetOption(chart, option, name);
          }
        },
        {
          type: 'text',
          left: 0,
          top: 'middle',
          style: {
            text: '中国',
            textAlign: 'center',
            fill: style.textColor,
            font: style.font
          },
          onclick: function () {
            handleEvents.resetOption(chart, option, '中国');
          }
        },
        {
          type: 'text',
          left: 0,
          top: 10,
          style: {
            text: 'China',
            textAlign: 'center',
            fill: style.textColor,
            font: '12px "Microsoft YaHei", sans-serif'
          },
          onclick: function () {
            handleEvents.resetOption(chart, option, '中国');
          }
        }
      ]
    }
  ],
  geo: {
    map: opt.mapName,
    roam: true,
    zoom: 1,
    label: {
      normal: {
        show: true,
        textStyle: {
          color: '#fff'
        }
      },
      emphasis: {
        textStyle: {
          color: '#fff'
        }
      }
    },
    itemStyle: {
      normal: {
        borderColor: 'rgba(147, 235, 248, 1)',
        borderWidth: 1,
        areaColor: {
          type: 'radial',
          x: 0.5,
          y: 0.5,
          r: 0.8,
          colorStops: [
            {
              offset: 0,
              color: 'rgba(147, 235, 248, 0)' // 0% 处的颜色
            },
            {
              offset: 1,
              color: 'rgba(147, 235, 248, .2)' // 100% 处的颜色
            }
          ],
          globalCoord: false // 缺省为 false
        },
        shadowColor: 'rgba(128, 217, 248, 1)',
        // shadowColor: 'rgba(255, 255, 255, 1)',
        shadowOffsetX: -2,
        shadowOffsetY: 2,
        shadowBlur: 10
      },
      emphasis: {
        areaColor: '#389BB7',
        borderWidth: 0
      }
    },
    regions: opt.activeArea.map(function (item) {
      if (typeof item !== 'string') {
        return {
          name: item.name,
          itemStyle: {
            normal: {
              areaColor: item.areaColor || '#389BB7'
            }
          },
          label: {
            normal: {
              show: item.showLabel,
              textStyle: {
                color: '#fff'
              }
            }
          }
        };
      } else {
        return {
          name: item,
          itemStyle: {
            normal: {
              borderColor: '#91e6ff',
              areaColor: '#389BB7'
            }
          }
        };
      }
    })
  },
  series: [
    {
      type: 'effectScatter',
      coordinateSystem: 'geo',
      showEffectOn: 'render',
      rippleEffect: {
        period: 15,
        scale: 4,
        brushType: 'fill'
      },
      hoverAnimation: true,
      itemStyle: {
        normal: {
          color: '#FFC848',
          shadowBlur: 10,
          shadowColor: '#333'
        }
      },
      data: handleEvents.initSeriesData(opt.data)
    }
  ]
};
