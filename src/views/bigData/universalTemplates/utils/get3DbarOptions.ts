import type { EChartsOption } from 'echarts';
const data = [
  { name: "北京", value: 15000, color: "#63ea61" },
  { name: "上海", value: 10000, color: "#F1B945" },
  { name: "广州", value: 9000, color: "#FF7918" },
  { name: "深圳", value: 7000, color: "#0170F2" },
  { name: "武汉", value: 3000, color: "#2FF8DE" },
];

/**
 * 添加指示线
 * @param series series对象
 * @param startRatio 起始位置比例
 * @param endRatio 结束位置比例
 * @param value 数值
 * @param i 序号
 * @param color  默认颜色
 */
const addLabelLine = (series:Array<any>,startRatio:number,endRatio:number,value:number,i:number,color = "#fff") => {
  let midRadian = (endRatio + startRatio) * Math.PI;
  let posX = Math.cos(midRadian) * (1 + Math.cos(Math.PI / 2));
  let posY = Math.sin(midRadian) * (1 + Math.cos(Math.PI / 2));
  let posZ = Math.log(Math.abs(value + 1)) * 0.1;
  let flag =
    (midRadian >= 0 && midRadian <= Math.PI / 2) ||
    (midRadian >= (3 * Math.PI) / 2 && midRadian <= Math.PI * 2)
      ? 1
      : -1;
  let turningPosArr = [
    posX * 2 + i * 0.1 * flag + (flag < 0 ? -0.5 : 0),
    posY * 2 + i * 0.1 * flag + (flag < 0 ? -0.5 : 0),
    posZ * 2,
  ];
  let endPosArr = [
    posX * 2 + i * 0.1 * flag + (flag < 0 ? -0.5 : 0),
    posY * 2 + i * 0.1 * flag + (flag < 0 ? -0.5 : 0),
    posZ * 6,
  ];
  //添加label+指示线
  series.push(
    //  指示线
    {
      type: "line3D",
      lineStyle: {
        color: color, //线颜色
        width: 1, //线宽
      },
      data: [[posX, posY, posZ], turningPosArr, endPosArr],
    },
    {
      type: "scatter3D",
      label: {
        show: true,
        distance: 0,
        position: "center",
        textStyle: {
          color: "#fff", //文字颜色
          backgroundColor: color,
          borderWidth: 2,
          fontSize: 14,
          padding: 10,
          borderRadius: 4,
        },
        formatter: "{b}",
      },
      symbolSize: 0,
      data: [{ name: series[i].name + "：" + value + "元", value: endPosArr }],
    }
  );
};

/**
 * 获取面的参数方程
 * @param {*} startRatio 扇形起始位置比例
 * @param {*} endRatio 扇形结束位置比例
 * @param {*} k 辅助参数,控制饼图半径
 * @param {*} value 数值
 * @param {*} total 总数
 */
const getParametricEquation = (startRatio:number, endRatio:number, k:number, value:number, total:number) => {
  const startRadian = startRatio * Math.PI * 2;
  const endRadian = endRatio * Math.PI * 2;
  k = typeof k === "number" && !isNaN(k) ? k : 1 / 3; //默认1/3
  // 返回曲面参数方程
  return {
    u: {min: -Math.PI,max: Math.PI * 3,step: Math.PI / 32,},
    v: {min: 0,max: Math.PI * 2,step: Math.PI / 20,},
    x(u:any, v:any) {
      if (u < startRadian) {
        return Math.cos(startRadian) * (1 + Math.cos(v) * k);
      }
      if (u > endRadian) {
        return Math.cos(endRadian) * (1 + Math.cos(v) * k);
      }
      return Math.cos(u) * (1 + Math.cos(v) * k);
    },
    y(u:any, v:any) {
      if (u < startRadian) {
        return Math.sin(startRadian) * (1 + Math.cos(v) * k);
      }
      if (u > endRadian) {
        return Math.sin(endRadian) * (1 + Math.cos(v) * k);
      }
      return Math.sin(u) * (1 + Math.cos(v) * k);
    },
    z(u:any, v:any) {
      if (u < -Math.PI * 0.5) {
        return Math.sin(u);
      }
      if (u > Math.PI * 2.5) {
        return Math.sin(u) * 15 * (value / (total || 1));
      }
      // 扇形高度根据value值计算
      return Math.sin(v) > 0 ? 15 * (value / (total || 1)) : -1;
    },
  };
};
export function getCircleOptions():EChartsOption {
  let total = data.reduce((a, b) => a + b.value, 0);
  //当前累加值
  let sumValue = 0;
  //辅助参数,控制饼图半径，（0-1）范围内控制环形大小，值越小环形内半径越大
  let k = 0.2;
  //series配置（每个扇形）
  let series = data.map((item) => {
    //当前扇形起始位置占饼图比例
    let startRatio = sumValue / total;
    //值累加
    sumValue += item.value;
    //当前扇形结束位置占饼图比例
    let endRatio = sumValue / total;
    return {
      name: item.name ?? null,
      type: "surface", //曲面图
      itemStyle: {
        color: item.color ?? null, //颜色
      },
      wireframe: {
        show: false, //不显示网格线
      },
      pieData: item, //数据
      //饼图状态
      pieStatus: {
        k, //辅助参数
        startRatio, //起始位置比例
        endRatio, //结束位置比例
        value: item.value, //数值
      },
      parametric: true, //参数曲面
      //曲面的参数方程
      parametricEquation: getParametricEquation(
        startRatio,
        endRatio,
        k,
        item.value,
        total
      ),
    };
  });
  //添加指示线
  series.forEach((item, index) => {
    let {
      itemStyle: { color },
      pieStatus: { startRatio, endRatio, value },
    } = item;
    addLabelLine(series, startRatio, endRatio, value, index, color);
  });
  return {
    //提示框
    tooltip: {
      backgroundColor: "#4974B6", // 背景色[4](@ref)
      borderColor: "#333", // 边框颜色[4](@ref)
      textStyle: {
        color: "#B0D4EF", // 文字颜色[4](@ref)
      },
      formatter: (params:any) => {
        if (
          params.seriesName !== "mouseoutSeries" &&
          params.seriesName !== "pie2d"
        ) {
          return `${
            params.seriesName
          }<br/><span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${
            params.color
          };"></span>${series[params.seriesIndex].pieData.value}元`;
        }
        return "";
      },
    },
    legend: {
      show: true,
      orient: 'horizontal',  // 图例列表的布局方向，水平排布才能更好地在底部展开[1,5](@ref)
      bottom: 0,          // 图例距离容器底部的距离，可以是像素值（如 10）或百分比（如 '5%'）[1,2](@ref)
      left: 'center',        // 图例水平居中显示[4](@ref)
      itemGap: 20,
      textStyle: {
        // 文字样式
        color: "#fff",
        fontSize: 12,
      },
      selectedMode: false,
    },
    labelLine: {
      show: true,
      lineStyle: {
        color: "#7BC0CB",
      },
    },
    label: {
      show: false,
    },
    xAxis3D: {
      min: -1,
      max: 1,
    },
    yAxis3D: {
      min: -1,
      max: 1,
    },
    zAxis3D: {
      min: -1,
      max: 1,
    },
    grid3D: {
      left: 0,
      top:0,
      show: false, //不显示坐标系
      boxHeight: 8, //饼图高度
      // 用于鼠标的旋转，缩放等视角控制
      viewControl: {
        alpha: 45, //视角
        distance: 280, //距离，值越大饼图越小
        rotateSensitivity: 1, //禁止旋转
        zoomSensitivity: 0, //禁止缩放
        panSensitivity: 0, //禁止平移
        autoRotate: true, //禁止自动旋转
      },
    },
    series,
  };
}