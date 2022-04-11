import { h } from '../../lib/guide-mini-vue.esm.js';

export const Foo = {
  setup(props){
    // props.count
    // 显然props是只读属性，不能被修改,实际上它是一个shallowReadonly
    console.log(props);
  },
  render(){
    return h('div', {}, 'foo: ' + this.count);
  }
}