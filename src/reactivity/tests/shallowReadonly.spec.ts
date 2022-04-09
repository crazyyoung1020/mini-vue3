import { isReadonly, shallowReadonly } from "../reactive";

describe('shallowReadonly', ()=>{
  test('should not make non-reactive properties reactive', ()=>{
    const props = shallowReadonly({n:{foo:1}});
    expect(isReadonly(props)).toBe(true);
    expect(isReadonly(props.n)).toBe(false);
  })
  it('warn then call set', () => {
    // 当调用readonly的set的时候，抛出警告
    // console.warn()
    // mock
    // 这里的jest.fn()比较特殊，用jest创建的函数，上面会有一些钩子，让我们去做断言，比如函数是否有被调用
    // 我们用jest.fn把console.warn重写一下
    console.warn = jest.fn();
    const user = shallowReadonly({
      age: 10
    });
    user.age = 11;
    expect(console.warn).toBeCalled();
  })
})