import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container){
  // patch

  // 调用patch去虚拟dom比对，做更新或者创建操作
  patch(vnode, container);
}

function patch(vnode, container){
  // TODO 判断vnode是不是一个element，如果是element那么就要去处理element
  // 如何去区分element类型和component类型？
  // processElement();
  // 去处理组件
  processComponent(vnode, container);
}

function processComponent(vnode, container){
  // 挂载组件
  mountComponent(vnode, container);
}

function mountComponent(vnode, container){
  // 通过vnode创建组件实例
  const instance = createComponentInstance(vnode);


  // 去处理组件实例，执行setup方法，并挂载相应的state到实例上
  setupComponent(instance);
  // 上一步setup结束后，实例上就会挂载render函数，执行render函数得到虚拟dom
  setupRenderEffects(instance, container);
}

function setupRenderEffects(instance, container){
  // 执行render函数得到虚拟dom
  const subTree = instance.render();

  // 到这里位置，就通过调用用户传入的render函数，拿到了虚拟节点了
  // 接着就可以 vnode -> patch
  // 而vnode如果是element的话，就需要去mountElement了

  // TODO 这里其实有点不理解了，怎么就递归起来了，patch不是要去比对新旧vnode么？
  patch(subTree, container)
}