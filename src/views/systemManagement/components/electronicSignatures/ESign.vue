<template>
  <div class="signature-container">
    <canvas
      ref="canvasRef"
      @mousedown="startDrawing"
      @mousemove="draw"
      @mouseup="endDrawing"
      @mouseleave="endDrawing"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="endDrawing"
    ></canvas>
    <div class="controls">
      <button @click="clearCanvas">清除</button>
      <button @click="saveSignature">保存签名</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

//类型定义
type RGBColor = `#${string}` | `rgb(${number},${number},${number})`
type Point = { x: number; y: number }
type CanvasContext = CanvasRenderingContext2D | null

// 配置
const exportBgColor: RGBColor = '#ffffff' // 设置为需要的背景色

//元素引用
const canvasRef = ref<HTMLCanvasElement | null>(null)
const ctx = ref<CanvasContext>()

//绘制状态
const isDrawing = ref(false)
const lastPosition = ref<Point>({ x: 0, y: 0 })

//初始化画布
onMounted(() => {
  if (!canvasRef.value) return
  //设置画布大小
  canvasRef.value.width = 800
  canvasRef.value.height = 400

  //获取2d上下文
  ctx.value = canvasRef.value.getContext('2d')
  if (!ctx.value) return

  //初始化 画笔样式
  ctx.value.lineWidth = 2
  ctx.value.lineCap = 'round'
  ctx.value.strokeStyle = '#000' //线条颜色
  // 初始填充背景
  fillBackground(exportBgColor)
})

//填充背景方法
const fillBackground = (color: RGBColor) => {
  if (!ctx.value || !canvasRef.value) return
  ctx.value.save()
  ctx.value.fillStyle = color
  ctx.value.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  ctx.value.restore()
}

//获取坐标点
const getCanvasPosition = (clientX: number, clientY: number): Point => {
  if (!canvasRef.value) return { x: 0, y: 0 }

  //获取元素在视口（viewport）中位置
  const rect = canvasRef.value.getBoundingClientRect()
  return {
    x: clientX - rect.left,
    y: clientY - rect.top,
  }
}

// 获取事件坐标
const getEventPosition = (e: MouseEvent | TouchEvent): Point => {
  //TouchEvent 是在支持触摸操作的设备（如智能手机、平板电脑）上，用于处理触摸相关交互的事件对象
  if ('touches' in e) {
    return getCanvasPosition(e.touches[0].clientX, e.touches[0].clientY)
  }
  return getCanvasPosition(e.clientX, e.clientY)
}

//开始绘制
const startDrawing = (e: MouseEvent | TouchEvent) => {
  isDrawing.value = true
  const { x, y } = getEventPosition(e)
  lastPosition.value = { x, y }
}

//绘制中
const draw = (e: MouseEvent | TouchEvent) => {
  if (!isDrawing.value || !ctx.value) return
  const { x, y } = getEventPosition(e)
  //开始新路径
  ctx.value.beginPath()
  //移动画笔到上一个点
  ctx.value.moveTo(lastPosition.value.x, lastPosition.value.y)
  //绘制线条到当前点
  ctx.value.lineTo(x, y)
  ctx.value.stroke()
  //更新最后的位置
  lastPosition.value = { x, y }
}

//结束绘制
const endDrawing = () => {
  isDrawing.value = false
}

//处理触摸事件
const handleTouchStart = (e: TouchEvent) => {
  e.preventDefault()
  startDrawing(e)
}
const handleTouchMove = (e: TouchEvent) => {
  e.preventDefault()
  draw(e)
}

//清除签名
const clearCanvas = () => {
  if (!ctx.value || !canvasRef.value) return
  ctx.value.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
}

//保存签名
const saveSignature = () => {
  if (!canvasRef.value) return
  const dataURL = canvasRef.value.toDataURL('image/png')
  const link = document.createElement('a')
  link.download = 'signature.png'
  link.href = dataURL
  link.click()
}
</script>

<style lang="scss" scoped>
.signature-container {
  border: 1px solid #ddd;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
}

canvas {
  background: white;
  touch-action: none; /* 禁用触摸滚动 */
  border: 1px solid #eee;
}

.controls {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}

button {
  padding: 8px 16px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: #66b1ff;
  }

  &:active {
    background: #3a8ee6;
  }
}
</style>
