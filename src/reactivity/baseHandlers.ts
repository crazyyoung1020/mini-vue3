import { track, trigger } from './effect'

// 这里创建一遍get之后，后序就都用这个get了，不需要每次都创建，所以抽离出来
const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);

// 把get方法抽离出来
function createGetter(isReadonly = false){
  return function get(target, key){
    // 获取对象的对应key值
    const res = Reflect.get(target, key);
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