<template>
  <div class="tags-view-container">
    <ScrollPane class="tags-view-wrapper">
      <RouterLink
          class="tags-view-item"
          v-for="tag in tagsViewStore.visitedViews"
          :to="tag.path"
      >
        {{tag.meta?.description}}
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
import path from "path-browserify";
const route = useRoute();
const router = useRouter();
const tagsViewStore = useTagsViewStore();
const permissionStore = usePermissionStore();
const {listenerRouteChange} = useRouteListener();

/**
 * 判断标签页是否固定
 */
const isAffix = (tag: TagView) => {
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
    tag.name&& tagsViewStore.addVisitedView(tag);
  }
}

/**
 * 添加标签页
 * @param route
 */
const addTags = (route:RouteLocationNormalized)=>{
  if(route.name){
    tagsViewStore.addVisitedView(route)
  }
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
      padding: 0 8px;
      font-size: 12px;
      &:first-of-type {
        margin-left: 5px;
      }
      &:last-of-type {
        margin-right: 5px;
      }
    }
  }
}
</style>