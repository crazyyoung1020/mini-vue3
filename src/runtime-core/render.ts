import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container){
  // patch

  patch(vnode, container);
}

function patch(vnode, container){
  // 去处理组件

  processComponent(vnode, container);
}

function processComponent(vnode, container){
  mountComponent(vnode, container);
}

function mountComponent(vnode, container){
  const instance = createComponentInstance(vnode);

  setupComponent(instance);
  setupRenderEffects(instance, container);
}

function setupRenderEffects(instance, container){
  const subTree = instance.render();

  // 到这里位置，就通过调用用户传入的render函数，拿到了虚拟节点了
  // 接着就可以 vnode -> patch
  // 而vnode如果是element的话，就需要去mountElement了

  patch(subTree, container)
}