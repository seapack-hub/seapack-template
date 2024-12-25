import { defineStore } from 'pinia'
import { Viewer } from 'cesium'

// 设置Cesium的全局存储器
export const useCesiumStore = defineStore("cesium",{
  state: () => ({
    //粒子特效地图
    cesiumViewer: <Viewer>{},
    //数据加载地图
    loadDataViewer: <Viewer>{},
  }),
  actions: {
    setCesiumViewer(viewer: Viewer) {
      this.cesiumViewer = viewer
    },
    setLoadDataViewer(viewer:Viewer){
      this.loadDataViewer = viewer
    }
  }
})