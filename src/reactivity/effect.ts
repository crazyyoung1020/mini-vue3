import {extend} from '../shared/index'

let activeEffect;
let shouldTrack;
export class ReactiveEffect {
  deps = [];
  private _fn: any;
  active = true; // 这个是用来记录当前的stop是否调用过
  onStop?: () => void;
  public scheduler: Function | undefined;
  constructor(fn, scheduler?: Function) {
    this._fn = fn;
    this.scheduler = scheduler;
  }
  run() {
    // 当变量被stop清理过依赖后，this.active就为false了
    // 所以我们可以把这个当做一个条件来去控制shouldTrack
    // 这里要注意，每次effect.run，我们都会去执行一遍fn，执行fn的过程中会触发get，导致把依赖再次收集
    // 这也是为什么，我们需要在这里判断active，因为stop之后，不希望再次被收集
    // 所以加了这个判断，stop之后，再触发set导致run，也不会去执行fn了。
    if(!this.active){
      return this._fn();
    }
    // 可以收集依赖 
    shouldTrack = true;
    activeEffect = this;

    const result = this._fn();
    // 重置，关闭依赖收集
    // 上面执行fn，会去做依赖收集，到这里收集完了，就把开关关掉
    shouldTrack = false;
    return result;
  }
  stop(){
    // 如果目前当前的effect已经清空过了，那么外面再调用runner就不用再执行了
    if(this.active){
      cleanupEffect(this);
      // 如果有onStop，则执行一下
      if(this.onStop){
        this.onStop();
      }
      this.active = false;
    }
  }
}

function cleanupEffect(effect){
  // 这里deps里面存储的是所有收集过effect的dep
  // 可以理解为effect里面有访问多少个reactive对象，那么就会被收集到多少个dep里
  // 那我们stop时候删除的话，就去找到所有收集过我们的dep，从里面把我们自己删除即可
  effect.deps.forEach((dep: any)=>{
    dep.delete(effect);
  })
  // 把effect的deps里面所有的dep包含的自己都删除之后，这个deps也可以清掉了。
  effect.deps.length = 0;
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
  if(!isTracking()) return ;

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
  trackEffects(dep);
}

export function trackEffects(dep){
  if(dep.has(activeEffect)) return ;
  // 这一句是依赖收集，把effect收集到对应的dep里
  dep.add(activeEffect);
  // 这里反向收集一下，把dep放到effect里，effect里面也会记录自己对应的所有dep
  // 这里为了让effect可以去执行stop，把自己从对应的dep中删掉
  // 这里有一点问题，如果外面没有调用effect()，那么_effect就是undefined，这里activeEffect也是undefined，那么这里会报错
  // 我这里为了不报错，先做一个非空断言
  activeEffect.deps.push(dep);
}

export function isTracking(){
  // 上面track中所说的问题已解决，确实就是activeEffect有可能为空，做个非空判断就好了。
  // if(!activeEffect) return;
  // 我们在这个用一个shouldTrack来控制我们到底要不要取收集依赖，以防obj.prop++这样导致被stop的runner仍然会触发effect的fn
  // if(!shouldTrack) return;
  return shouldTrack && activeEffect !== undefined;
}

export function trigger(target, key) {
  let depsMap = targetMap.get(target);
  let dep = depsMap.get(key);
  triggerEffects(dep);
}

export function triggerEffects(dep){
  // 这里拿出来的dep里面，存放是多个依赖的对应的那个effect传入的回调函数fn。
  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run();
    }
  }
}

export function effect(fn, options: any = {}) {
  // fn是传进来的回调函数，里面会去访问响应式数据，并触发依赖收集
  // 接受第二个参数options，然后把scheduler拿下来

  // 我们把这个effect抽离一个类出来
  const _effect = new ReactiveEffect(fn, options.scheduler);

  // 拿取options里面的onStop方法
  // _effect.onStop = options.onStop;
  // 把options选项内容合并到_effect实例上，比如onStop这种
  // Object.assign(_effect, options);
  // 可以更语义化一点
  extend(_effect, options);

  _effect.run();
  // 这里把run方法return出去，外面就能到runner了
  // 然后让run执行结束把结果也return出去
  // 并且这里涉及到this指针的问题，我们把this绑定一下
  const runner:any = _effect.run.bind(_effect);
  // 这里把effect挂载到runner上，便于我们在stop的runner里面可以拿到对应的effect
  runner.effect = _effect;
  return runner;
}

export function stop(runner) {
  // 我们调用stop，实际是调用effect的stop，让它把自己从dep中删除掉
  runner.effect.stop();
}