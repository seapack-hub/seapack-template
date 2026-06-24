import type { RouteRecordRaw } from 'vue-router';
type RouterObject = RouteRecordRaw & {
  show?: boolean;
  children?: RouterObject[];
};
const bigDataRoute:Array<RouterObject> = [
  //通用大屏模板
  {
    path:"/universalTemplate",
    name:"universalTemplate",
    component:()=> import("@/views/bigData/universalTemplates/index.vue"),
    meta:{
      title: "universalTemplate",
      description: "通用大屏模板",
    }
  },
  // DataV智慧运营大屏
  {
    path:"/bigScreen",
    name:"bigScreen",
    component:()=> import("@/views/bigScreen/index.vue"),
    meta:{
      title: "bigScreen",
      description: "智慧运营大数据中心",
    }
  }
];

export default bigDataRoute;