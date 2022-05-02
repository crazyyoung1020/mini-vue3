import { ShapeFlags  } from "../shared/ShapeFlags";

export const Fragment = Symbol('Fragment');
export const Text = Symbol('Text');

export function createVNode(type, props?, children?){
  const vnode = {
    type,
    props,
    children,
    shapeFlag: getShapeFlag(type),
    el: null
  };

  // 如果是children，则给它加上TEXT_CHILDREN类型
  if(typeof children === 'string'){
    // 这里给它的shapeFlag 通过位运算，或("|")一个TEXT_CHILDREN即可
    vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.TEXT_CHILDREN;
  }else if(Array.isArray(children)){
    vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.ARRAY_CHILDREN;
  }

  // 组件 + children是object
  if(vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT){
    if(typeof children === 'object'){
      vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.SLOT_CHILDREN;
    }
  }
  return vnode;
}

export function createTextVNode(text){
  return createVNode(Text, {}, text);
}

function getShapeFlag(type){
  return typeof type === 'string'
    ? ShapeFlags.ELEMENT
    : ShapeFlags.STATEFUL_COMPONENT
}