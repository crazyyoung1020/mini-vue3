import { h, renderSlots } from '../../lib/guide-mini-vue.esm.js';

export const Foo = {
  setup() {
    return {};
  },
  render() {
    const foo = h('p', {}, 'foo');
    // 这里去获取到父组件的插槽内容
    // 这里this.$slots可能是个数组，所以需要去做一层处理
    // 具名插槽
    // 1. 获取到要渲染的元素
    // 2. 要获取到渲染的位置
    // 作用域插槽
    let age = 10;
    return h(
      'div',
      {},
      [
        renderSlots(this.$slots, 'header', {
          age
        }),
        foo,
        renderSlots(this.$slots, 'footer', {
          age
        })
      ]
    );
  }
};
