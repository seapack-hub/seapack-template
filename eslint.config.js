import js from '@eslint/js';
import globals from 'globals';
import pluginVue from 'eslint-plugin-vue';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

export default [
  // ── 忽略路径 ─────────────────────────────────────────────────
  // 跳过构建产物、自动生成的类型桩文件和依赖文件，使 lint 只检查手写源码。
  {
    ignores: [
      'dist/**',
      'components.d.ts',
      'auto-imports.d.ts',
      'node_modules/**',
      'src/assets/iconfont/**',
    ],
  },

  // ── 全局语言选项 ─────────────────────────────────────────────
  // 注入浏览器和 Node.js 的全局变量，避免 `window`、`process`、`require` 等误报。
  {
    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx,vue}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  // ── JavaScript 推荐规则 ───────────────────────────────────────
  // ESLint 内置推荐规则集：no-unused-vars、no-undef、no-extra-semi 等，仅对纯 JS/JSX 文件生效。
  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
    ...js.configs.recommended,
  },

  // ── Vue 3 推荐规则 ────────────────────────────────────────────
  // eslint-plugin-vue 针对 Vue 3 的扁平配置（优先级 A + B 规则）。
  ...pluginVue.configs['flat/recommended'],

  // ── Vue 专项覆盖 ─────────────────────────────────────────────
  // 调整部分 Vue 默认规则，并配置 TypeScript 解析器使 `<script lang="ts">` 块能进行类型检查。
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: {
          ts: tsParser,
          tsx: tsParser,
          js: 'espree',
        },
        extraFileExtensions: ['.vue'],
      },
    },
    rules: {
      'vue/html-indent': ['error', 2],                                   // 模板中强制 2 空格缩进
      'vue/html-self-closing': 'off',                                    // 允许自闭合和非自闭合两种写法
      'vue/multi-word-component-names': 'off',                           // 允许单单词组件名
      'vue/max-attributes-per-line': 'off',                              // 不限制每行属性数量
      'vue/singleline-html-element-content-newline': 'off',              // 允许单行元素内联内容
    },
  },

  // ── TypeScript 推荐规则 ─────────────────────────────────────────
  // @typescript-eslint 推荐规则集，用于类型感知的 lint 检查。
  // 下方针对项目实际情况放宽了若干规则。
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ['./tsconfig.json', './tsconfig.node.json'],
      },
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      semi: 'off',                                                       // Prettier 负责分号
      'no-unused-expressions': 'off',                                    // 交给下面的 TS 版本处理
      '@typescript-eslint/no-unused-expressions': 'off',                 // 允许链式表达式用作副作用
      '@typescript-eslint/no-explicit-any': 'off',                      // 允许 `any`（遗留代码 / 第三方代码中常见）
      '@typescript-eslint/no-require-imports': 'off',                   // 允许在 TS 文件中使用 CJS `require()`
      '@typescript-eslint/no-empty-object-type': 'off',                 // 允许 `interface Foo {}`（空接口）
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // 未使用变量给出警告，`_` 开头的参数忽略
    },
  },

  // ── 全局代码质量规则 ─────────────────────────────────────────
  // 捕获代码中残留的意外 console / debugger 语句。
  {
    rules: {
      'no-console': 'warn',       // console.log / .warn / .error 给出警告（非错误）
      'no-debugger': 'warn',      // debugger 给出警告（非错误），CI 中可以标记
    },
  },
];
