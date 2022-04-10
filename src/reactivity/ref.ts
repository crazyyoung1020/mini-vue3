import { trackEffects, triggerEffects, isTracking } from './effect';
import { hasChanged, isObject } from '../shared';
import { reactive } from './reactive';
class RefImpl {
  public dep;
  private _value:any;
  private _rawValue:any;
  public __v_isRef = true;
  constructor(value){
    // 把传进来的没有处理过的value存一份，方便set的时候做数据对比
    // 因为如果是object，我们会把它转成reactive的数据，那就不能直接比较了
    this._rawValue = value;
    // value -> reactive
    // 1. 要看看value是不是对象，做不同的处理
    this._value = convert(value);
    this.dep = new Set();
  }
  get value(){
    trackRefValue(this);
    return this._value;
  }
  set value(newValue){
    // 判断如果要设置的值就是当前的值，那么就返回
    if(hasChanged(this._rawValue, newValue)){
       // 先修改value的值
      this._rawValue = newValue;
      this._value = convert(newValue);
      // 再去发通知
      triggerEffects(this.dep);
    }
  }
}

function convert(value){
  return isObject(value) ? reactive(value) : value;
}

function trackRefValue(ref){
  // 保证是可以收集依赖的情况下，去收集依赖
  if(isTracking()){
    trackEffects(ref.dep);
  }
}

export function ref(value){
  return new RefImpl(value);
}

export function isRef(ref){
  return !!ref.__v_isRef;
}

export function unRef(ref){
  // 判断是否是ref，是的话则返回value，不是则返回本身
  return isRef(ref) ? ref.value : ref;
}

export function proxyRefs(objectWithRefs){
  return new Proxy(objectWithRefs, {
    get(target, key){
      // get的时候，如果是一个ref，那么就直接返回target.key.value
      // 如果不是ref，则直接返回target.key
      // 这不是就是我们之前做的unRef的功能么
      return unRef(Reflect.get(target, key));
    },
    set(target, key, value){
      // 如果目标属性时ref，并且赋值过来的不是ref，那么就用这个值去替换目标ref的value属性
      if(isRef(target[key]) && !isRef(value)){
        return target[key].value = value;
      } else {
      // 否则可能的情况是，目标不是ref，那么直接赋值。如果目标是ref，且value也是ref，那么也是直接赋值替换
        return Reflect.set(target, key, value)
      }
    }
  })
}