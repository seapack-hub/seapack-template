import _zhongguo from '../mapInfo/chinaMap/data-china.json';
import _hainan from '../mapInfo/chinaMap/data-hainan.json';
import _xizang from '../mapInfo/chinaMap/data-xizang.json';
import _zhejiang from '../mapInfo/chinaMap/data-zhejiang.json';
import _yunnan from '../mapInfo/chinaMap/data-yunnan.json';
import _xinjiang from '../mapInfo/chinaMap/data-xinjiang.json';
import _tianjin from '../mapInfo/chinaMap/data-tianjin.json';
import _sichuan from '../mapInfo/chinaMap/data-sichuan.json';
import _shanxi from '../mapInfo/chinaMap/data-shanxi.json';
import _shangxi from '../mapInfo/chinaMap/data-shangxi.json';
import _shanghai from '../mapInfo/chinaMap/data-shanghai.json';
import _shangdong from '../mapInfo/chinaMap/data-shangdong.json';
import _qinghai from '../mapInfo/chinaMap/data-qinghai.json';
import _ningxia from '../mapInfo/chinaMap/data-ningxia.json';
import _neimenggu from '../mapInfo/chinaMap/data-neimenggu.json';
import _liaoning from '../mapInfo/chinaMap/data-liaoning.json';
import _jilin from '../mapInfo/chinaMap/data-jilin.json';
import _jiangxi from '../mapInfo/chinaMap/data-jiangxi.json';
import _jiangsu from '../mapInfo/chinaMap/data-jiangsu.json';
import _hunan from '../mapInfo/chinaMap/data-hunan.json';
import _hubei from '../mapInfo/chinaMap/data-hubei.json';
import _henan from '../mapInfo/chinaMap/data-henan.json';
import _heilongjiang from '../mapInfo/chinaMap/data-heilongjiang.json';
import _hebei from '../mapInfo/chinaMap/data-hebei.json';
import _guizhou from '../mapInfo/chinaMap/data-guizhou.json';
import _guangxi from '../mapInfo/chinaMap/data-guangxi.json';
import _guangdong from '../mapInfo/chinaMap/data-guangdong.json';
import _gansu from '../mapInfo/chinaMap/data-gansu.json';
import _chongqing from '../mapInfo/chinaMap/data-chongqing.json';
import _aomen from '../mapInfo/chinaMap/data-aomen.json';
import _anhui from '../mapInfo/chinaMap/data-anhui.json';
import _beijing from '../mapInfo/chinaMap/data-beijing.json';
import _fujian from '../mapInfo/chinaMap/data-fujian.json';
import _xianggang from '../mapInfo/chinaMap/data-xianggang.json';

/** GeoJSON data for ECharts map registration: usage: echarts.registerMap(provinceName, mapData[name]) */
export const mapData: Record<string, any> = {
  zhongguo: _zhongguo,
  hainan: _hainan,
  xizang: _xizang,
  zhejiang: _zhejiang,
  yunnan: _yunnan,
  xinjiang: _xinjiang,
  tianjin: _tianjin,
  sichuan: _sichuan,
  shanxi: _shanxi,
  shangxi: _shangxi,
  shanghai: _shanghai,
  shangdong: _shangdong,
  qinghai: _qinghai,
  ningxia: _ningxia,
  neimenggu: _neimenggu,
  liaoning: _liaoning,
  jilin: _jilin,
  jiangxi: _jiangxi,
  jiangsu: _jiangsu,
  hunan: _hunan,
  hubei: _hubei,
  henan: _henan,
  heilongjiang: _heilongjiang,
  hebei: _hebei,
  guizhou: _guizhou,
  guangxi: _guangxi,
  guangdong: _guangdong,
  gansu: _gansu,
  chongqing: _chongqing,
  aomen: _aomen,
  anhui: _anhui,
  beijing: _beijing,
  fujian: _fujian,
  xianggang: _xianggang
};

const opt = {
  mapName: 'china',
  goDown: false,
  bgColor: '#404a59',
  activeArea: [] as (string | { name: string; areaColor?: string; showLabel?: boolean })[],
  data: [] as any[],
  callback: function (_name: string, _option: any, _instance: any) {}
};

const pos = {
  leftPlus: 115,
  leftCur: 150,
  left: 198,
  top: 50
};

const style = {
  font: '18px "Microsoft YaHei", sans-serif' as const,
  textColor: '#eee',
  lineColor: 'rgba(147, 235, 248, .8)'
};

const cityToPinyin: Record<string, string> = {
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

const geoCoordMap: Record<string, [number, number]> = {};

let name = [opt.mapName];
let idx = 0;
const line: [number, number][] = [
  [0, 0],
  [8, 11],
  [0, 22]
];

interface BreadcrumbData {
  city?: string;
  name?: string;
  value?: number;
  crew?: string;
  company?: string;
  position?: string;
  region?: string;
}

let chart: any = null;
let option: any = null;

const handleEvents = {
  resetOption(i: any, o: any, n: string) {
    const breadcrumb = this.createBreadcrumb(n);
    const j = name.indexOf(n);
    const l = o.graphic.length;
    if (j < 0) {
      o.graphic.push(breadcrumb);
      o.graphic[0].children[0].shape.x2 = 145;
      o.graphic[0].children[1].shape.x2 = 145;
      if (o.graphic.length > 2) {
        const cityData: BreadcrumbData[] = [];
        for (let x = 0; x < opt.data.length; x++) {
          if (n === opt.data[x].city) {
            const item = opt.data[x];
            cityData.push({
              city: item.city,
              name: item.name,
              value: item.value,
              crew: item.crew,
              company: item.company,
              position: item.position,
              region: item.region
            });
          }
        }
        o.series[0].data = cityData.length > 0 ? handleEvents.initSeriesData(cityData) : [];
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
    handleEvents.zoomAnimation();
    opt.callback(n, o, i);
  },

  createBreadcrumb(n: string) {
    const breadcrumb = {
      type: 'group',
      id: n,
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
            key: n
          },
          onclick: function (this: any) {
            handleEvents.resetOption(chart, option, this.style.key);
          }
        },
        {
          type: 'text',
          left: -68,
          top: 'middle',
          style: {
            text: n,
            textAlign: 'center',
            fill: style.textColor,
            font: style.font
          },
          onclick: function (this: any) {
            handleEvents.resetOption(chart, option, this.style.text);
          }
        },
        {
          type: 'text',
          left: -68,
          top: 10,
          style: {
            name: n,
            text: cityToPinyin[n] ? cityToPinyin[n].toUpperCase() : '',
            textAlign: 'center',
            fill: style.textColor,
            font: '12px "Microsoft YaHei", sans-serif'
          },
          onclick: function (this: any) {
            handleEvents.resetOption(chart, option, this.style.name);
          }
        }
      ]
    };

    pos.leftCur += pos.leftPlus;
    return breadcrumb;
  },

  initSeriesData(data: BreadcrumbData[]) {
    const temp: any[] = [];
    for (let i = 0; i < data.length; i++) {
      const geoCoord = geoCoordMap[data[i].name!];
      if (geoCoord) {
        temp.push({
          name: data[i].name,
          value: geoCoord.concat(data[i].value ?? 0),
          crew: data[i].crew,
          company: data[i].company,
          position: data[i].position,
          region: data[i].region
        });
      }
    }
    return temp;
  },

  zoomAnimation() {
    let count: number | null = null;
    const zoom = (per: number) => {
      if (!count) count = per;
      count = count + per;
      chart.setOption({
        geo: {
          zoom: count
        }
      });
      if (count < 1) {
        window.requestAnimationFrame(() => zoom(0.2));
      }
    };
    window.requestAnimationFrame(() => zoom(0.2));
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
    formatter: function (params: any) {
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
          onclick: function (this: any) {
            handleEvents.resetOption(chart, option, this.style.key);
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
      show: true,
      color: '#fff'
    },
    emphasis: {
      label: {
        color: '#fff'
      },
      itemStyle: {
        areaColor: '#389BB7',
        borderWidth: 0
      }
    },
    itemStyle: {
      borderColor: 'rgba(147, 235, 248, 1)',
      borderWidth: 1,
      areaColor: {
        type: 'radial',
        x: 0.5,
        y: 0.5,
        r: 0.8,
        colorStops: [
          { offset: 0, color: 'rgba(147, 235, 248, 0)' },
          { offset: 1, color: 'rgba(147, 235, 248, .2)' }
        ],
        globalCoord: false
      },
      shadowColor: 'rgba(128, 217, 248, 1)',
      shadowOffsetX: -2,
      shadowOffsetY: 2,
      shadowBlur: 10
    },
    regions: opt.activeArea.map(function (item) {
      if (typeof item !== 'string') {
        return {
          name: item.name,
          itemStyle: {
            areaColor: item.areaColor || '#389BB7',
            borderColor: '#91e6ff'
          },
          label: {
            show: item.showLabel,
            color: '#fff'
          }
        };
      }
      return {
        name: item,
        itemStyle: {
          borderColor: '#91e6ff',
          areaColor: '#389BB7'
        }
      };
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
        color: '#FFC848',
        shadowBlur: 10,
        shadowColor: '#333'
      },
      data: handleEvents.initSeriesData(opt.data)
    }
  ]
};
