import { render } from "./renderer";
import { createVNode } from "./vnode";

// 创建实例
export function createApp(rootComponent){
  return {
    // 挂载
    mount(rootContainer){
      // 先把所有的东西转成vnode
      // 后序所有的逻辑操作，都会基于vnode做处理
      // component -> vnode
      const vnode = createVNode(rootComponent);
      debugger;
      // 把虚拟dom往容器上渲染并挂载
      render(vnode, rootContainer);
    }
  }
}