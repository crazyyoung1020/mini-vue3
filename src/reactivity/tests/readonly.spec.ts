import { readonly, isReadonly} from '../reactive';

describe('readonly',()=>{
  it('happy path', ()=>{
    // 无法修改，即无法set
    const original = {foo:1,bar:{baz:2}};
    const wrapped = readonly(original);
    expect(wrapped).not.toBe(original);
    expect(wrapped.foo).toBe(1);
    expect(isReadonly(wrapped)).toBe(true);
    expect(isReadonly('123')).toBe(false);
  })
})

it('warn then call set', () => {
  // 当调用readonly的set的时候，抛出警告
  // console.warn()
  // mock
  // 这里的jest.fn()比较特殊，用jest创建的函数，上面会有一些钩子，让我们去做断言，比如函数是否有被调用
  // 我们用jest.fn把console.warn重写一下
  console.warn = jest.fn();
  const user = readonly({
    age: 10
  });
  user.age = 11;
  expect(console.warn).toBeCalled();
})