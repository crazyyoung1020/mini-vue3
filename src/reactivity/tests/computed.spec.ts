import { computed } from '../computed';
import { reactive } from '../reactive';

describe('computed', () => {
  it('happy path', () => {
    // 计算属性和ref有点类似,也是要通过value访问
    // 但是计算属性有缓存
    const user = reactive({
      age: 1
    });
    const age = computed(() => {
      return user.age;
    });

    expect(age.value).toBe(1);
  });
  it('should compute lazily', () => {
    const value = reactive({
      foo:1
    })
    const getter = jest.fn(()=>{
      return value.foo;
    })
    const cValue = computed(getter);
    // lazy
    expect(getter).not.toHaveBeenCalled();

    expect(cValue.value).toBe(1);
    expect(getter).toHaveBeenCalledTimes(1);

    // should not compute again
    cValue.value;
    expect(getter).toHaveBeenCalledTimes(1);

    // should not compute until needed
    value.foo = 2;
    expect(getter).toHaveBeenCalledTimes(1);

    // now it should compute 
    expect(cValue.value).toBe(2);
    expect(getter).toHaveBeenCalledTimes(2);

    // should not compute again
    cValue.value;
    expect(getter).toHaveBeenCalledTimes(2);
  })
});
