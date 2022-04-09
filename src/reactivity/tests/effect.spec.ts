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
});
