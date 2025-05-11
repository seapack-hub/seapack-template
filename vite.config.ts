/*
 * @Author: 曾海峰 zenghf@tsingyun.net
 * @Date: 2024-04-24 09:27:48
 * @LastEditors: 曾海峰 7753230+zenghaifenga@user.noreply.gitee.com
 * @LastEditTime: 2025-05-11 08:52:21
 * @FilePath: \seapack-template\vite.config.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import * as path from 'path'
import { resolve } from 'path'
import ElementPlus from 'unplugin-element-plus/vite'
//element-plus自动导入
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
//引入工具插件
import VueDevTools from 'vite-plugin-vue-devtools'
//配置UnoCSS
//import UnoCSS from 'unocss/vite'
//配置SVG
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
//引入地图组件
import cesium from 'vite-plugin-cesium'
//@ts-ignore
//import eslintPlugin from 'vite-plugin-eslint'
import eslint from 'vite-plugin-eslint';
import { type ConfigEnv, type UserConfigExport, loadEnv } from 'vite'

export default defineConfig(({mode}:ConfigEnv) => {
  const viteEnv = loadEnv(mode,process.cwd());
  const { VITE_PUBLIC_PATH } = viteEnv
  return {
    base:VITE_PUBLIC_PATH,
    server:{
      /** 设置 host: true 才可以使用 Network 的形式，以 IP 访问项目 */
      host:true,
      /** 端口号 */
      port:4444,
      /** 是否自动打开浏览器 */
      open:false,
      /** 是否允许跨域 */
      cors:true,
      /** 端口号被占用时，是否直接退出 */
      strictPort:false,
      /** 接口代理 */
      proxy:{
        "/api/v1": {
          target: "https://mock.mengxuegu.com/mock/63218b5fb4c53348ed2bc212",
          ws: true,
          /** 是否允许跨域 */
          changeOrigin: true
        }
      }
    },
    plugins: [
      vue(),
      cesium(),
      //配置ElementPlus,自动引入
      ElementPlus({}),
      AutoImport({
        resolvers: [ElementPlusResolver()],
        imports: ['vue','vue-router'], // 自动导入 Vue 相关函数
        dts: './auto-imports.d.ts', // 生成类型声明文件的路径
        eslintrc: {
          enabled: false,  // 1、改为true用于生成eslint配置。2、生成后改回false，避免重复生成消耗
        },
      }),
      Components({
        resolvers: [ElementPlusResolver()],
        // 指定自动导入的组件位置，默认是 src/components
        dirs:['src/components'],
      }),
      // SVG配置
      createSvgIconsPlugin({
        // 指定需要缓存的图标文件夹
        iconDirs: [resolve(process.cwd(), 'src/assets/icons')],
        // 指定symbolId格式
        symbolId: 'icon-[dir]-[name]',
      }),
      VueDevTools(),
      eslint({
        include: ['src/**/*.ts', 'src/**/*.js', 'src/**/*.vue', 'src/*.ts', 'src/*.js', 'src/*.vue']
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname,'src'),
        '@p':path.resolve(__dirname,'public'),
        '@ces':path.resolve(__dirname, 'src/views/worldData/cesium')
      },
    },
    lintOnSave: false,  // 添加这一行代码
  }
})
