import { createVNode, Fragment  } from "../vnode";

export function renderSlots(slots, name, props){
  const slot = slots[name];
  // TODO 我们这里做的是简化版，slots只接受传入对象
  // 而实际slots既可以传输单个节点，也可以传入数组，也可以传入对象
  if(slot){
    // function
    if(typeof slot === 'function'){
      return createVNode(Fragment, {}, slot(props));
    }
  }
}