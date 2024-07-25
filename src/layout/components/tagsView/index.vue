<template>
  <div class="tags-view-container">
    <ScrollPane class="tags-view-wrapper">
      <RouterLink
          v-for="tag in tagsViewStore.visitedViews"
          :to="tag.path"
          class="tags-view-item"
          :class="{active:isActive(tag)}"
      >
        {{tag.meta?.description}}
        <el-icon v-if="!isAffix(tag)" size="12" @click.prevent.stop="closeSelectedTag(tag)">
          <Close/>
        </el-icon>
      </RouterLink>
    </ScrollPane>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref, watch } from "vue";
import {
  type RouteLocationNormalized,
  type RouteRecordRaw,
    RouterLink,
    useRoute,
    useRouter
} from "vue-router"
import {type TagsView,useTagsViewStore} from "@/store/modules/tags-view.ts";
import {usePermissionStore} from "@/store/modules/permission.ts";
import {useRouteListener} from "@/hooks/useRouteListener.ts"
import ScrollPane from "@/layout/components/tagsView/ScrollPane.vue";
import { Close } from "@element-plus/icons-vue"
import path from "path-browserify";
const route = useRoute();
const router = useRouter();
const tagsViewStore = useTagsViewStore();
const permissionStore = usePermissionStore();
const {listenerRouteChange} = useRouteListener();

/**
 * 判断标签页是否固定
 */
const isAffix = (tag: TagsView) => {
  return tag.meta?.affix
}
/**
 * 筛选出固定标签页
 * @param routes
 * @param basePath
 */
const filterAffixTags = (routes:RouteRecordRaw[],basePath="/")=>{
  const tags:TagsView[]=[];
  routes.forEach(route=>{
    if(isAffix(route)){
      const tagPath = path.resolve(basePath,route.path);
      tags.push({
        fullPath:tagPath,
        path:tagPath,
        name:route.name,
        meta:{...route.meta}
      })
    }
    if(route.children){
      const childTags = filterAffixTags(route.children,route.path);
      tags.push(...childTags)
    }
  });
  return tags;
}

/**
 * 初始化标签页
 */
const initTags = ()=>{
  const affixTags = filterAffixTags(permissionStore.routes);
  for(const tag of affixTags){
    tag.name && tagsViewStore.addVisitedView(tag);
  }
}

/**
 * 添加标签页
 * @param route
 */
const addTags = (route:RouteLocationNormalized)=>{
  if(route.name){
    tagsViewStore.addVisitedView(route)
    tagsViewStore.addCacheView(route)
  }
}

const toLastView = (visitedViews:TagsView[],view:TagsView)=>{
  //获取最后一个标签页,slice 返回一个索引和另一个索引之间的数据(不改变原数组)
  const lastView = visitedViews.slice(-1)[0];
  const fullPath = lastView?.fullPath;
  //路径存在则，跳转
  if(fullPath !== undefined){
    router.push(fullPath)
  }else{
    // 如果路径全部都关闭了，重定向到主页
    // 重新加载主页
    router.push({ path: "/redirect" + view.path, query: view.query })
  }
}
/**
 * 关闭当前点击的标签页
 * @param view
 */
const closeSelectedTag = (view:TagsView)=>{
  tagsViewStore.delVisitedView(view);
  tagsViewStore.delCachedView(view);
  isActive(view) && toLastView(tagsViewStore.visitedViews,view);
}

/**
 * 判断标签页是否激活
 * @param view
 */
const isActive = (view:TagsView) =>{
  return view.path === route.path;
}
onMounted(()=>{
  initTags();
  listenerRouteChange(async (route)=>{
    addTags(route)
  },true);
})
</script>

<style scoped lang="scss">
.tags-view-container{
  height:var(--tags-view-height);
  width: 100%;
  .tags-view-wrapper{
    .tags-view-item{
      display: inline-block;
      position: relative;
      cursor: pointer;
      height: 26px;
      line-height: 26px;
      color:var(--tags-view-text-color);
      border: 1px solid var(--tags-view-tag-border-color);
      border-radius: 2px;
      background-color: var(--tags-view-tag-bg-color);
      padding: 0 8px 0 4px;
      font-size: 12px;
      Text-decoration: none;
      margin-left: 5px;
      margin-top: 4px;
      &:first-of-type {
        margin-left: 5px;
      }
      &:last-of-type {
        margin-right: 5px;
      }
      &.active {
        background-color: var(--tags-view-tag-active-bg-color);
        color: var(--tags-view-tag-active-text-color);
        border-color: var(--tags-view-tag-active-border-color);
      }
      .el-icon{
        border-radius: 50%;
        margin-top: -2px;
        vertical-align:middle;
        &:hover {
          background-color: var(--tags-view-tag-icon-hover-bg-color);
          color: var(--tags-view-tag-icon-hover-color);
        }
      }
    }
  }
}
</style>