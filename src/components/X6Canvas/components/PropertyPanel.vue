<template>
  <transition name="panel-slide">
    <div v-show="visible" class="x6-property-panel w-280px h-100% bg-white border-l border-gray-200 absolute top-0 right-0 z-10">
      <!-- 面板头部 -->
      <div class="panel-header h-40px flex items-center justify-between px-16px border-b border-gray-200">
        <span class="text-14px font-medium text-gray-700">{{ isNode ? '节点属性' : '线条属性' }}</span>
        <el-icon class="cursor-pointer text-gray-400 hover:text-gray-600" @click="togglePanel"><Close /></el-icon>
      </div>

      <!-- 面板内容 -->
      <div class="panel-content p-16px overflow-y-auto" style="height: calc(100% - 40px)">
        <template v-if="isNode && node">
          <!-- 自定义节点属性插槽 -->
          <slot name="node-property" :node="node">
            <el-form label-width="60px" label-position="left">
              <el-form-item label="标题">
                <el-input
                  :model-value="nodeForm.name"
                  placeholder="节点名称"
                  @change="(val: string) => updateNodeAttr('name', val)"
                />
              </el-form-item>
              <el-form-item label="字号">
                <el-input-number
                  :model-value="nodeForm.fontSize"
                  controls-position="right"
                  :min="8"
                  :max="72"
                  @change="(val: number) => updateNodeAttr('fontSize', val)"
                />
              </el-form-item>
              <el-form-item label="文字">
                <el-color-picker
                  :model-value="nodeForm.fontColor"
                  @change="(val: string) => updateNodeAttr('fontColor', val)"
                />
              </el-form-item>
              <el-form-item label="填充">
                <el-color-picker
                  :model-value="nodeForm.fillColor"
                  @change="(val: string) => updateNodeAttr('fillColor', val)"
                />
              </el-form-item>
              <el-form-item label="边框">
                <el-color-picker
                  :model-value="nodeForm.strokeColor"
                  @change="(val: string) => updateNodeAttr('strokeColor', val)"
                />
              </el-form-item>
            </el-form>
          </slot>
        </template>

        <template v-else-if="edge">
          <!-- 自定义边属性插槽 -->
          <slot name="edge-property" :edge="edge">
            <el-form label-width="60px" label-position="left">
              <el-form-item label="线型">
                <el-select
                  :model-value="edgeForm.handleLine"
                  placeholder="请选择线型"
                  @change="(val: string) => updateEdgeAttr('handleLine', val)"
                >
                  <el-option label="实线" value="1" />
                  <el-option label="虚线" value="2" />
                </el-select>
              </el-form-item>
              <el-form-item label="箭头">
                <el-select
                  :model-value="edgeForm.handleArrow"
                  placeholder="请选择箭头"
                  @change="(val: string) => updateEdgeAttr('handleArrow', val)"
                >
                  <el-option label="正向" value="1" />
                  <el-option label="逆向" value="2" />
                  <el-option label="双向" value="3" />
                </el-select>
              </el-form-item>
              <el-form-item label="颜色">
                <el-color-picker
                  :model-value="edgeForm.strokeColor"
                  @change="(val: string) => updateEdgeAttr('strokeColor', val)"
                />
              </el-form-item>
              <el-form-item label="文本">
                <el-input
                  :model-value="edgeForm.text"
                  placeholder="请输入文本"
                  @change="(val: string) => updateEdgeAttr('text', val)"
                />
              </el-form-item>
            </el-form>
          </slot>
        </template>

        <template v-else>
          <el-empty description="请选择节点或线条" :image-size="80" />
        </template>
      </div>

      <!-- 切换按钮 -->
      <el-button
        class="absolute top-50% left--15px -translate-y-1/2 z-20"
        :icon="DArrowRight"
        circle
        size="small"
        @click="togglePanel"
      />
    </div>
  </transition>

  <transition name="btn-fade">
    <el-button
      v-show="!visible"
      class="absolute top-50% right-5px -translate-y-1/2 z-20"
      :icon="DArrowLeft"
      circle
      size="small"
      @click="togglePanel"
    />
  </transition>
</template>

<script setup lang="ts">
import { PropType } from 'vue'
import { Node, Edge } from '@antv/x6'
import { DArrowRight, DArrowLeft, Close } from '@element-plus/icons-vue'
import { debounce } from 'lodash-es'

const props = defineProps({
  node: { type: Object as PropType<Node | null>, default: null },
  edge: { type: Object as PropType<Edge | null>, default: null },
  isNode: { type: Boolean, default: false },
  modelValue: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const togglePanel = () => {
  visible.value = !visible.value
}

// 节点属性映射
const NODE_ATTR_MAP = {
  name: ['text', 'text'],
  fontSize: ['text', 'fontSize'],
  fontColor: ['text', 'fill'],
  fillColor: ['body', 'fill'],
  strokeColor: ['body', 'stroke'],
} as const

const nodeForm = reactive({
  name: '',
  fontSize: 12,
  fontColor: '#262626',
  fillColor: '#fff',
  strokeColor: '#8f8f8f',
})

const edgeForm = reactive({
  handleLine: '1',
  handleArrow: '1',
  strokeColor: '#A2B1C3',
  text: '',
})

// 同步节点数据到表单
watch(
  () => props.node,
  async (newNode) => {
    if (!newNode) {
      Object.assign(nodeForm, {
        name: '',
        fontSize: 12,
        fontColor: '#262626',
        fillColor: '#fff',
        strokeColor: '#8f8f8f',
      })
      return
    }
    await nextTick()
    nodeForm.name = String(newNode.attrs?.text?.text ?? '')
    nodeForm.fontSize = Number(newNode.attrs?.text?.fontSize) || 12
    nodeForm.fontColor = String(newNode.attrs?.text?.fill ?? '#262626')
    nodeForm.fillColor = String(newNode.attrs?.body?.fill ?? '#fff')
    nodeForm.strokeColor = String(newNode.attrs?.body?.stroke ?? '#8f8f8f')
  },
  { immediate: true },
)

// 同步边数据到表单
watch(
  () => props.edge,
  async (newEdge) => {
    if (!newEdge) {
      Object.assign(edgeForm, {
        handleLine: '1',
        handleArrow: '1',
        strokeColor: '#A2B1C3',
        text: '',
      })
      return
    }
    await nextTick()
    edgeForm.strokeColor = String(newEdge.attrs?.line?.stroke ?? '#A2B1C3')
    edgeForm.text = String(newEdge.attrs?.text?.text ?? '')
    const dasharray = newEdge.attrs?.line?.strokeDasharray
    edgeForm.handleLine = dasharray ? '2' : '1'
    const hasTarget = !!newEdge.attrs?.line?.targetMarker
    const hasSource = !!newEdge.attrs?.line?.sourceMarker
    edgeForm.handleArrow = hasTarget && hasSource ? '3' : hasSource ? '2' : '1'
  },
  { immediate: true },
)

// 更新节点属性
const updateNodeAttr = debounce((field: keyof typeof nodeForm, value: any) => {
  if (!props.node || !NODE_ATTR_MAP[field]) return
  const [shape, attr] = NODE_ATTR_MAP[field]
  const update = { [shape]: { [attr]: value } }
  props.node.setAttrs(update)
}, 300)

// 更新边属性
const updateEdgeAttr = (field: keyof typeof edgeForm, value: any) => {
  if (!props.edge) return
  const updates: Record<string, any> = {}
  switch (field) {
    case 'strokeColor':
      updates.line = { stroke: value }
      props.edge.setAttrs(updates)
      break
    case 'text':
      props.edge.removeLabelAt(0)
      props.edge.appendLabel({
        attrs: {
          text: { text: value },
        },
      })
      break
    case 'handleLine':
      updates.line = {
        strokeDasharray: value === '2' ? '5 5' : undefined,
      }
      props.edge.setAttrs(updates)
      break
    case 'handleArrow':
      const markerCfg = { name: 'block', width: 12, height: 8 }
      if (value === '1') {
        updates.line = { targetMarker: markerCfg }
        props.edge.setAttrs(updates)
        props.edge.removeAttrByPath('line/sourceMarker')
      } else if (value === '2') {
        updates.line = { sourceMarker: markerCfg }
        props.edge.setAttrs(updates)
        props.edge.removeAttrByPath('line/targetMarker')
      } else if (value === '3') {
        updates.line = { sourceMarker: markerCfg, targetMarker: markerCfg }
        props.edge.setAttrs(updates)
      }
      break
  }
}

// 切换 Tabs 时同步激活状态
watch(
  () => props.isNode,
  (val) => {
    // 可用于切换标签页
  },
)
</script>

<style lang="scss" scoped>
.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: transform 0.35s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.35s ease;
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
