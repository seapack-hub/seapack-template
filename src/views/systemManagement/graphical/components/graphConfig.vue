<template>
  <transition name="panel-slide">
    <div v-show="!isOpen" class="graph-config absolute top-0 right-0 w-[240px] h-full">
      <!--配置-->
      <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
        <el-tab-pane label="节点" name="node">
          <div class="node-config">
            <el-form :model="nodeForm" ref="nodeFormRef" label-width="50px">
              <el-form-item label="标题" prop="name">
                <el-input v-model="nodeForm.name" placeholder="请输入节点名称" />
              </el-form-item>
              <el-form-item label="字号" prop="type">
                <el-input-number v-model="nodeForm.type" controls-position="right" placeholder="请输入字号" />
              </el-form-item>
              <el-form-item label="文字" prop="fontColor">  
                <el-color-picker v-model="nodeForm.fontColor" />
              </el-form-item>
              <el-form-item label="填充" prop="fillColor">
                <el-color-picker v-model="nodeForm.fillColor" />
              </el-form-item>
              <el-form-item label="边框" prop="strokeColor">
                <el-color-picker v-model="nodeForm.strokeColor" />
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
        <el-tab-pane label="线条" name="edge">
          <div class="edge-config">
            <el-form :model="edgeForm" ref="edgeFormRef" label-width="50px">
              <el-form-item label="线型">
                <el-select v-model="edgeForm.handleLine" placeholder="请选择线型">
                  <el-option label="实线" value="1" />
                  <el-option label="虚线" value="2" />
                </el-select>
              </el-form-item>
              <el-form-item label="箭头">
                <el-select v-model="edgeForm.handleArrow" placeholder="请选择箭头">
                  <el-option label="正向" value="1" />
                  <el-option label="逆向" value="2" />
                  <el-option label="双向" value="3" />
                </el-select>
              </el-form-item>
              <el-form-item label="颜色" prop="strokeColor">
                <el-color-picker v-model="edgeForm.strokeColor" />
              </el-form-item>
              <el-form-item label="文本" prop="text">
                <el-input v-model="edgeForm.text" placeholder="请输入文本" />
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
      </el-tabs>

      <el-button class="absolute top-50% left-[-15px] -translate-y-1/2 z-20 toggle-btn" :icon="DArrowRight" circle @click="togglePanel" />
    </div>
  </transition>
  <transition name="btn-fade">
    <el-button v-show="isOpen" class="absolute top-50% right-[5px] -translate-y-1/2 z-20 toggle-btn" :icon="DArrowLeft" circle @click="togglePanel" />
  </transition>
  
</template>

<script setup lang="ts">
import { DArrowRight,DArrowLeft} from '@element-plus/icons-vue'
const activeName = ref('node')

const handleClick = (tab: any) => {
  console.log(tab)
}
const isOpen = ref(false)
const isTransitioning = ref(false) // 防抖锁

const togglePanel = async () => {
  if (isTransitioning.value) return
  isTransitioning.value = true
  
  // 等待动画开始
  await nextTick()
  
  // 300ms 后解锁（与CSS过渡时间一致）
  setTimeout(() => {
    isOpen.value = !isOpen.value
    setTimeout(() => {
      isTransitioning.value = false
    }, 50)
  }, 50)
}

const nodeForm = reactive({
  name: '',
  type: 12,
  fontColor: '#262626',
  fillColor: '#fff',
  strokeColor: '#8f8f8f'
})

const edgeForm = reactive({
  handleLine: "1",
  handleArrow: '1',
  strokeColor: '#A2B1C3',
  text: ''
})

</script>

<style lang="scss" scoped>
.graph-config {
  background-color: #fff;
  padding: 10px;
  box-sizing: border-box;
  border: 1px solid #e8e8e8;
}

// ============ 按钮悬停反馈 ============
.toggle-btn {
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
}

// ============ 面板滑动过渡 ============
.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: transform 0.35s cubic-bezier(0.23, 1, 0.32, 1), 
              opacity 0.35s ease;
  will-change: transform, opacity;
}

.panel-slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.panel-slide-enter-to {
  transform: translateX(0);
  opacity: 1;
}

.panel-slide-leave-from {
  transform: translateX(0);
  opacity: 1;
}

.panel-slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

// ============ 按钮过渡优化 ============
.btn-fade-enter-active,
.btn-fade-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-fade-enter-from,
.btn-fade-leave-to {
  opacity: 0;
}

.btn-fade-enter-to,
.btn-fade-leave-from {
  opacity: 1;
}
</style>