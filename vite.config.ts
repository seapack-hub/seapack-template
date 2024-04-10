import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import * as path from 'path';
import ElementPlus from 'unplugin-element-plus/vite';
//自动导入
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
      vue(),
      //配置ElementPlus
      ElementPlus({}),
      AutoImport({
          resolvers:[ElementPlusResolver()]
      }),
      Components({
          resolvers:[ElementPlusResolver()]
      })
  ],
  resolve:{
    alias:{
      "@":path.resolve('./src')
    }
  }
})
