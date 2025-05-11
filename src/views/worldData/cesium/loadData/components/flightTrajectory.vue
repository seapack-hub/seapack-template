<template>
  <div class="flight-trajectory"></div>
</template>

<script setup>
import { onMounted, ref, nextTick } from 'vue';
import { useCesiumStore } from '@/store/modules/cesium';
import planeData from '@/assets/json/plane.json';
import * as Cesium from 'cesium';

const cesiumStore = useCesiumStore();

function flightTrajectory() {
  //获取全局视图
  let viewer = cesiumStore.$state.loadDataViewer;

  //1.设置3D建筑
  // let tiles3d = new Cesium.createOsmBuildings();
  // const osmBuildings = viewer.scene.primitives.add(tiles3d);

  //初始化飞行点位
  const positionProperty = new Cesium.SampledPositionProperty();

  // 时间间隔 30秒
  const timeStepInSeconds = 30;
  // 整个飞行花费的时间
  const totalSeconds = (planeData.length - 1) * timeStepInSeconds;

  // 设置起点时间
  const time = new Date('2024-12-25T17:18:00Z');
  // cesium，默认使用的是儒略日的时间
  // 所以需要起点时间转换成儒略日的时间
  const startJulianDate = Cesium.JulianDate.fromDate(time);
  // 设置终点时间
  const stopJulianDate = Cesium.JulianDate.addSeconds(startJulianDate, totalSeconds, new Cesium.JulianDate());

  // 将查看器的时间调整到起点和结束点的范围
  viewer.clock.startTime = startJulianDate.clone();
  viewer.clock.stopTime = stopJulianDate.clone();
  viewer.clock.currentTime = startJulianDate.clone();
  // console.log(planeData);
  viewer.timeline.zoomTo(startJulianDate, stopJulianDate);

  console.log('---飞行数据--', planeData);
  planeData.forEach((dataPoint, i) => {
    // 当前点的时间
    const time = Cesium.JulianDate.addSeconds(startJulianDate, i * timeStepInSeconds, new Cesium.JulianDate());
    // 设置当前点的位置
    const position = Cesium.Cartesian3.fromDegrees(dataPoint.longitude, dataPoint.latitude, dataPoint.height);
    // 添加轨迹采样点
    positionProperty.addSample(time, position);
    // 添加点
    // viewer.entities.add({
    //   position: position,
    //   point: {
    //     pixelSize: 10,
    //     color: Cesium.Color.RED,
    //     outlineColor: Cesium.Color.WHITE,
    //     outlineWidth: 2,
    //   },
    // });
  });

  console.log('--||节点--', positionProperty);
  // 创建飞机
  const planeEntity = viewer.entities.add({
    availability: new Cesium.TimeIntervalCollection([
      new Cesium.TimeInterval({
        start: startJulianDate,
        stop: stopJulianDate
      })
    ]),
    name: 'Airplane',
    // 设置飞机的可用
    position: positionProperty,
    //position:Cesium.Cartesian3.fromDegrees(113.3191, 23.109, 1500),
    // VelocityOrientationProperty会自动根据采样点，计算出飞机的速度和方向
    orientation: new Cesium.VelocityOrientationProperty(positionProperty),
    model: {
      uri: new URL('@p/model/Cesium_Air.glb', import.meta.url).href
      // minimumPixelSize: 128,
      // maximumScale: 20000,
      // 设置飞机的最小像素
      // minimumPixelSize: 128,
      // // 设置飞机的轮廓
      // silhouetteSize: 2,
      // // 设置轮廓的颜色
      // silhouetteColor: Cesium.Color.WHITE,
    },
    // 绘制轨迹线
    path: new Cesium.PathGraphics({
      width: 5
    })
  });
  // cesiumStore.$state.loadDataViewer.flyTo(planeEntity);
  // 相机追踪运动的问题
  cesiumStore.$state.loadDataViewer.trackedEntity = planeEntity;

  // 设置时间速率
  cesiumStore.$state.loadDataViewer.clock.multiplier = 30;
}

nextTick(() => {
  flightTrajectory();
});
onMounted(async () => {
  await nextTick();
});
</script>

<style lang="scss" scoped></style>
