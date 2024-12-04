import { defineStore } from 'pinia'
import { Viewer } from 'cesium'

export interface CesiumStore {
  cesiumViewer: Viewer | null
}
// 设置Cesium的全局存储器
export const useCesiumStore = defineStore("cesium",{
  state: (): CesiumStore => ({
    cesiumViewer: null
  }),
  actions: {
    setCesiumViewer(viewer: Viewer) {
      this.cesiumViewer = viewer
    }
  }
})