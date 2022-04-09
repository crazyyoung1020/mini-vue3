import { reactive } from '../reactive';
import { effect, stop } from '../effect';
describe('effect', () => {
  it('happy path', () => {
    const user = reactive({
      age: 10
    });

    let nextAge;
    effect(() => {
      nextAge = user.age + 1;
    });

    expect(nextAge).toBe(11);

    // update
    user.age++;
    expect(nextAge).toBe(12);
  });
  it('should return runner when call effect',()=>{
    // 1. effect(fn) ->  runner: Function -> fn -> return
    // 就是说，我们期望调用effect，可以拿到一个函数runner
    // 调用这个runner，我们就能执行传入effect的fn，并且可以拿到一个返回值

    let foo = 10;
    const runner = effect(()=>{
      foo++;
      return 'foo';
    })

    expect(foo).toBe(11);
    const r = runner();
    expect(foo).toBe(12);
    expect(r).toBe('foo');
  })
  it('scheduler', ()=>{
    // 1. 通过effect的第二个参数给定一个scheduler的fn
    // 2. effect第一次执行的时候，仍然会执行fn
    // 3. 当响应式对象set时触发update后，不会再执行fn而是执行scheduler
    // 4. 如果说当执行runner的时候，会再次执行fn
    let dummy;
    let run:any;
    // 这里jest.fn应该是用jest包裹一下，后面可以去断言该函数是否有被执行
    const scheduler = jest.fn(()=>{
      run = runner;
    })
    const obj = reactive({foo:1});
    const runner = effect(
      ()=>{
        dummy = obj.foo;
      },
      { scheduler}
    );
    expect(scheduler).not.toHaveBeenCalled();
    expect(dummy).toBe(1);
    // should be called on first trigger;
    obj.foo++;
    expect(scheduler).toHaveBeenCalledTimes(1);
    // should not run yet
    expect(dummy).toBe(1);
    // manually run
    run();
    // should have run
    expect(dummy).toBe(2);
  })
  it('stop', ()=>{
    let dummy;
    const obj = reactive({ prop: 1});
    const runner = effect(()=>{
      dummy = obj.prop;
    });
    obj.prop = 2;
    expect(dummy).toBe(2);
    // 当执行stop后，再去set的时候，就不会触发effect的fn入参了
    // 那么我们其实调用stop的时候，去把对应的dep里面的effect删除即可
    // 后面再手动调用runner的时候，再给这个effect加回去
    stop(runner);
    obj.prop = 3;
    expect(dummy).toBe(2);

    // 当手动调用runner的时候，仍然还是可以触发fn
    runner();
    expect(dummy).toBe(3);
  })
  it('onStop', ()=>{
    const obj = reactive({
      foo: 1
    });
    const onStop = jest.fn();
    let dummy;
    const runner = effect(
      ()=>{
        dummy = obj.foo;
      },
      {
        onStop
      }
    );
    stop(runner);
    // 如果用户在effect第二个参数有传一个函数onStop
    // 那么当调用了stop的时候，需要去同时执行一下这个onStop函数
    // 可以直接去effect的stop函数里面去判断有onStop就执行一下
    expect(onStop).toBeCalledTimes(1);
  })
});
