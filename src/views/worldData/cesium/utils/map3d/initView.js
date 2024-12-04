import * as Cesium from 'cesium'
// Cesium 官网设置个人Token
const Token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhMTA5YzcyZC03OTdlLTRjYTMtYjJhZC1lYzQwODhlODliNTIiLCJpZCI6MjUyOTU2LCJpYXQiOjE3MzA3OTMzNjd9.NSkZaVBGMb4WwS0jz0_zTq1ivn-5MYee_gmGDChsNys"

//基础配置
const defaultConfig = {
  timeline: false, //时间轴控件
  animation: false, //动画控件
  geocoder: false, //搜索按钮
  homeButton:false, //主页按钮
  sceneModePicker: false, //投影方式按钮
  baseLayerPicker: false, //图层选择按钮
  navigationHelpButton: false, //帮助手势按钮
  fullscreenButton: false, //全屏按钮
  infoBox: false, //是否显示信息窗口
  selectionIndicator: false,
}
export default class InitView{
  //构造器
  constructor(id,paramsOpts){
    paramsOpts = paramsOpts||{};
    this.initMap3d(id,paramsOpts)
  };

  /**
   * 初始化3D地图
   * @param {*} id 容器ID
   * @param {*} paramsOpts 配置参数
   */
  initMap3d(id,paramsOpts){
    if(typeof id === "string"){
      if(!id) throw new Error("容器id 不能为空！");
      // 设置cesium默认视角
      Cesium.Camera.DEFAULT_VIEW_RECTANGLE = Cesium.Rectangle.fromDegrees(89.5,20.4,110.4,61.2);
      Cesium.Camera.DEFAULT_VIEW_FACTOR = 0
      //设置token
      Cesium.Ion.defaultAccessToken = Token;
      //配置
      let config = {...defaultConfig,...paramsOpts}
      //绑定容器
      this.viewer = new Cesium.Viewer(id, config)
      let tdtImageryProvider = new Cesium.UrlTemplateImageryProvider({
          url: 'http://{s}.tianditu.com/DataServer?T=img_w&X={x}&Y={y}&L={z}&tk=d845a99528ce08b31543c602207e873f',
          subdomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'],
          maximumLevel: 18,
          minimumLevel: 1,
          credit: 'Tianditu'
      });
      this.viewer.imageryLayers.addImageryProvider(tdtImageryProvider);
    }
  }
}