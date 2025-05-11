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
import { onMounted, ref } from 'vue';

//类型定义
type RGBColor = `#${string}` | `rgb(${number},${number},${number})`;
type Point = { x: number; y: number; pressure?: number };
type CanvasContext = CanvasRenderingContext2D | null;
type DrawingState = {
  points: Point[];
  lastRenderTime: number;
};

// 配置
const exportBgColor: RGBColor = '#ffffff'; // 设置为需要的背景色

//元素引用
const canvasRef = ref<HTMLCanvasElement | null>(null);
const ctx = ref<CanvasContext>();

//绘制状态
const isDrawing = ref(false);
const state = ref<DrawingState>({
  points: [],
  lastRenderTime: 0
});

// 配置参数
const config = {
  SMOOTHING_INTERVAL: 16, // 平滑渲染间隔(ms)
  PRESSURE_SENSITIVITY: 0.5, // 压感灵敏度
  LINE_SMOOTHING: 0.3, // 线条平滑系数
  MAX_POINTS: 100 // 保留的最大点数
};

//初始化画布
onMounted(() => {
  if (!canvasRef.value) return;

  // 高清屏适配,设备像素比（devicePixelRatio）是当前显示设备的物理像素分辨率与CSS像素分辨率之比
  const dpr = window.devicePixelRatio || 1;
  //方法返回一个 DOMRect 对象，其提供了元素的大小及其相对于视口的位置。
  const rect = canvasRef.value.getBoundingClientRect();
  //设置画布大小
  canvasRef.value.width = rect.width * dpr;
  canvasRef.value.height = rect.height * dpr;

  //获取2d上下文
  ctx.value = canvasRef.value.getContext('2d');
  if (!ctx.value) return;

  //初始化 画笔样式
  ctx.value.scale(dpr, dpr);
  ctx.value.lineWidth = 2;
  ctx.value.lineCap = 'round';
  ctx.value.lineJoin = 'round';
  ctx.value.strokeStyle = '#000'; //线条颜色
  // 初始填充背景
  fillBackground(exportBgColor);
});

//填充背景方法
const fillBackground = (color: RGBColor) => {
  if (!ctx.value || !canvasRef.value) return;
  ctx.value.save();
  ctx.value.fillStyle = color;
  ctx.value.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height);
  ctx.value.restore();
};

//获取坐标点
const getCanvasPosition = (e: MouseEvent | Touch): Point => {
  if (!canvasRef.value) return { x: 0, y: 0 };

  //获取元素在视口（viewport）中位置
  const rect = canvasRef.value.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
    pressure: (e as Touch).force | 0.5 //压感支持
  };
};

//轨迹平滑算法（二次贝塞尔曲线优化）
const smoothPoints = (points: Point[]): Point[] => {
  if (points.length < 3) return points;

  const smoothed: Point[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    // Catmull-Rom插值
    for (let t = 0; t <= 1; t += 0.2) {
      const x =
        0.5 *
        (2 * p1.x +
          (-p0.x + p2.x) * t +
          (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t * t +
          (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t * t * t);
      const y =
        0.5 *
        (2 * p1.y +
          (-p0.y + p2.y) * t +
          (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t * t +
          (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t * t * t);
      smoothed.push({ x, y });
    }
  }
  return smoothed;
};

// 动态线宽计算（基于速度）
const calculateLineWidth = (points: Point[]): number => {
  if (points.length < 2) return 2;

  const lastTwo = points.slice(-2);
  const dx = lastTwo[1].x - lastTwo[0].x;
  const dy = lastTwo[1].y - lastTwo[0].y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const speed = distance / (Date.now() - state.value.lastRenderTime);

  // 速度越大线宽越小
  return Math.max(1, 4 - speed * 0.5);
};

//开始绘制
const startDrawing = (e: MouseEvent | TouchEvent) => {
  isDrawing.value = true;
  const point = getCanvasPosition(e instanceof MouseEvent ? e : e.touches[0]);
  state.value.points = [point];
};

//绘制路径
const drawPath = () => {
  if (!ctx.value || state.value.points.length < 2) return;
  // 应用平滑算法
  const smoothed = smoothPoints(state.value.points);

  ctx.value.beginPath();
  ctx.value.moveTo(smoothed[0].x, smoothed[0].y);

  // 绘制贝塞尔曲线
  for (let i = 1; i < smoothed.length - 2; i++) {
    const p1 = smoothed[i];
    const p2 = smoothed[i + 1];
    const cp = {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2
    };
    ctx.value.quadraticCurveTo(p1.x, p1.y, cp.x, cp.y);
  }

  // 处理压感效果
  const pressure = smoothed[smoothed.length - 1].pressure || 0.5;
  ctx.value.globalAlpha = 0.5 + pressure * 0.5;
  ctx.value.lineWidth = calculateLineWidth(smoothed);

  ctx.value.stroke();
  state.value.lastRenderTime = Date.now();
};

//绘制中
const draw = (e: MouseEvent | TouchEvent) => {
  if (!isDrawing.value || !ctx.value) return;

  const point = getCanvasPosition(e instanceof MouseEvent ? e : e.touches[0]);
  // 限制最大点数
  if (state.value.points.length > config.MAX_POINTS) {
    state.value.points.shift();
  }

  state.value.points.push(point);

  // 使用 requestAnimationFrame 节流
  requestAnimationFrame(() => {
    drawPath();
  });
};

//结束绘制
const endDrawing = () => {
  isDrawing.value = false;
};

//处理触摸事件
const handleTouchStart = (e: TouchEvent) => {
  e.preventDefault();
  startDrawing(e);
};
const handleTouchMove = (e: TouchEvent) => {
  e.preventDefault();
  draw(e);
};

//清除签名
const clearCanvas = () => {
  if (!ctx.value || !canvasRef.value) return;
  ctx.value.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
};

//保存签名
const saveSignature = () => {
  if (!canvasRef.value) return;
  const dataURL = canvasRef.value.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = 'signature.png';
  link.href = dataURL;
  link.click();
};
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
