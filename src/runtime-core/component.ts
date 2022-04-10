
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

    handleSetupResult(instance, setupResult);
  }
}

function handleSetupResult(instance, setupResult){
  // TODO setup执行结果是function的逻辑处理也加上

  if(typeof setupResult === 'object') {
    // 如果setup执行结果是对象，那么把该对象挂载到vue实例上
    instance.setupState = setupResult;
  }

  finishComponentSetup(instance);
}

function finishComponentSetup(instance){
  const Component = instance.type;

  // TODO 这句没看懂，用户没传render，那这里赋值的这个Component.render不就是undefined？
  if(!Component.render){
    instance.render =Component.render;
  }
}