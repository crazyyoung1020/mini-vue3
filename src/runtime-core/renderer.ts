import { isObject } from "../shared/index";
import { ShapeFlags } from '../shared/ShapeFlags'
import { createComponentInstance, setupComponent } from "./component";
import { Fragment, Text } from "./vnode";

export function render(vnode, container){
  // patch

  // 调用patch去虚拟dom比对，做更新或者创建操作
  patch(vnode, container);
}

function patch(vnode, container){
  // 判断vnode是不是一个element，如果是element那么就要去处理element
  // 如何去区分element类型和component类型？
  // 如果是element类型，type会是string，因为h()传入的第一个参数是标签名，这个就是vnode的type
  const { type, shapeFlag } = vnode;
  // 通过位运算的 与("&"),来判断shapeFlag是不是一个element类型
  // Fragment -> 只渲染children,不渲染包裹层
  switch(type){
    case Fragment:
      processFragment(vnode, container);
      break;
    case Text:
      processText(vnode, container);
      break;
    default:
      if(shapeFlag & ShapeFlags.ELEMENT){
        processElement(vnode, container);
      }else if(shapeFlag & ShapeFlags.STATEFUL_COMPONENT){
        // TODO 这里是有疑问的，如果是自定义组件，那vnode.type应该也是string才对呀，就比如我render里面手写一个h渲染一个自定义组件，那这个判断是不是不太对？
         // 去处理组件
        processComponent(vnode, container);
      }
  }
}

function processText(vnode, container){
  const { children } = vnode;
  const textNode = ( vnode.el = document.createTextNode(children));
  container.append(textNode);
}

function processFragment(vnode, container){
  // Implement
  mountChildren(vnode, container);
}

function processElement(vnode, container){
  // 初始化元素类型
  mountElement(vnode, container);
}

function mountElement(vnode, container){
  // 这里将创建的节点保存在vnode一份,便于其他地方要拿出来操作
  // 这里的vnode是element的，比如div
  const el =(vnode.el = document.createElement(vnode.type));

  const { children, props, shapeFlag } = vnode;
  // 这里children有可能是string，也有可能是array
  if(shapeFlag & ShapeFlags.TEXT_CHILDREN){
    el.textContent = children;
  }else if(shapeFlag & ShapeFlags.ARRAY_CHILDREN){
    // children如果是数组，那数据里面的元素就都是vnode
    mountChildren(vnode, el);
  }
  // 从props里面解析出属性并设置到元素里
  for(const key in props){
    const val = props[key];

    // 这里是实现了一个具体的click事件的处理，可以抽离成一个通用的事件注册
    // 通用规范，on + Event name,如onClick，onMousedown
    // TODO 这里其实还有个问题，如果直接在自定义组件上绑定时间呢，自定义组件的相关逻辑都还没有处理
    const isOn = (key: string) => /^on[A-Z]/.test(key);
    // 表示属性是on开头并且第三位是大写字母，那么代表这是一个事件绑定属性
    if(isOn(key)){
      const event = key.slice(2).toLowerCase();
      el.addEventListener(event, val);
    } else {
      el.setAttribute(key, val);
    }


    el.setAttribute(key, val);
  }
  container.append(el);
}

function mountChildren(vnode, container){
  vnode.children.forEach(v=>{
    // 那这里需要去遍历一下，用patch去看一下这个vnode是组件还是元素节点，再做初始化处理
    patch(v, container);
  })
}

function processComponent(vnode, container){
  // 初始化组件
  mountComponent(vnode, container);
}

function mountComponent(initialVNode, container){
  // 通过vnode创建组件实例
  const instance = createComponentInstance(initialVNode);


  // 去处理组件实例，执行setup方法，并挂载相应的state到实例上
  setupComponent(instance);
  // 上一步setup结束后，实例上就会挂载render函数，执行render函数得到虚拟dom
  setupRenderEffects(instance, initialVNode, container);
}

function setupRenderEffects(instance, initialVNode, container){
  // 从instance中取出proxy，然后将render的this绑定为这个代理对象
  const { proxy } = instance;
  // 执行render函数得到虚拟dom
  const subTree = instance.render.call(proxy);

  // 到这里位置，就通过调用用户传入的render函数，拿到了虚拟节点了
  // 接着就可以 vnode -> patch
  // 而vnode如果是element的话，就需要去mountElement了

  // TODO 这里其实有点不理解了，怎么就递归起来了，patch不是要去比对新旧vnode么？
  // 这里subTree就是我们用户写的render函数，执行之后得到的虚拟dom
  // 那么这个虚拟dom我们仍然需要对他去做初始化或者更新处理，所以需要递归的调用一下
  // 如果subTree里面没有组件了，就不会往下再递归了，如果还有组件，那么还会往下去递归创建并挂载
  patch(subTree, container)

  // 这里所有的子树都已经创建完了，那么把这个子树的el给挂载到我们组件对应的el属性上
  // 这样在外部其他地方就可以通过this.$el访问到我们的组件根节点了
  initialVNode.el = subTree.el;
}