import * as Cesium from "cesium";

/**
 * 雪花类
 */
export default class SnowEffect{
  /**
   * 构造器
   * @param {*} viewer 视图
   * @param {*} options 配置项
   */
  constructor(viewer,options){
    //视图为空，抛出异常
    if(!viewer) throw new Error("new viewer object");
    options = options || {};
    //defaultValue:如果未定义，则返回第一个参数，否则返回第二个参数 ;❄️大小，最好小于0.02
    //雪花大小
    this.snowSize = Cesium.defaultValue(options.snowSize, 0.02); 
    //雪花飘落速度
    this.snowSpeed = Cesium.defaultValue(options.snowSpeed, 60.0);
    this.viewer = viewer;
    this.init();
  };

  /**初始化函数 */
  init(){
    this.snowStage = new Cesium.PostProcessStage({
      name: "zhf_snow",
      //要使用的片段着色器
      fragmentShader:this.snow(),
      //一个对象，其属性将用于设置着色器统一
      uniforms:{
        snowSize:()=>this.snowSize,
        snowSpeed:()=>this.snowSpeed
      }
    });
    this.viewer.scene.postProcessStages.add(this.snowStage);
  };

  /**销毁下雪特效 */
  destroy(){
    if(!this.viewer || !this.snowStage) return;
    this.viewer.scene.postProcessStages.remove(this.snowStage);
    //判断是否被销毁过
    const isDestroyed = this.snowStage.isDestroyed();
    if(!isDestroyed){
      this.snowStage.destroy();
    }
    delete this.snowSize;
    delete this.snowSpeed;
  }

  /**控制展示与隐藏 */
  show(visible){
    this.snowStage.enabled = visible;
  }

  /**
   * 设置雪花着色器
   * @returns 着色器片段
   */
  snow(){
    return "uniform sampler2D colorTexture;\n\
            in vec2 v_textureCoordinates;\n\
            uniform float snowSpeed;\n\
                    uniform float snowSize;\n\
            float snow(vec2 uv,float scale)\n\
            {\n\
                float time=czm_frameNumber/snowSpeed;\n\
                float w=smoothstep(1.,0.,-uv.y*(scale/10.));if(w<.1)return 0.;\n\
                uv+=time/scale;uv.y+=time*2./scale;uv.x+=sin(uv.y+time*.5)/scale;\n\
                uv*=scale;vec2 s=floor(uv),f=fract(uv),p;float k=3.,d;\n\
                p=.5+.35*sin(11.*fract(sin((s+p+scale)*mat2(7,3,6,5))*5.))-f;d=length(p);k=min(d,k);\n\
                k=smoothstep(0.,k,sin(f.x+f.y)*snowSize);\n\
                return k*w;\n\
            }\n\
            out vec4 fragColor;\n\
            void main(void){\n\
                vec2 resolution=czm_viewport.zw;\n\
                vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);\n\
                vec3 finalColor=vec3(0);\n\
                //float c=smoothstep(1.,0.3,clamp(uv.y*.3+.8,0.,.75));\n\
                float c=0.;\n\
                c+=snow(uv,30.)*.0;\n\
                c+=snow(uv,20.)*.0;\n\
                c+=snow(uv,15.)*.0;\n\
                c+=snow(uv,10.);\n\
                c+=snow(uv,8.);\n\
                c+=snow(uv,6.);\n\
                c+=snow(uv,5.);\n\
                finalColor=(vec3(c));\n\
                fragColor=mix(texture(colorTexture,v_textureCoordinates),vec4(finalColor,1),.5);\n\
                }\n\
                ";
  }
}