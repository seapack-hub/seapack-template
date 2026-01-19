//导入​属性化模式​预设。允许你将类名写为 HTML 属性，例如 <div text-blue-500> 而非 <div class="text-blue-500">
import presetAttributify from '@unocss/preset-attributify';
//导入​图标​预设。使你可以直接通过 CSS 类名使用图标，例如 <div class="i-mdi-home">。使用前需要安装相应的图标集
import presetIcons from '@unocss/preset-icons';
//导入​旧版浏览器兼容​预设。用于处理一些兼容性问题，
//例如配置中的 commaStyleColorFunction: true 会将 rgb(255 0 0) 转换为兼容性更好的 rgb(255, 0, 0)
import presetLegacyCompat from '@unocss/preset-legacy-compat';
//导入 ​REM 转 PX​ 预设。此预设会将样式中的 rem 单位转换为 px 单位。
//配置的 baseFontSize: 4 意味着 1rem = 4px，所以 m-4 最终会生成 margin: 16px;
import presetRemToPx from '@unocss/preset-rem-to-px';
//导入 ​核心预设。它提供了一整套丰富的、Tailwind CSS 风格的原子化工具类，是整个样式系统的基石
import presetUno from '@unocss/preset-uno';
//导入 ​指令​ 转换器。它允许你在 CSS 中使用 @apply、@screen 等指令，让你能在样式表中引用原子化规则
import transformerDirectives from '@unocss/transformer-directives';
//导入 ​变体组​ 转换器。它允许你将多个具有相同前缀的类组合起来，
//例如 hover:(bg-gray-400 font-medium) 会被转换为 hover:bg-gray-400 hover:font-medium
import transformerVariantGroup from '@unocss/transformer-variant-group';
//从 UnoCSS 导入用于定义类型安全配置的工具函数
import { defineConfig } from 'unocss';

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons(),
    // rem 转 px 预设，例如 m-4 等价于 margin: 4px
    presetRemToPx({ baseFontSize: 4 }),
    presetAttributify(),
    presetLegacyCompat({
      // options
      commaStyleColorFunction: true
    })
  ],
  transformers: [transformerVariantGroup(), transformerDirectives()],
  theme: {
    breakpoints: {
      lg: '1440px',
      xl: '1920px'
    },
    // 确保基础字体大小符合预期
    fontSize: { 'base': '1rem' } 
  },
  shortcuts: {
    // 详情页面一级标题样式变量
    cardTitlePrimary: 'font-size-16px line-height-16px font-600 color-[#AAAAAA]'
  },
  rules: [['lh-1', { 'line-height': 1 }]]
});