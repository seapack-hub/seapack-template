/**
 * GCJ02（火星坐标）转 WGS84（标准经纬度）
 * 算法来源：coordtransform 开源库（MIT License）
 * 优化：添加中国境外坐标保护 + 迭代精度控制
 */

// 判断是否在中国境内（偏移仅在中国生效）
const isOutOfChina = (lng: number, lat: number): boolean => {
  if (lng < 72.004 || lng > 137.8347) return true
  if (lat < 0.8293 || lat > 55.8271) return true
  return false
}

// 基础偏移计算（GCJ02加密算法逆过程）
const delta = (lat: number, lng: number): { dLat: number; dLng: number } => {
  const a = 6378245.0 // 长半轴
  const ee = 0.00669342162296594323 // 偏心率平方
  
  let dLat = transformLat(lng - 105.0, lat - 35.0)
  let dLng = transformLng(lng - 105.0, lat - 35.0)
  
  const radLat = lat / 180.0 * Math.PI
  let magic = Math.sin(radLat)
  magic = 1 - ee * magic * magic
  const sqrtMagic = Math.sqrt(magic)
  
  dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * Math.PI)
  dLng = (dLng * 180.0) / (a / sqrtMagic * Math.cos(radLat) * Math.PI)
  
  return { dLat, dLng }
}

const transformLat = (x: number, y: number): number => {
  let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x))
  ret += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0
  ret += (20.0 * Math.sin(y * Math.PI) + 40.0 * Math.sin(y / 3.0 * Math.PI)) * 2.0 / 3.0
  ret += (160.0 * Math.sin(y / 12.0 * Math.PI) + 320 * Math.sin(y * Math.PI / 30.0)) * 2.0 / 3.0
  return ret
}

const transformLng = (x: number, y: number): number => {
  let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x))
  ret += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0
  ret += (20.0 * Math.sin(x * Math.PI) + 40.0 * Math.sin(x / 3.0 * Math.PI)) * 2.0 / 3.0
  ret += (150.0 * Math.sin(x / 12.0 * Math.PI) + 300.0 * Math.sin(x / 30.0 * Math.PI)) * 2.0 / 3.0
  return ret
}

/**
 * GCJ02 转 WGS84（迭代优化版 - 精度0.1米内）
 * @param lng 经度（GCJ02）
 * @param lat 纬度（GCJ02）
 * @returns [经度(WGS84), 纬度(WGS84)]
 */
export const gcj02ToWgs84 = (lng: number, lat: number): [number, number] => {
  // 中国境外坐标直接返回（无偏移）
  if (isOutOfChina(lng, lat)) return [lng, lat]
  
  // 第一次粗略纠偏
  const { dLat, dLng } = delta(lat, lng)
  let mgLat = lat - dLat
  let mgLng = lng - dLng
  
  // 迭代优化（2次足够，精度达0.1米）
  for (let i = 0; i < 2; i++) {
    const { dLat: dLat2, dLng: dLng2 } = delta(mgLat, mgLng)
    const newLat = lat - dLat2
    const newLng = lng - dLng2
    
    // 收敛判断（变化小于1e-6则停止）
    if (Math.abs(newLat - mgLat) < 1e-6 && Math.abs(newLng - mgLng) < 1e-6) {
      break
    }
    mgLat = newLat
    mgLng = newLng
  }
  
  return [mgLng, mgLat] // 注意：返回[经度, 纬度]
}

/**
 * 批量转换坐标数组（性能优化版）
 * @param coords 嵌套坐标数组
 * @returns 转换后的坐标数组
 */
export const transformCoords = (coords: any[]): any[] => {
  // 处理单个坐标点 [lng, lat]
  if (Array.isArray(coords) && coords.length === 2 && typeof coords[0] === 'number') {
    return gcj02ToWgs84(coords[0], coords[1])
  }
  
  // 递归处理嵌套结构（LineString/Polygon/MultiPolygon）
  return coords.map(item => 
    Array.isArray(item) ? transformCoords(item) : item
  )
}

/**
 * 转换整个GeoJSON对象
 * @param geojson 原始GeoJSON（GCJ02）
 * @returns 转换后的GeoJSON（WGS84）
 */
export const convertGeoJSON = (geojson: any): any => {
  const converted = JSON.parse(JSON.stringify(geojson)) // 深拷贝
  
  const processGeometry = (geom: any) => {
    if (!geom || !geom.coordinates) return
    
    switch (geom.type) {
      case 'Point':
        geom.coordinates = transformCoords(geom.coordinates)
        break
      case 'LineString':
      case 'MultiPoint':
        geom.coordinates = geom.coordinates.map((coord: number[]) => transformCoords(coord))
        break
      case 'Polygon':
      case 'MultiLineString':
        geom.coordinates = geom.coordinates.map((ring: number[][]) => 
          ring.map((coord: number[]) => transformCoords(coord))
        )
        break
      case 'MultiPolygon':
        geom.coordinates = geom.coordinates.map((polygon: number[][][]) => 
          polygon.map((ring: number[][]) => 
            ring.map((coord: number[]) => transformCoords(coord))
          )
        )
        break
      case 'GeometryCollection':
        geom.geometries.forEach(processGeometry)
        break
    }
  }
  
  // 处理FeatureCollection
  if (converted.type === 'FeatureCollection') {
    converted.features.forEach((feature: any) => {
      if (feature.geometry) processGeometry(feature.geometry)
    })
  } 
  // 处理单个Feature
  else if (converted.type === 'Feature' && converted.geometry) {
    processGeometry(converted.geometry)
  }
  // 处理纯Geometry
  else if (converted.coordinates) {
    processGeometry(converted)
  }
  
  return converted
}