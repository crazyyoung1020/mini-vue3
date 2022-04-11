import { camelize, toHandlerKey } from "../shared/index";


export function emit(instance, event, ...args){
  console.log('emit event:' + event)
  const { props } = instance;
  // TPP,(Transformation Priority Premise)
  // 先去开发一个特性的行为，调通后再去重构成一个通用的行为
  // 如先开发add，然后再去转为所有事件都支持
  // 将烤肉串写法的事件名转成驼峰命名，如add-foo -> addFoo


  const handlerName = toHandlerKey(camelize(event));
  const handler = props[handlerName];
  // 这里...args就是将用户传入的参数转发一下
  handler && handler(...args);
}