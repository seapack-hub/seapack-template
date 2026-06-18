import type { RouterPlugin } from './types'
// @ts-ignore
import NProgress from 'nprogress'
import { setRouteChange } from '@/hooks/useRouteListener.ts';
import 'nprogress/nprogress.css'

/**
 * 进度条插件
 */
export const progressPlugin:RouterPlugin = {
  name: "ProgressPlugin",
  priority:10,
  beforeEach({next}){
    //进度条开始
    NProgress.start();
    next()
  },
  afterEach(to,_from){
    //进度条结束
    NProgress.done();
    //监听路由变化
    setRouteChange(to)
  }
}