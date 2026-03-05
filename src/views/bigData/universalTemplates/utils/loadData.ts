import * as Cesium from 'cesium';

//加载Json数据
export const loadJsonData = async (url:string, viewer:Cesium.Viewer)=>{
  if(!url || !viewer) return;
  
  try{
    // 从 public 目录加载 GeoJSON
    const response  = await fetch(url);
    if(!response.ok){
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const jsonData = await response.json();

    // 创建数据源（带样式配置）
    const dataSource = await Cesium.GeoJsonDataSource.load(jsonData,{
      stroke: Cesium.Color.WHITE.withAlpha(0.8), // 边框颜色
      fill: Cesium.Color.fromCssColorString('#0a3d8c').withAlpha(0.25), // 填充色（武汉蓝）
      strokeWidth: 2,
      clampToGround: true // 贴合地形（需开启地形）
    });

    // 自定义每个区的样式
    dataSource.entities.values.forEach(entity => {
      if(entity.polygon){
        const districtName = (entity.properties as any)?.name || '未知区域';
        // 添加区名标签
        entity.label = new Cesium.LabelGraphics({
          text: districtName,
          font: '14px sans-serif',
          fillColor: Cesium.Color.BLACK,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new Cesium.Cartesian2(0, -15),
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        })
        
        // 添加悬停高亮效果
        entity.polygon.height = new Cesium.ConstantProperty(0);
        entity.polygon.heightReference = new Cesium.ConstantProperty(Cesium.HeightReference.CLAMP_TO_GROUND);
        (entity as any).originalFillColor = entity.polygon.material
        entity.polygon.material = new Cesium.ColorMaterialProperty(
          Cesium.Color.fromCssColorString('#0a3d8c').withAlpha(0.25)
        )

         // 4. 添加到场景
        viewer.dataSources.add(dataSource)
        viewer.zoomTo(dataSource) // 可选：自动缩放至武汉范围
      }
    });
  }catch(err){
    console.error('加载Json数据失败:', err);
  }

}