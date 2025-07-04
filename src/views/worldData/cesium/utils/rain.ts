import * as Cesium from 'cesium';
import { Viewer } from 'cesium';

// 下雨特效参数类型
export interface RainOption {
  tiltAngle?: number;
  rainSize?: number;
  rainSpeed?: number;
}

export default class RainEffect {
  tiltAngle?: number;
  //雨点大小
  rainSize?: number;
  //雨点速度
  rainSpeed?: number;
  rainStage: Cesium.PostProcessStage;
  viewer: Cesium.Viewer;

  /**
   * 构造器
   * @param viewer
   * @param options
   */
  constructor(viewer: Viewer, options: RainOption) {
    if (!viewer) throw new Error('no viewer object!');
    options = options || {};
    this.tiltAngle = Cesium.defaultValue(options.tiltAngle, -0.5);
    this.rainSize = Cesium.defaultValue(options.rainSize, 0.3);
    this.rainSpeed = Cesium.defaultValue(options.rainSpeed, 60.0);
    this.viewer = viewer;
    this.init();
  }

  init() {
    this.rainStage = new Cesium.PostProcessStage({
      name: 'zhf_rain',
      //要使用的片段着色器
      fragmentShader: this.rain(),
      //一个对象，其属性将用于设置着色器统一
      uniforms: {
        tiltAngle: () => {
          return this.tiltAngle;
        },
        rainSize: () => {
          return this.rainSize;
        },
        rainSpeed: () => {
          return this.rainSpeed;
        }
      }
    });
    this.viewer.scene.postProcessStages.add(this.rainStage);
  }

  destroy() {
    if (!this.viewer || !this.rainStage) return;
    this.viewer.scene.postProcessStages.remove(this.rainStage);
    const isDestroyed = this.rainStage.isDestroyed();
    // 先检查是否被销毁过，如果已经被销毁过再调用destroy会报错
    if (!isDestroyed) {
      this.rainStage.destroy();
    }
    delete this.tiltAngle;
    delete this.rainSize;
    delete this.rainSpeed;
  }

  show(visible: boolean) {
    this.rainStage.enabled = visible;
  }

  rain() {
    return 'uniform sampler2D colorTexture;\n\
              in vec2 v_textureCoordinates;\n\
              uniform float tiltAngle;\n\
              uniform float rainSize;\n\
              uniform float rainSpeed;\n\
              float hash(float x) {\n\
                  return fract(sin(x * 133.3) * 13.13);\n\
              }\n\
              out vec4 fragColor;\n\
              void main(void) {\n\
                  float time = czm_frameNumber / rainSpeed;\n\
                  vec2 resolution = czm_viewport.zw;\n\
                  vec2 uv = (gl_FragCoord.xy * 2. - resolution.xy) / min(resolution.x, resolution.y);\n\
                  vec3 c = vec3(.6, .7, .8);\n\
                  float a = tiltAngle;\n\
                  float si = sin(a), co = cos(a);\n\
                  uv *= mat2(co, -si, si, co);\n\
                  uv *= length(uv + vec2(0, 4.9)) * rainSize + 1.;\n\
                  float v = 1. - sin(hash(floor(uv.x * 100.)) * 2.);\n\
                  float b = clamp(abs(sin(20. * time * v + uv.y * (5. / (2. + v)))) - .95, 0., 1.) * 20.;\n\
                  c *= v * b;\n\
                  fragColor = mix(texture(colorTexture, v_textureCoordinates), vec4(c, 1), .5);\n\
              }\n\
              ';
  }
}
