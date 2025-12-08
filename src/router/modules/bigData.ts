interface RouterObject {
  [key: string]: any;
}
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
  }
];

export default bigDataRoute;