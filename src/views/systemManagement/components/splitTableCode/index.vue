<template>
  <ResizableSplit>
    <template #leftPanel>
      <!-- 左侧：Vue组件的实时渲染效果 -->
      <div class="preview-area">
        <TableComponent></TableComponent>
      </div>
    </template>
    <template #rightPanel>
      <!-- 右侧：代码编辑器 -->
      <CodeMirror
        v-model:value="sourceCode"
        :options="cmOptions"
        
        @change="onCodeChange"
      />
    </template>
  </ResizableSplit>
</template>

<script setup lang="ts">
// 正确导入方式
import CodeMirror from 'codemirror-editor-vue3';
import { oneDark } from '@codemirror/theme-one-dark'
import { javascript } from '@codemirror/lang-javascript'

// 代码折叠所需的样式和脚本
//import 'codemirror/addon/fold/foldgutter.css'
// 引入展示的组件
import TableComponent from "../encapsulationTable/index.vue";

// 源代码数据
const sourceCode = ref('');
const extensions = ref([javascript()])
// CodeMirror 配置选项
const cmOptions = ref({
  mode: 'vue', // 根据显示的代码类型设置，如 'javascript', 'vue'
  lineNumbers: true, // 显示行号
  lineWrapping: true, // 自动换行
  foldGutter: true,         // 代码折叠
  highlightSelectionMatches: true, // 高亮选中匹配
 // theme: oneDark, // 应用 One Dark 黑色主题
  //gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'], // 装订线配置[5,9](@ref)
});

// 在组件挂载后加载源码
onMounted(async () => {
  try {
    // 方法1: 使用 import 导入原始文件
    const module = await import('../encapsulationTable/index.vue?raw')
    sourceCode.value = module.default
  } catch (error) {
    // 方法2: 使用 XMLHttpRequest 加载文件
    loadSourceCode()
  }
});

// 备用方法：通过 XMLHttpRequest 加载文件
const loadSourceCode = () => {
  const xhr = new XMLHttpRequest()
  xhr.open('GET', '../encapsulationTable/index.vue', false);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
      sourceCode.value = xhr.responseText
    }
  };
  xhr.send();
}

// 当代码变化时的处理函数
const onCodeChange = (newCode: string) => {
  console.log('代码已更改:', newCode)
  // 这里可以添加更复杂的逻辑，比如通过动态编译执行新代码
}
</script>

<style lang="scss" scoped></style>