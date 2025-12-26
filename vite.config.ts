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
import UnoCSS from 'unocss/vite'
//配置SVG
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
//引入地图组件
import cesium from 'vite-plugin-cesium'
//@ts-ignore
//import eslintPlugin from 'vite-plugin-eslint'
import eslint from 'vite-plugin-eslint';
import { type ConfigEnv, type UserConfigExport, loadEnv } from 'vite';

//引入mock服务
//import mockDevServerPlugin from 'vite-plugin-mock-dev-server'
import { viteMockServe } from 'vite-plugin-mock';
export default defineConfig(({mode}:ConfigEnv) => {
  const viteEnv = loadEnv(mode,process.cwd());
  const { VITE_PUBLIC_PATH,VITE_MOCK_DEV_SERVER,VITE_BASE_API,VITE_APP_API_URL,NODE_ENV } = viteEnv;
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
        "/api": {
          target: VITE_APP_API_URL,
          ws: true,
          /** 是否允许跨域 */
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        }
      }
    },
    plugins: [
      vue(),
      VITE_MOCK_DEV_SERVER === "true" ? viteMockServe({
        ignore: /^\_/,
        mockPath: 'mock',   // Mock 文件存放目录（默认 `mock`）
        localEnabled: false,     // 开发环境启用 Mock
        prodEnabled: true,     // 生产环境禁用 Mock
        supportTs: true,       // 支持 TypeScript 文件
        logger: true,           // 控制台显示请求日志
        watchFiles: true,       // 监听 Mock 文件修改自动更新
        injectCode: `import { setupProdMockServer } from '../mock/mockProdServer.ts'; setupProdMockServer();`, 
      }) : null,
      cesium(),
      //配置ElementPlus,自动引入
      ElementPlus({}),
      AutoImport({
        resolvers: [ElementPlusResolver()],
        imports: ['vue','vue-router','@vueuse/core'], // 自动导入 Vue 相关函数
        dts: './auto-imports.d.ts', // 生成类型声明文件的路径
        eslintrc: {
          enabled: false,  // 1、改为true用于生成eslint配置。2、生成后改回false，避免重复生成消耗
        },
      }),
      UnoCSS(),
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
    // 预加载项目必需的组件
    optimizeDeps: {
      include:[
        "@wangeditor/editor",
        "@wangeditor/editor-for-vue",
      ]
    },
    lintOnSave: false,  // 添加这一行代码
    build:{
      target: 'es2020'
    }
  }
})
