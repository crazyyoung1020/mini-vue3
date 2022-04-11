import { h } from '../../lib/guide-mini-vue.esm.js'; // TODO 但实际上h不是这么来的呀，是render里面往回调里传的
import { Foo } from './Foo.js'

window.self = null;
export const App = {
  // 如果是.vue单文件组件，我们会直接写template，它最终其实也是编译成了render，我们这里就用render先实现
  // <template></template>
  name: 'App',
  render() {
    // 我们这里强行调试一波this,在控制台看看this绑定对了没，$el挂载上了没
    window.self = this;
    // ui逻辑
    return h(
      'div',
      {
        id: 'root',
        class: ['red', 'hard'],
        onClick:(e)=>{console.log(e)}
      },
      // TODO 我们还没有实现this这个功能，就先注释掉
      // 这个this，我们分析一下，需要将一个对象绑定到我们render的this上就行了，我们在component.ts里创建一个代理对象，然后绑上即可
      // 'hi,' + this.msg
      [
        h('div', {}, 'hi,' + this.msg), 
        // 这里传入组件配置文件，和传入div这种dom节点是不一样的，前者都processComponent，后者走processElement
        h(Foo,{ 
          count: 1,
          // 这里就是在Foo里面emit触发了add事件
          onAdd(a, b){
            console.log('onAdd',a,b)
          },
          onAddFoo(a, b){
            console.log('onAddFoo',a, b)
          }
        }),
      ]
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
