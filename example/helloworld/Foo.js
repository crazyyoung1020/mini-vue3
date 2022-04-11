import { h } from '../../lib/guide-mini-vue.esm.js';

export const Foo = {
  setup(props, { emit }){
    // props.count
    // 显然props是只读属性，不能被修改,实际上它是一个shallowReadonly
    // console.log(props);
    const emitAdd = () => {
      console.log('emit add')
      emit('add',1,2)
      emit('add-foo',3,4)
    }
    return {
      emitAdd
    }
  },
  render(){
    const btn = h(
      'button',
      {
        onClick: this.emitAdd
      },
      'emitAdd'
    )
    const foo = h('p', {}, 'foo');
    return h('div', {}, [Foo, btn]);
  }
}