<template>
  <div class="captcha-wrapper">
    <div class="title">
      滑动完成验证
    </div>
    <div
      ref="container"
      class="captcha-container"
    >
      <el-skeleton
        :loading="loading"
        animated
      >
        <template #template>
          <el-skeleton-item
            variant="image"
            style="width: 100%; height: 155px;"
          />
        </template>
        <!-- 背景图 -->
        <img
          :src="bgImage"
          class="bg-image"
        />
        <!-- 滑块图 -->
        <img
          :src="sliderImage"
          class="slider-image"
          :style="{ left: sliderImageX + 'px',top:sliderImageY + 'px' }"
        />
      </el-skeleton>
      <!--轨道和滑块-->
      <div class="slider-track-container">
        <!-- 滑块轨道 -->
        <div class="slider-track">
          <!-- 进度填充条 -->
          <div
            class="slider-track-fill"
            :style="{ width: fillPercentage + '%' }"
          ></div>
        </div>
        <!-- 可拖动滑块 -->
        <div 
          class="slider-thumb" 
          :class="{ dragging: isDragging }"
          :style="{ left: sliderX + 'px' }" 
          @mousedown="startDrag" 
          @touchstart="startDrag"
        >
          <div class="thumb-icon">
            ↔️
          </div>
        </div>
      </div>
    </div>
    <!-- 状态提示 -->
    <div
      class="status-text"
      :class="{'success-text':statusFlag}"
    >
      {{ statusText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { getSlideVerifyImg} from "@/api/login/index"

interface TrackPoint {
  x: number;
  t: number;
}
const emit = defineEmits(['success']);
const loading= ref(true);
// 响应式数据
const bgImage = ref('');
const sliderImage = ref('');
const token = ref('');
//滑块位置
const sliderX = ref(0);
//滑块图片X位置
const sliderImageX = ref(0);
//滑块图片Y位置
const sliderImageY = ref(0);
const isDragging = ref(false);
const container = ref<HTMLElement | null>(null);
const trackPoints = ref<TrackPoint[]>([]);
const startTime = ref(0);
const statusText = ref("请按住滑块，拖动到最右侧"); // 状态提示文本[7](@ref)
const statusFlag = ref(false);
const maxX = ref(0); // 最大可拖动距离
// 计算填充百分比（用于轨道填充效果）
const fillPercentage = computed(() => {
  return maxX.value ? Math.min(100, (sliderX.value / maxX.value) * 100) : 0;
});

// 初始化验证码
const initCaptcha = async () => {
  try {
    loading.value = true;
    const data = await getSlideVerifyImg();
    bgImage.value = data.bgImage;
    sliderImage.value = data.sliderImage;
    token.value = data.token;
    //初始高度加上边框的厚度
    sliderImageY.value = data.sliderY - 1.5;

    // 重置状态
    sliderX.value = 0;
    sliderImageX.value = 0;
    isDragging.value = false;
    statusText.value = "请按住滑块，拖动到最右侧";
    
    // 设置最大拖动距离（容器宽度 - 滑块宽度）
    if (container.value) {
      maxX.value = container.value.offsetWidth - 50;
    }
    loading.value = false;
  } catch (error) {
    statusText.value = "验证码加载失败，点击重试";
  }
};

// 开始拖动
const startDrag = (e: MouseEvent | TouchEvent) => {
  e.preventDefault();
  isDragging.value = true;
  startTime.value = Date.now();
  trackPoints.value = [];
  statusText.value = "拖动中...";

  // 添加全局事件监听
  const moveEvent = e instanceof MouseEvent ? 'mousemove' : 'touchmove';
  const upEvent = e instanceof MouseEvent ? 'mouseup' : 'touchend';

  document.addEventListener(moveEvent, dragHandler);
  document.addEventListener(upEvent, endDrag);

  document.body.style.overflow = 'hidden';
};

// 拖动处理
const dragHandler = (e: MouseEvent | TouchEvent) => {
  if (!isDragging.value || !container.value) return;

  // 获取坐标
  const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;

  // 计算相对位置
  const rect = container.value.getBoundingClientRect();
  const newX = clientX - rect.left - 25; // 中心点对齐

  //计算滑块的边界
  sliderX.value = Math.max(0, Math.min(newX, maxX.value));
  //设置滑块图片的边界
  sliderImageX.value = sliderX.value;
  // 记录轨迹点
  trackPoints.value.push({
    x: sliderX.value,
    t: Date.now() - startTime.value
  });
};

// 结束拖动并验证
const endDrag = async (e: Event) => {
  isDragging.value = false;
  document.body.style.overflow = ''; // 恢复滚动

  // 移除事件监听
  const isMouseEvent = e.type === 'mouseup';
  document.removeEventListener(isMouseEvent ? 'mousemove' : 'touchmove', dragHandler);
  document.removeEventListener(e.type, endDrag);
  submitData();
};

const lastSet = (isValid:boolean)=>{
  if(isValid){
    statusText.value = "验证成功 ✓";
    statusFlag.value = true;
  }else{
    statusText.value = "验证失败，请重试";
    statusFlag.value = false;
    // 自动回弹动画
    const startPos = sliderX.value;
    const duration = 300;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / duration);
      sliderX.value = startPos - (startPos * progress);
      sliderImageX.value = sliderX.value - 15;
      
      if (progress < 1) requestAnimationFrame(animate);
    };
    animate();
  }
}

//提交数据
const submitData = () => {
  emit('success', { 
    sliderX: sliderX.value,
    token:token.value
  }); 
};

defineExpose({
  lastSet,
  initCaptcha
});
//初始化验证码
//initCaptcha();
</script>

<style scoped lang="scss">
.captcha-wrapper {
  width: 330px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  .title {
    text-align: center;
    font-size: 16px;
    color: #333;
    margin-bottom: 12px;
    font-weight: 500;
  }
  /* 容器样式 */
  .captcha-container {
    position: relative;
    width: 100%;
    height: 195px;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border: 1px solid #e6e8eb;

    .bg-image {
      width: 100%;
      height: 155px; /* 给轨道留空间 */
      display: block;
      object-fit: cover;
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
    }

    /* 滑块图样式 */
    .slider-image {
      position: absolute;
      width: 50px;
      height: 50px;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      border: 1px solid #fff;
      cursor: pointer;
      transition: transform 0.1s;
      z-index: 2;
    }

    /* 轨道容器 */
    .slider-track-container {
      position: absolute;
      bottom: 0;
      width: 100%;
      height: 35px;
      background: #f7f9fa;
      display: flex;
      align-items: center;
      padding: 0 10px;
      box-sizing: border-box;

      .slider-track {
        position: relative;
        width: 100%;
        height: 6px;
        background: #e0e4e7;
        border-radius: 3px;
        overflow: hidden;

        .slider-track-fill {
          position: absolute;
          height: 100%;
          background: #1e88e5;
          border-radius: 3px;
          transition: width 0.1s;
        }
      }

      /* 滑块按钮 */
      .slider-thumb {
        position: absolute;
        width: 50px;
        height: 30px;
        background: #fff;
        border-radius: 15px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
        cursor: grab;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 3;
        margin-top:5px;
        transition: transform 0.2s,box-shadow 0.2s;
        .thumb-icon {
          font-size: 16px;
          color: #1e88e5;
        }
      }
      .slider-thumb.dragging {
        box-shadow: 0 4px 12px rgba(30, 136, 229, 0.3);
        transform: scale(1.05);
        background: #e3f2fd;
      }
    }
  }
  /* 状态文本 */
  .status-text {
    text-align: center;
    font-size: 14px;
    margin-top: 5px;
    height: 25px;
    color: #666;
    transition: color 0.3s;
  }
  .success-text{
    color:#00f715;
  }
}
</style>
