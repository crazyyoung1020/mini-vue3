import { ReactiveEffect } from './effect'
class ComputedRefImpl {
  private _getter: any;
  private _dirty: boolean = true;
  private _value: any;
  private _effect: any;
  constructor(getter) {
    this._getter = getter;

    // 这里巧妙的利用了我们effect的scheduler特性，就是当初始化类ReactiveEffect的时候，有传第二个回调函数
    // 或者调用effect(fn, {scheduler})方法，有传第二个参数，并且有scheduler字段的时候
    // 只有初始化effect的时候会调用fn，后面触发set的时候，不会去执行fn，而是执行scheduler
    // 那么用在计算属性这里就刚好，第一次get value计算完之后就把dirty关上
    // 下次set的时候，说明有依赖更新了，我们就把dirty再打开
    // 那么下次再get value的时候就需要重新计算。
    this._effect = new ReactiveEffect(getter, ()=>{
      if(!this._dirty){
        this._dirty = true;
      }
    })
  }
  get value() {
    // 当初次修改之后，我们就把get给锁上，后序再读，都直接给缓存的值。
    // 当有依赖更新的时候触发我们重新计算即可。
    if(this._dirty){
      this._dirty = false;
      this._value = this._effect.run();
    }
    // 如果不是处理读取，那么我们直接取缓存。
    return this._value; 
  }
}

export function computed(getter) {
  return new ComputedRefImpl(getter);
}
