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