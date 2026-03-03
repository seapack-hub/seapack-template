<template>
  <transition name="panel-slide">
    <div v-show="!isOpen" class="graph-config absolute top-0 right-0 w-[240px] h-full">
      <!--配置-->
      <el-tabs v-model="activeName" class="demo-tabs">
        <el-tab-pane label="节点" name="node">
          <div class="node-config">
            <el-form :model="nodeForm" ref="nodeFormRef" label-width="50px">
              <el-form-item label="标题">
                <el-input 
                  v-model="nodeForm.name" 
                  @change="(val) => updateNodeAttr('name', val)"
                  placeholder="节点名称" 
                />
              </el-form-item>
              <el-form-item label="字号">
                <el-input-number 
                  v-model="nodeForm.fontSize" 
                  @change="(val) => updateNodeAttr('fontSize', val)"
                  controls-position="right" 
                  placeholder="字号" 
                  :min="8" 
                  :max="72"
                />
              </el-form-item>
              <el-form-item label="文字">  
                <el-color-picker 
                  v-model="nodeForm.fontColor" 
                  @change="(val) => updateNodeAttr('fontColor', val)"
                />
              </el-form-item>
              <el-form-item label="填充" prop="fillColor">
                <el-color-picker 
                  v-model="nodeForm.fillColor" 
                  @change="(val) => updateNodeAttr('fillColor', val)"
                />
              </el-form-item>
              <el-form-item label="边框" prop="strokeColor">
                <el-color-picker 
                  v-model="nodeForm.strokeColor" 
                  @change="(val) => updateNodeAttr('strokeColor', val)"
                />
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
        <el-tab-pane label="线条" name="edge">
          <div class="edge-config">
            <el-form :model="edgeForm" ref="edgeFormRef" label-width="50px">
              <el-form-item label="线型">
                <el-select 
                  v-model="edgeForm.handleLine" 
                  placeholder="请选择线型"
                  @change="(val) => updateEdgeAttr('handleLine', val)"
                >
                  <el-option label="实线" value="1" />
                  <el-option label="虚线" value="2" />
                </el-select>
              </el-form-item>
              <el-form-item label="箭头">
                <el-select 
                  v-model="edgeForm.handleArrow" 
                  placeholder="请选择箭头"
                  @change="(val) => updateEdgeAttr('handleArrow', val)"
                >
                  <el-option label="正向" value="1" />
                  <el-option label="逆向" value="2" />
                  <el-option label="双向" value="3" />
                </el-select>
              </el-form-item>
              <el-form-item label="颜色">
                <el-color-picker 
                  v-model="edgeForm.strokeColor" 
                  @change="(val) => updateEdgeAttr('strokeColor', val)" 
                />
              </el-form-item>
              <el-form-item label="文本" prop="text">
                <el-input 
                  v-model="edgeForm.text" 
                  @change="(val) => updateEdgeAttr('text', val)" 
                  placeholder="请输入文本" 
                />
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
import { PropType } from 'vue'
import { Node, Edge } from '@antv/x6';
import { DArrowRight,DArrowLeft} from '@element-plus/icons-vue';
import { debounce } from 'lodash-es' // 防抖优化（可选）

const props = defineProps({
  node: { type: Object as PropType<Node | null>, default: null },
  edge: { type: Object as PropType<Edge | null>, default: null },
  isNode: { type: Boolean, default: false }
})

// ============ 节点属性映射（关键！） ============
const NODE_ATTR_MAP = {
  name: ['text', 'text'],
  fontSize: ['text', 'fontSize'],
  fontColor: ['text', 'fill'],
  fillColor: ['body', 'fill'],
  strokeColor: ['body', 'stroke']
} as const

const activeName = ref('node')

//--按钮切换逻辑---------------
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
  fontSize: 12,
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

// ============ 同步节点数据到表单 ============
watch(() => props.node, async (newNode) => {
  if (!newNode) {
    // 清空表单
    Object.assign(nodeForm, {
      name: '', 
      fontSize: 12, 
      fontColor: '#262626',
      fillColor: '#fff', 
      strokeColor: '#8f8f8f'
    })
    return
  }
  // 等待节点渲染完成（避免 attrs 未初始化）
  await nextTick()
  nodeForm.name = String(newNode.attrs?.text?.text ?? '')
  nodeForm.fontSize = Number(newNode.attrs?.text?.fontSize) || 12
  nodeForm.fontColor = String(newNode.attrs?.text?.fill ?? '#262626')
  nodeForm.fillColor = String(newNode.attrs?.body?.fill ?? '#fff')
  nodeForm.strokeColor = String(newNode.attrs?.body?.stroke ?? '#8f8f8f')
}, { immediate: true })

// ============ 同步边数据到表单 ============
watch(() => props.edge, async (newEdge) => {
  if (!newEdge) {
    Object.assign(edgeForm, { handleLine: '1', handleArrow: '1', strokeColor: '#A2B1C3', text: '' })
    return
  }
  await nextTick()
  edgeForm.strokeColor = String(newEdge.attrs?.line?.stroke ?? '#A2B1C3')
  edgeForm.text = String(newEdge.attrs?.text?.text ?? '')
  // 解析线型（根据实际 attrs 结构调整）
  const dasharray = newEdge.attrs?.line?.strokeDasharray
  edgeForm.handleLine = dasharray ? '2' : '1'
  // 解析箭头（示例：根据 targetMarker 判断）
  const hasTarget = !!newEdge.attrs?.line?.targetMarker
  const hasSource = !!newEdge.attrs?.line?.sourceMarker
  edgeForm.handleArrow = hasTarget && hasSource ? '3' : hasSource ? '2' : '1'
}, { immediate: true });

// ============ 更新节点属性（带防抖） ============
const updateNodeAttr = debounce((field: keyof typeof nodeForm, value: any) => {
  if (!props.node || !NODE_ATTR_MAP[field]) return
  const [shape, attr] = NODE_ATTR_MAP[field]
  const update = { [shape]: { [attr]: value } }
  // ✅ 安全更新：使用 X6 API（触发重绘+历史记录）
  props.node.setAttrs(update)
}, 300)

// ============ 更新边属性（特殊处理线型/箭头） ============
const updateEdgeAttr = (field: keyof typeof edgeForm, value: any) => {
  if (!props.edge) return
  const updates: Record<string, any> = {}
  switch (field) {
    case 'strokeColor':
      updates.line = { stroke: value }
      props.edge.setAttrs(updates)
      break
    case 'text':
      props.edge.removeLabelAt(0);
      props.edge.appendLabel({
        attrs: {
          text: {
            text:value
          },
        },
      })
      break
    case 'handleLine': // 线型：实线/虚线
      updates.line = { 
        strokeDasharray: value === '2' ? '5 5' : undefined 
      }
      props.edge.setAttrs(updates)
      break
    case 'handleArrow': // 箭头方向
      const markerCfg = { name: 'block', width: 12, height: 8 }
      if(value === '1'){
        updates.line = {targetMarker:markerCfg}
        props.edge.setAttrs(updates)
        props.edge.removeAttrByPath('line/sourceMarker')
      }else if(value === '2'){
        updates.line = {sourceMarker:markerCfg}
        props.edge.setAttrs(updates)
        props.edge.removeAttrByPath('line/targetMarker')
      }else if(value === '3'){
        updates.line = {sourceMarker:markerCfg,targetMarker:markerCfg}
        props.edge.setAttrs(updates)
      }
      break
  }
}

// ============ 切换 Tabs 时同步激活状态 ============
watch(() => props.isNode, (val) => {
  activeName.value = val ? 'node' : 'edge'
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