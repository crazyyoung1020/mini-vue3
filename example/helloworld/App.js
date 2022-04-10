import { h } from '../../lib/guide-mini-vue.esm.js'; // TODO 但实际上h不是这么来的呀，是render里面往回调里传的
export const App = {
  // 如果是.vue单文件组件，我们会直接写template，它最终其实也是编译成了render，我们这里就用render先实现
  // <template></template>
  render() {
    // ui逻辑
    return h(
      'div',
      {
        id: 'root',
        class: ['red', 'hard']
      },
      // TODO 我们还没有实现this这个功能，就先注释掉
      // 这个this，我们分析一下，需要将一个对象绑定到我们render的this上就行了，我们在component.ts里创建一个代理对象，然后绑上即可
      'hi,' + this.msg
      // string类型
      // 'hi, mini-vue',
      // [
      //   // array类型
      //   h('p', { class: 'red' }, 'hi'),
      //   h('p', { class: 'blue' }, 'mini-vue')
      // ]
    );
  },
  setup() {
    // composition api
    return {
      msg: 'mini-vue3'
    };
  }
};
