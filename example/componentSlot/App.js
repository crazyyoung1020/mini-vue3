import { createTextVNode, h } from '../../lib/guide-mini-vue.esm.js';
import { Foo } from './Foo.js';

export const App = {
  name: 'App',
  render() {
    const app = h('div', {}, 'App');
    const foo = h(
      Foo,
      {},
      { 
        header:({age})=>[
          h('div',{},'header' + age),
          createTextVNode('你好呀')
        ],
        footer:({age})=>h('div',{},'footer' + age) 
      });
    // const foo = h(Foo,{},h('p',{}, {default:()=>h('p',{},'hello p')}))

    return h('div', {}, [app, foo]);
  },

  setup(){
    return {};
  }
}