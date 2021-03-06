import { mutableHandlers, readonlyHandlers, shallowReadonlyHandlers } from './baseHandlers';

// 创建枚举，这里一个可维护性好，二是担心和用户自己的属性冲突了
export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly'
}

export function reactive(raw){
  return createReactiveObject(raw, mutableHandlers);
}

export function readonly(raw){
  return createReactiveObject(raw, readonlyHandlers);
}

export function shallowReadonly(raw){
  return createReactiveObject(raw, shallowReadonlyHandlers);
}

export function isReactive(value){
  // 这里转boolean是因为如果当前值不是一个proxy，那么就不会进get方法，那么读取这个属性就是undefined，所以需要转一下，返回false
  return !!value[ReactiveFlags.IS_REACTIVE];
}

export function isReadonly(value){
  return !!value[ReactiveFlags.IS_READONLY]; 
}

export function isProxy(value){
  return isReactive(value) || isReadonly(value)
}
function createReactiveObject(raw: any, baseHandlers){
  return new Proxy(raw, baseHandlers);
}