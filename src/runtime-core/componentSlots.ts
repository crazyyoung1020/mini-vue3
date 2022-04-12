import { ShapeFlags } from "../shared/ShapeFlags";

export function initSlots(instance, children){
  // 由于我们使用renderSlots去做了一层数组slots的优化，那么children是单个vnode的时候我们也要优化一下
  // instance.slots = Array.isArray(children) ? children : [children];
  // 判断是不是slots然后再做处理
  const { vnode } = instance;
  if(vnode.shapeFlag & ShapeFlags.SLOT_CHILDREN){
    normalizeObjectSlots(children, instance.slots);
  }
}

function normalizeObjectSlots(children, slots){
  for(const key in children){
    const value = children[key];
    // slot
    slots[key] = (props) => normalizeSlotValue(value(props));
  } 
}

function normalizeSlotValue(value){
    return Array.isArray(value) ? value : [value];
}