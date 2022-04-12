import { hasOwn } from "../shared/index";

const publicPropertiesMap = {
  // 这个el我们在renderer里面mountElement时候创建标签的时候保存过一份在vnode上
  $el: (i)=>i.vnode.el,
  $slots: (i)=>i.slots
}
export const PublicInstanceProxyHandlers = {
  // 这个写法等于从target中解构出_,起名字为instance，可以理解为const instance = target._
  get({_:instance}, key){
    // 获取setupState里面的属性
    const { setupState, props } = instance;
    // if(key in setupState){
    //   return setupState[key];
    // }
    
    if(hasOwn(setupState, key)){
      return setupState[key];
    }else if(hasOwn(props, key)){
      return props[key];
    }
    // 获取$el、$data、$prop等
    const publicGetter = publicPropertiesMap[key];
    if(publicGetter){
      return publicGetter(instance)
    }
 }
}