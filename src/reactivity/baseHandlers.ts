import { track, trigger } from './effect'
import { ReactiveFlags } from './reactive';
import { isObject } from '../shared';
import { reactive, readonly } from './reactive';
// 这里创建一遍get之后，后序就都用这个get了，不需要每次都创建，所以抽离出来
const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);

// 把get方法抽离出来
function createGetter(isReadonly = false){
  return function get(target, key){
    // 如果来读取这个字段，那么就直接返回它是否reactive就行了
    if( key === ReactiveFlags.IS_REACTIVE){
      return !isReadonly;
    } else if( key === ReactiveFlags.IS_READONLY){
      return isReadonly;
    }
    // 获取对象的对应key值
    const res = Reflect.get(target, key);

    // 看看res是不是object
    if(isObject(res)){
      // 这里等于是递归了一波
      return isReadonly ? readonly(res) : reactive(res);
    }
    if(!isReadonly){
      // 不是readonly，我们采取收集依赖
      track(target,key);
    }
    return res;
  }
}
// 把set方法抽离出来
function createSetter(){
  return function set(target, key, value){
    const res = Reflect.set(target, key, value);
    // 触发依赖
    trigger(target, key);
    return res;
  }
}

export const mutableHandlers = {
  get,
  set
};

export const readonlyHandlers = {
  get:readonlyGet,
  set(target, key, value){
    console.warn(`key:${key} set 失败 因为 target 是 readonly`, target)
    return true;
  }
}