class ReactiveEffect {
  private _fn: any;
  constructor(fn) {
    this._fn = fn;
  }
  run() {
    activeEffect = this;
    this._fn();
  }
}

// targetMap是总的管家，它的结构跟observe观察的data结构是一样的
// 子项有对象，那以对象为key，仍然是一个map，子项是基本数据类型了，那么对应的就是一个dep，即Set
// 这里也可以这么理解，当读取一个值的时候，是从一个target对象上读取对应的key
// 那么就对target对象建立一个map，对key建立一个set，就这么简单
// 而且所有target对象，不管层次有多深，都被平铺开了，放在一个targetMap里
const targetMap = new Map();
// track 是用来做依赖收集的
export function track(target, key) {
  // target -> key -> dep
  let depsMap = targetMap.get(target);
  // 如果targetMap下没有这个depsMap，那么就创建一个放进去
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }
  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }

  dep.add(activeEffect);

  // const dep = new Set();
}



export function trigger(target, key){
  let depsMap = targetMap.get(target);
  let dep = depsMap.get(key);

  // 这里拿出来的dep里面，存放是多个依赖的对应的那个effect传入的回调函数fn。
  for ( const effect of dep ) {
    effect.run();
  }
}

let activeEffect;
export function effect(fn) {
  // fn是传进来的回调函数，里面会去访问响应式数据，并触发依赖收集

  // 我们把这个effect抽离一个类出来
  const _effect = new ReactiveEffect(fn);

  _effect.run();
}
