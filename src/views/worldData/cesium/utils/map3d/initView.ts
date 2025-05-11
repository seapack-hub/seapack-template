import * as Cesium from 'cesium';
// Cesium 官网设置个人Token
const Token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhMTA5YzcyZC03OTdlLTRjYTMtYjJhZC1lYzQwODhlODliNTIiLCJpZCI6MjUyOTU2LCJpYXQiOjE3MzA3OTMzNjd9.NSkZaVBGMb4WwS0jz0_zTq1ivn-5MYee_gmGDChsNys';

//基础配置
const defaultConfig = {
  timeline: true, //时间轴控件
  animation: true, //动画控件
  geocoder: false, //搜索按钮
  homeButton: false, //主页按钮
  sceneModePicker: false, //投影方式按钮
  baseLayerPicker: false, //图层选择按钮
  navigationHelpButton: false, //帮助手势按钮
  fullscreenButton: false, //全屏按钮
  infoBox: false, //是否显示信息窗口
  selectionIndicator: false,
  shouldAnimate: true //展示动画
};
export default class InitView {
  // @ts-ignore
  viewer: Cesium.Viewer;
  //构造器
  constructor(id: string, paramsOpts: object) {
    paramsOpts = paramsOpts || {};
    this.initMap3d(id, paramsOpts);
  }

  /**
   * 初始化3D地图
   * @param {*} id 容器ID
   * @param {*} paramsOpts 配置参数
   */
  initMap3d(id: string, paramsOpts: object) {
    if (typeof id === 'string') {
      if (!id) throw new Error('容器id 不能为空！');
      // 设置cesium默认视角
      // Cesium.Camera.DEFAULT_VIEW_RECTANGLE = Cesium.Rectangle.fromDegrees(89.5,20.4,110.4,61.2);
      Cesium.Camera.DEFAULT_VIEW_FACTOR = 0;
      //设置token
      Cesium.Ion.defaultAccessToken = Token;
      //配置
      let config = { ...defaultConfig, ...paramsOpts };
      //绑定容器
      this.viewer = new Cesium.Viewer(id, config);
      // let tdtImageryProvider = new Cesium.UrlTemplateImageryProvider({
      //     url: 'http://{s}.tianditu.com/DataServer?T=img_w&X={x}&Y={y}&L={z}&tk=d845a99528ce08b31543c602207e873f',
      //     subdomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'],
      //     maximumLevel: 18,
      //     minimumLevel: 1,
      //     credit: 'Tianditu'
      // });
      // this.viewer.imageryLayers.addImageryProvider(tdtImageryProvider);
      // 外天空盒
      this.viewer.scene.skyBox = new Cesium.SkyBox({
        sources: {
          positiveX: '/images/Standard-Cube-Map/px1.png',
          negativeX: '/images/Standard-Cube-Map/nx1.png',
          positiveY: '/images/Standard-Cube-Map/pz.png',
          negativeY: '/images/Standard-Cube-Map/nz1.png',
          positiveZ: '/images/Standard-Cube-Map/py.png',
          negativeZ: '/images/Standard-Cube-Map/ny1.png'
        }
      });
    }
  }
}
