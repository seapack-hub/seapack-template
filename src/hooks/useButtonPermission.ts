import { useRoute } from 'vue-router';

export default ()=>{
  // 获取当前路由信息
  const route = useRoute();

  /**
   * @function 判断单个按钮是否有权限
   * @param buttonPermission <object|undefined> 按钮权限标识
   * @returns <Boolean> true:有权限 false:无权限
   */
  const buttonHasPermission = (buttonPermission:{
    permission:string,
    type:string,
    name:string
  }|undefined)=>{
    // 获取当前路由名称作为元数据键
    const metaKey:string = String(route.name);
    // 从路由源数据获取按钮权限列表
    const buttonList:any = route?.meta?.buttonList ?? [];
    if(buttonPermission?.permission && buttonList?.length){
      return buttonList.some((item:{buttonMetaKey:string})=>{
        item?.buttonMetaKey === `${metaKey}.${buttonPermission?.type}.${buttonPermission?.permission}`;
      });
    }else return false;
  };

  /**
   * @function 批量判断按钮是否有权限
   * @param buttons
   * @returns 返回有权限的所有按钮
   */
  const buttonsHasPermission = (buttons:any[])=>{
    return buttons.filter((item:{buttonPermission:any})=>{
      if(item.buttonPermission) return buttonHasPermission(item?.buttonPermission);
      return true;
    });
  };

  return {
    buttonHasPermission,
    buttonsHasPermission
  };
};