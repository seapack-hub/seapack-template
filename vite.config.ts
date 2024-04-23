import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import * as path from 'path';
import {resolve} from 'path';
import ElementPlus from 'unplugin-element-plus/vite';
//element-plus自动导入
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

//引入工具插件
import VueDevTools from 'vite-plugin-vue-devtools'

//配置UnoCSS
import UnoCSS from 'unocss/vite';
//配置SVG
import {createSvgIconsPlugin} from "vite-plugin-svg-icons";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
      vue(),
      //配置ElementPlus,自动引入
      ElementPlus({}),
      AutoImport({
          resolvers:[ElementPlusResolver()]
      }),
      Components({
          resolvers:[ElementPlusResolver()]
      }),
      UnoCSS(),
      // SVG配置
      createSvgIconsPlugin({
          // 指定需要缓存的图标文件夹
          iconDirs:[resolve(process.cwd(),'src/assets/icons')],
          // 指定symbolId格式
          symbolId: 'icon-[dir]-[name]'
      }),
      VueDevTools()
  ],
  resolve:{
    alias:{
      "@":path.resolve('./src')
    }
  }
})
