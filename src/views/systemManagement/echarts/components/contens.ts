//chinaMap 数据
const data = [
  {
    name: '内蒙古',
    itemStyle: {
      areaColor: '#56b1da'
    },
    value: [110.3467, 41.4899]
  }
];
export const chinaMapOption = {
  backgroundColor: '#ffffff',
  // geo: {
  //   map: 'china',
  //   aspectScale: 0.8,
  //   layoutCenter: ['50%', '50%'],
  //   layoutSize: '120%',
  //   itemStyle: {
  //     normal: {
  //       areaColor: {
  //         type: 'linear-gradient',
  //         x: 0,
  //         y: 1200,
  //         x2: 1000,
  //         y2: 0,
  //         colorStops: [
  //           {
  //             offset: 0,
  //             color: '#152E6E' // 0% 处的颜色
  //           },
  //           {
  //             offset: 1,
  //             color: '#0673AD' // 50% 处的颜色
  //           }
  //         ],
  //         global: true // 缺省为 false
  //       },
  //       shadowColor: '#0f5d9d',
  //       shadowOffsetX: 0,
  //       shadowOffsetY: 15,
  //       opacity: 0.5
  //     },
  //     emphasis: {
  //       areaColor: '#0f5d9d'
  //     }
  //   },

  //   regions: [
  //     {
  //       name: '南海诸岛',
  //       itemStyle: {
  //         areaColor: 'rgba(0, 10, 52, 1)',
  //         borderColor: 'rgba(0, 10, 52, 1)',
  //         normal: {
  //           opacity: 0,
  //           label: {
  //             show: false,
  //             color: '#009cc9'
  //           }
  //         }
  //       },
  //       label: {
  //         show: false,
  //         color: '#FFFFFF',
  //         fontSize: 12
  //       }
  //     }
  //   ]
  // },
  series: [
    {
      type: 'map',
      selectedMode: 'multiple',
      mapType: 'china',
      aspectScale: 0.8,
      layoutCenter: ['50%', '50%'], //地图位置
      layoutSize: '120%',
      zoom: 1, //当前视角的缩放比例
      // roam: true, //是否开启平游或缩放
      scaleLimit: {
        //滚轮缩放的极限控制
        min: 1,
        max: 2
      },
      label: {
        show: false,
        color: '#FFFFFF',
        fontSize: 16
      },
      itemStyle: {
        normal: {
          areaColor: '#0c3653',
          borderColor: '#1cccff',
          borderWidth: 1.8
        },
        emphasis: {
          areaColor: '#56b1da',
          label: {
            show: false,
            color: '#fff'
          }
        }
      },
      data: data
    },
    {
      name: 'Top 5',
      type: 'scatter',
      coordinateSystem: 'geo',
      label: {
        normal: {
          show: false
        }
      },
      itemStyle: {
        normal: {
          color: '#D8BC37' //标志颜色
        }
      },
      data: data,
      showEffectOn: 'render',
      rippleEffect: {
        brushType: 'stroke'
      },
      hoverAnimation: true,
      zlevel: 1
    }
  ]
};

//柱状图数据
const MAX = [800, 800, 800, 800, 800, 800, 800];
const VALUE = [210.9, 260.8, 204.2, 504.9, 740.5, 600.3, 119.0];
export const histogramOption = {
  backgroundColor: '#012366',
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    },
    formatter: function (params:any) {
      const item = params[1];
      return item.name + ' : ' + item.value;
    }
  },
  grid: {
    left: 40,
    right: 40,
    bottom: 100,
    top: 100,
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月'],
    axisLine: {
      show: true,
      lineStyle: {
        color: 'white'
      }
    },
    offset: 25,
    axisTick: {
      show: false,
      length: 9,
      alignWithLabel: true,
      lineStyle: {
        color: '#7DFFFD'
      }
    },
    axisLabel: {
      show: true,
      fontSize: 16
    }
  },
  yAxis: {
    min: 0,
    max: 1200,
    interval: 200,
    type: 'value',
    axisLine: {
      show: false,
      lineStyle: {
        color: 'white'
      }
    },
    splitLine: {
      show: true,
      lineStyle: {
        type: 'dashed',
        color: 'rgba(255,255,255,0.1)'
      }
    },
    axisTick: {
      show: false
    },
    axisLabel: {
      show: true,
      fontSize: 16
    },
    boundaryGap: ['20%', '20%']
  },
  series: [
    {
      type: 'custom',
      renderItem: function (params:any, api:any) {
        const location = api.coord([api.value(0), api.value(1)]);
        return {
          type: 'group',
          children: [
            {
              type: 'CubeLeft',
              shape: {
                api,
                x: location[0],
                y: location[1],
                xAxisPoint: api.coord([api.value(0), 0])
              },
              style: {
                fill: 'rgba(47,102,192,.27)'
              }
            },
            {
              type: 'CubeRight',
              shape: {
                api,
                x: location[0],
                y: location[1],
                xAxisPoint: api.coord([api.value(0), 0])
              },
              style: {
                fill: 'rgba(59,128,226,.27)'
              }
            },
            {
              type: 'CubeTop',
              shape: {
                api,
                x: location[0],
                y: location[1],
                xAxisPoint: api.coord([api.value(0), 0])
              },
              style: {
                fill: 'rgba(72,156,221,.27)'
              }
            }
          ]
        };
      },
      data: MAX
    },
    {
      type: 'custom',
      renderItem: Function(),
      data: VALUE
    },
    {
      type: 'bar',
      label: {
        normal: {
          show: true,
          position: 'top',

          fontSize: 16,
          color: '#fff',
          offset: [2, -25]
        }
      },
      itemStyle: {
        color: 'transparent'
      },
      tooltip: {},
      data: MAX
    }
  ]
};

//雷达图
export const radarOption = {
    backgroundColor: '#0D2753',
    tooltip: {
        //雷达图的tooltip不会超出div，也可以设置position属性，position定位的tooltip 不会随着鼠标移动而位置变化，不友好
        confine: true,
        enterable: true, //鼠标是否可以移动到tooltip区域内
    },
    radar: {
        name: {
            textStyle: {
                color: '#05D5FF',
                fontSize: 14,
            },
        },
        shape: 'polygon',
        center: ['50%', '50%'],
        radius: '80%',
        startAngle: 120,
        scale: true,
        axisLine: {
            lineStyle: {
                color: 'rgba(5, 213, 255, .8)',
            },
        },
        splitLine: {
            show: true,
            lineStyle: {
                width: 1,
                color: 'rgba(5, 213, 255, .8)', // 设置网格的颜色
            },
        },
        indicator: [
            {
                name: '特殊人群',
                max: 100,
            },
            {
                name: '信访',
                max: 100,
            },
            {
                name: '12345',
                max: 100,
            },
            {
                name: '事件',
                max: 100,
            },
            {
                name: '矛盾调解',
                max: 100,
            },
            {
                name: '人民调解',
                max: 100,
            },
        ],
        splitArea: {
            show: false,
        },
    },
    grid: {
        position: 'center',
    },
    polar: {
        center: ['50%', '50%'], // 默认全局居中
        radius: '0%',
        
    },
    angleAxis: {
        min: 0,
        interval: 5,
        clockwise: false,
        axisTick: {
            show: false,
        },
        axisLabel: {
            show: false,
        },
        axisLine: {
            show: false,
        },
        splitLine: {
            show: false,
        },
    },
    radiusAxis: {
        min: 0,
        interval: 20,
        splitLine: {
            show: false,
        },
    },
    series: [
        {
            name: '个人雷达图',
            type: 'radar',
            symbol: 'circle', // 拐点的样式，还可以取值'rect','angle'等
            symbolSize: 10, // 拐点的大小
            itemStyle: {
                normal: {
                    color: '#05D5FF',
                },
            },
            areaStyle: {
                normal: {
                    color: '#05D5FF',
                    opacity: 0.5,
                },
            },
            lineStyle: {
                width: 2,
                color: '#05D5FF',
            },
            label: {
                normal: {
                    show: true,
                    formatter: (params) => {
                        return params.value;
                    },
                    color: '#fff',
                },
            },
            data: [
                {
                    value: [20, 50, 60, 60, 90, 80],
                },
            ],
        },
    ],
};
