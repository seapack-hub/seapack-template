<template>
  <div class="camera-move">
    <!-- -->
    <div class="button-group">
      <el-button type="primary" v-for="(item, index) in operateGroup" :key="index" @click="buttonClick(item.value)">{{
        item.label
      }}</el-button>
    </div>
    <div id="cesium-camera-move"></div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import * as Cesium from 'cesium';

let operateGroup = ref([]);
let viewer;
operateGroup.value = [
  { label: '前', value: '01' },
  { label: '后', value: '02' },
  { label: '左', value: '03' },
  { label: '右', value: '04' },
  { label: '左旋转', value: '05' },
  { label: '右旋转', value: '06' },
  { label: '上旋转', value: '07' },
  { label: '下旋转', value: '08' },
  { label: '左翻滚', value: '09' },
  { label: '右翻滚', value: '10' }
];
// 设置cesium默认视角
Cesium.Camera.DEFAULT_VIEW_RECTANGLE = Cesium.Rectangle.fromDegrees(
  // 西边的经度
  89.5,
  // 南边维度
  20.4,
  // 东边经度
  110.4,
  // 北边维度
  61.2
);

function initCesium() {
  //viewer是所有Api的开始,
  //设置token
  Cesium.Ion.defaultAccessToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhMTA5YzcyZC03OTdlLTRjYTMtYjJhZC1lYzQwODhlODliNTIiLCJpZCI6MjUyOTU2LCJpYXQiOjE3MzA3OTMzNjd9.NSkZaVBGMb4WwS0jz0_zTq1ivn-5MYee_gmGDChsNys';

  //绑定容器
  viewer = new Cesium.Viewer('cesium-camera-move', {
    timeline: false, //时间轴控件
    animation: false, //动画控件
    geocoder: false, //搜索按钮
    homeButton: false, //主页按钮
    sceneModePicker: false, //投影方式按钮
    baseLayerPicker: false, //图层选择按钮
    navigationHelpButton: false, //帮助手势按钮
    fullscreenButton: false, //全屏按钮
    infoBox: false, //是否显示信息窗口
    selectionIndicator: false
  });
  //设置相机位置
  const position = Cesium.Cartesian3.fromDegrees(110, 30, 20000);
  viewer.camera.setView({
    //目的地
    destination: position,
    //取向
    orientation: {
      // 指定相机的朝向,偏航角
      heading: Cesium.Math.toRadians(90),
      // 指定相机的俯仰角,0度是竖直向上,-90度是向下
      pitch: Cesium.Math.toRadians(-10),
      // 指定相机的滚转角,翻滚角
      roll: Cesium.Math.toRadians(0)
    }
  });
}

function buttonClick(value) {
  // 获取相机离地面的高度
  let height = viewer.camera.positionCartographic.height;
  let moveRate = height / 100;

  switch (value) {
    case '01':
      // 设置相机向前移动
      viewer.camera.moveForward(moveRate);
      break;
    case '02':
      // 设置相机向后移动
      viewer.camera.moveBackward(moveRate);
      break;
    case '03':
      // 设置相机向左移动
      viewer.camera.moveLeft(moveRate);
      break;
    case '04':
      // 设置相机向右移动
      viewer.camera.moveRight(moveRate);
      break;
    case '05':
      // 设置相机向左旋转相机
      viewer.camera.lookLeft(Cesium.Math.toRadians(1));
      break;
    case '06':
      // 设置相机向右旋转相机
      viewer.camera.lookRight(Cesium.Math.toRadians(1));
      break;
    case '07':
      // 设置相机向上旋转相机
      viewer.camera.lookUp(Cesium.Math.toRadians(1));
      break;
    case '08':
      // 设置相机向下旋转相机
      viewer.camera.lookDown(Cesium.Math.toRadians(1));
      break;
    case '09':
      // 向左逆时针翻滚
      viewer.camera.twistLeft(Cesium.Math.toRadians(1));
      break;
    case '10':
      // 向右顺时针翻滚
      viewer.camera.twistRight(Cesium.Math.toRadians(1));
      break;
    default:
      break;
  }
}

onMounted(() => {
  initCesium();
});
</script>

<style lang="scss" scoped>
.camera-move {
  width: 100%;
  height: 100%;
  .button-group {
    padding: 15px;
    display: flex;
    justify-content: left;
    align-items: center;
  }
  #cesium-camera-move {
    width: calc(100vw - 300px);
    height: calc(100vh - 300px);
  }
}
::v-deep(.cesium-viewer-bottom) {
  display: none;
}
</style>
