import mitt from 'mitt';
// 定义事件类型映射
type Events = {
  //更新命名空间
  'update-namespace': string;
};

const emitter = mitt<Events>();

export default emitter;