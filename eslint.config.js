/**
 * ESLint 扁平化配置文件 (Flat Config)
 * 用于配置 Vue + JavaScript/TypeScript 项目的代码规范检查规则
 */
import js from '@eslint/js'; // ESLint 官方核心规则集
import globals from 'globals'; // 全局变量定义（如 browser/node 环境变量）
import pluginVue from 'eslint-plugin-vue'; // Vue 单文件组件专用规则插件
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

export default [
  // 基础配置 ---------------------------------------------------------------
  // {
  //   // 应用范围：所有 JS/TS/Vue 文件
  //   files: ['**/*.{js,mjs,cjs,jsx,ts,tsx,vue}'],
  //   // 全局变量配置
  //   languageOptions: {
  //     globals: {
  //       ...globals.browser, // 浏览器环境全局变量
  //       ...globals.node // Node.js 环境全局变量（可选）
  //     }
  //   }
  // },

  // // ESLint 核心规则 --------------------------------------------------------
  // {
  //   files: ['**/*.{js,mjs,cjs,jsx}'],
  //   ...js.configs.recommended // 应用 ESLint 推荐规则
  // },

  // // Vue 3 规则配置 --------------------------------------------------------
  // ...pluginVue.configs['flat/recommended'],
  // {
  //   files: ['**/*.vue'],
  //   // Vue 专用解析器
  //   languageOptions: {
  //     parser: pluginVue.parser,
  //     parserOptions: {
  //       parser: {
  //         // 为 `<script>` 块指定 TypeScript 解析器
  //         ts: tsParser, // 解析 `<script lang="ts">`
  //         js: 'espree' // 默认 JS 解析器
  //       },
  //       extraFileExtensions: ['.vue']
  //     }
  //   },
  //   plugins: {
  //     vue: pluginVue
  //   },
  //   rules: {
  //     'vue/html-indent': ['error', 2],
  //     'vue/html-self-closing': [
  //       'off'
  //     ]
  //   }
  // },

  // // TypeScript 规则配置 ----------------------------------------------------
  // {
  //   files: ['**/*.{ts,tsx}'],
  //   plugins: {
  //     '@typescript-eslint': tsPlugin
  //   },
  //   languageOptions: {
  //     parser: tsParser,
  //     parserOptions: {
  //       project: './tsconfig.json' // 关联 TS 配置文件
  //     }
  //   },
  //   rules: {
  //     ...tsPlugin.configs.recommended.rules, // TS 推荐规则
  //     semi: ['error', 'always'], // 强制分号
  //     'no-unused-expressions': 'off', //关闭
  //     '@typescript-eslint/no-unused-expressions': 'off',
  //     '@typescript-eslint/no-explicit-any': 'off' // 关闭 no-explicit-any 规则
  //     // "indent": "off", // 关闭基础 indent 规则
  //     // "@typescript-eslint/indent": ["error", 2] // TS 专用缩进规则
  //   }
  // },

  // // 通用规则覆盖 ----------------------------------------------------------
  // {
  //   rules: {
  //     'no-console': 'warn', // 禁止 console
  //     'vue/multi-word-component-names': 'off' // 允许单单词组件名
  //   }
  // }
];
