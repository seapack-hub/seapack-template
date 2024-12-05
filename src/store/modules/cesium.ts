import { defineStore } from 'pinia'
import { Viewer } from 'cesium'

// 设置Cesium的全局存储器
export const useCesiumStore = defineStore("cesium",{
  state: () => ({
    cesiumViewer: <Viewer>{}
  }),
  actions: {
    setCesiumViewer(viewer: Viewer) {
      this.cesiumViewer = viewer
    }
  }
})