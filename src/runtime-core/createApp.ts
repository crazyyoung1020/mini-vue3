import { createVNode } from "./vnode";

export function createApp(rootComponent){
  return {
    mount(rootContainer){
      // 先把所有的东西转成vnode
      // 后序所有的逻辑操作，都会基于vnode做处理
      // component -> vnode
      const vnode = createVNode(rootComponent);
    }
  }

}