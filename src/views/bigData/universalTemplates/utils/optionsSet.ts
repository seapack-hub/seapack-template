import type { EChartsOption } from 'echarts';
import * as echarts from 'echarts';
//获取门店受理情况配置
export function getStoresOptions():EChartsOption{
  return {
    animation: true, // 开启动画，默认为 true
    animationDuration: 1000, // 初始动画的持续时间为 2000 毫秒
    animationEasing: 'linear', // 初始动画使用线性缓动效果[1](@ref)
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0)',
      axisPointer: {
        lineStyle: {
          color: '#fff'
        }
      },
      textStyle: { // 文字样式配置
        color: '#fff', // 设置字体颜色为白色[1,3,7](@ref)
        fontSize: 14 // 同时也可以设置字体大小等其他样式[3,7](@ref)
      }
    },
    legend: {
      icon: 'rect',
      itemWidth: 14,
      itemHeight: 5,
      itemGap:10,
      data: ['受理时长', '排队时长', '订单量','客流量'],
      orient: 'horizontal',  // 图例列表的布局方向，水平排布才能更好地在底部展开
      top: 0,          // 图例距离容器底部的距离，可以是像素值（如 10）或百分比（如 '5%'）
      left: 'center',
      textStyle: {fontSize: 12,color: '#fff'}
    },
    grid:{
      left:30,
      bottom:25,
      top:30
    },
    xAxis: 
    {
      type: 'category',
      boundaryGap: false,
      axisLine: {
        lineStyle: {
          color: '#57617B'
        }
      },
      axisLabel: {
        textStyle: {
          color:'#fff',
          fontSize: 8,
        }
      },
      data: ["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"],
    },
    yAxis: [
      {
        type: 'value',
        axisTick: {
            show: false
        },
        axisLine: {
          lineStyle: {
            color: '#57617B'
          }
        },
        axisLabel: {
          margin: 10,
          textStyle: {
            fontSize: 12,
            color:"#fff"
          },
          formatter:'{value}分'
        },
        splitLine: {
          lineStyle: {
            color: '#57617B'
          }
        }
      },
      {
        type: 'value',
        axisTick: {
            show: false
        },
        axisLine: {
          lineStyle: {
            color: '#57617B'
          }
        },
        axisLabel: {
          margin: 10,
          textStyle: {
            fontSize: 12,
            color:"#fff"
          },
          formatter:'{value}个'
        },
        splitLine: {
          show: false,
          lineStyle: {
            color: '#57617B'
          }
        }
      }
    ],
    series: [
      {
        name: '受理时长',
        type: 'line',
        smooth: true,
        animation: true, 
        animationDuration: 1000, 
        animationEasing: 'linear',
        yAxisIndex:0,
        areaStyle: {
          normal: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                offset: 0,
                color: 'rgba(185,150,248,0.3)'
            }, {
                offset: 0.8,
                color: 'rgba(185,150,248,0)'
            }], false),
            shadowColor: 'rgba(0, 0, 0, 0.1)',
            shadowBlur: 10
          }
        },
        itemStyle: {normal: { color: '#B996F8'}},
        data: ["7.75","7.45","7.08","0.00","7.29","6.54","5.23","4.34","7.56","4.00","2.20","4.59"]
      }, 
      {
        name: '排队时长',
        type: 'line',
        smooth: true,
        animation: true, 
        animationDuration: 1000, 
        animationEasing: 'linear',
        lineStyle: {
           normal: {
            width: 2
          }
        },
        yAxisIndex:0,
        areaStyle: {
            normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                    offset: 0,
                    color: 'rgba(3, 194, 236, 0.3)'
                }, {
                    offset: 0.8,
                    color: 'rgba(3, 194, 236, 0)'
                }], false),
                shadowColor: 'rgba(0, 0, 0, 0.1)',
                shadowBlur: 10
            }
        },
        itemStyle: {normal: {color: '#03C2EC'}},
        data: ["2.00","1.50","5.99","3.02","2.51","4.61","3.45","7.45","2.44","0.00","7.29","6.54",]
		  }, 
      {
        name: '订单量',
        type: 'line',
        smooth: true,
        animation: true, 
        animationDuration: 1000, 
        animationEasing: 'linear',
        lineStyle: {
          normal: {
            width: 2
          }
        },
        yAxisIndex:1,
        areaStyle: {
          normal: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                  offset: 0,
                  color: 'rgba(218, 57, 20, 0.3)'
              }, {
                  offset: 0.8,
                  color: 'rgba(218, 57, 20, 0)'
              }], false),
              shadowColor: 'rgba(0, 0, 0, 0.1)',
              shadowBlur: 10
          }
        },
        itemStyle: {normal: {color: '#DA3914'}},
        data:["251","189","212","0","126","254","228","50","206","137","0","179",]
		  },
      {
        name: '客流量',
        type: 'line',
        smooth: true,
        animation: true, 
        animationThreshold:1000,
        animationDuration: 1000, 
        animationEasing: 'linear',
        lineStyle: {
          normal: {
            width: 2
          }
        },
        yAxisIndex:1,
        areaStyle: {
            normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                    offset: 0,
                    color: 'rgba(232, 190, 49, 0.3)'
                }, {
                    offset: 0.8,
                    color: 'rgba(232, 190, 49, 0)'
                }], false),
                shadowColor: 'rgba(0, 0, 0, 0.1)',
                shadowBlur: 10
            }
        },
        itemStyle: {normal: {color: '#E8BE31'}},
        data:["228","176","133","137","0","179","251","0","212","0","126","254"]
		  }
    ]
  };
}