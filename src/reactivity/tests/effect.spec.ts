import { reactive } from '../reactive';
import { effect } from '../effect';
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
});
