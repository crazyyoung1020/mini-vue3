import { h } from '../../lib/guide-mini-vue.esm.js';// TODO 但实际上h不是这么来的呀，是render里面往回调里传的
export const App = {
  // 如果是.vue单文件组件，我们会直接写template，它最终其实也是编译成了render，我们这里就用render先实现
  // <template></template>
  render(){
    // ui逻辑
    return h('div', 'hi,' + this.msg);
  },
  setup(){
    // composition api
    return {
      msg: 'mini-vue3'
    }
  }
}