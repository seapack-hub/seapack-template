<template>
  <div class="x6-property-panel h-100% flex flex-col">
    <!-- 面板头部 -->
    <div class="panel-header">
      <span class="panel-title">{{ isNode ? '节点属性' : '线条属性' }}</span>
    </div>

    <!-- 面板内容 -->
    <div class="panel-content">
      <template v-if="isNode && node">
        <slot name="node-property" :node="node">
          <el-form label-width="60px" label-position="left" size="small">
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
        <slot name="edge-property" :edge="edge">
          <el-form label-width="60px" label-position="left" size="small">
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
        <div class="empty-hint">
          <el-icon :size="32" color="#c0c4cc"><Pointer /></el-icon>
          <p>点击节点或连线查看属性</p>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType, nextTick } from 'vue'
import { Node, Edge } from '@antv/x6'
import { Pointer } from '@element-plus/icons-vue'
import { debounce } from 'lodash-es'

const props = defineProps({
  node: { type: Object as PropType<Node | null>, default: null },
  edge: { type: Object as PropType<Edge | null>, default: null },
  isNode: { type: Boolean, default: false },
  modelValue: { type: Boolean, default: false },
})

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
</script>

<style lang="scss" scoped>
.x6-property-panel {
  display: flex;
  flex-direction: column;
}

.panel-header {
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid #e4e7ed;
  background: #fafbfc;
  flex-shrink: 0;
}

.panel-title {
  font-size: 13px;
  font-weight: 500;
  color: #303133;
}

.panel-content {
  flex: 1;
  padding: 12px 16px;
  overflow-y: auto;
}

.empty-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #909399;

  p {
    margin-top: 8px;
    font-size: 13px;
  }
}
</style>
