
export function createComponentInstance(vnode){
  const component = {
    vnode,
    type: vnode.type
  };
  return component;
}

export function setupComponent(instance){
  // TODO
  // initProps()
  // initSlots()

  // 执行组件实例的setup方法，将得到的对象挂载到组件实例上
  setupStatefulComponent(instance);
}

function setupStatefulComponent(instance){
  // 这里实例上的type是我们在前面处理了以下，挂载到实例上来的
  const Component = instance.type;

  // 从component这个options配置中解析出用户的setup方法
  const { setup } = Component;

  // setup方法，用户可能会不传，所以需要做判断
  if(setup){
    // Function or Object，而且setup执行结果可能是函数也可能是对象
    const setupResult = setup();

    // 处理得到的结果，因为有可能是对象或者函数
    handleSetupResult(instance, setupResult);
  }
}

function handleSetupResult(instance, setupResult){
  // TODO setup执行结果是function的逻辑处理也加上

  if(typeof setupResult === 'object') {
    // 如果setup执行结果是对象，那么把该对象挂载到vue实例上
    instance.setupState = setupResult;
  }

  // setup结束，要将用户传入的render函数挂载到实例上
  finishComponentSetup(instance);
}

function finishComponentSetup(instance){
  const Component = instance.type;

  // 假设用户一定会传render函数进来，不传那就报错
  instance.render =Component.render;
}