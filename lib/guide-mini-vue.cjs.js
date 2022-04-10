'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const isObject = (val) => {
    return val !== null && typeof val === 'object';
};

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type
    };
    return component;
}
function setupComponent(instance) {
    // TODO
    // initProps()
    // initSlots()
    // 执行组件实例的setup方法，将得到的对象挂载到组件实例上
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    // 这里实例上的type是我们在前面处理了以下，挂载到实例上来的
    const Component = instance.type;
    // 从component这个options配置中解析出用户的setup方法
    const { setup } = Component;
    // setup方法，用户可能会不传，所以需要做判断
    if (setup) {
        // Function or Object，而且setup执行结果可能是函数也可能是对象
        const setupResult = setup();
        // 处理得到的结果，因为有可能是对象或者函数
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // TODO setup执行结果是function的逻辑处理也加上
    if (typeof setupResult === 'object') {
        // 如果setup执行结果是对象，那么把该对象挂载到vue实例上
        instance.setupState = setupResult;
    }
    // setup结束，要将用户传入的render函数挂载到实例上
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    // 假设用户一定会传render函数进来，不传那就报错
    instance.render = Component.render;
}

function render(vnode, container) {
    // patch
    // 调用patch去虚拟dom比对，做更新或者创建操作
    patch(vnode, container);
}
function patch(vnode, container) {
    // 判断vnode是不是一个element，如果是element那么就要去处理element
    // 如何去区分element类型和component类型？
    // 如果是element类型，type会是string，因为h()传入的第一个参数是标签名，这个就是vnode的type
    if (typeof vnode.type === 'string') {
        processElement(vnode, container);
    }
    else if (isObject(vnode.type)) {
        // TODO 这里是有疑问的，如果是自定义组件，那vnode.type应该也是string才对呀，就比如我render里面手写一个h渲染一个自定义组件，那这个判断是不是不太对？
        // 去处理组件
        processComponent(vnode, container);
    }
}
function processElement(vnode, container) {
    // 初始化元素类型
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    const el = document.createElement(vnode.type);
    const { children, props } = vnode;
    // 这里children有可能是string，也有可能是array
    if (typeof children === 'string') {
        el.textContent = children;
    }
    else if (Array.isArray(children)) {
        // children如果是数组，那数据里面的元素就都是vnode
        mountChildren(vnode, el);
    }
    // 从props里面解析出属性并设置到元素里
    for (const key in props) {
        const val = props[key];
        el.setAttribute(key, val);
    }
    container.append(el);
}
function mountChildren(vnode, container) {
    vnode.children.forEach(v => {
        // 那这里需要去遍历一下，用patch去看一下这个vnode是组件还是元素节点，再做初始化处理
        patch(v, container);
    });
}
function processComponent(vnode, container) {
    // 初始化组件
    mountComponent(vnode, container);
}
function mountComponent(vnode, container) {
    // 通过vnode创建组件实例
    const instance = createComponentInstance(vnode);
    // 去处理组件实例，执行setup方法，并挂载相应的state到实例上
    setupComponent(instance);
    // 上一步setup结束后，实例上就会挂载render函数，执行render函数得到虚拟dom
    setupRenderEffects(instance, container);
}
function setupRenderEffects(instance, container) {
    // 执行render函数得到虚拟dom
    const subTree = instance.render();
    // 到这里位置，就通过调用用户传入的render函数，拿到了虚拟节点了
    // 接着就可以 vnode -> patch
    // 而vnode如果是element的话，就需要去mountElement了
    // TODO 这里其实有点不理解了，怎么就递归起来了，patch不是要去比对新旧vnode么？
    // 这里subTree就是我们用户写的render函数，执行之后得到的虚拟dom
    // 那么这个虚拟dom我们仍然需要对他去做初始化或者更新处理，所以需要递归的调用一下
    // 如果subTree里面没有组件了，就不会往下再递归了，如果还有组件，那么还会往下去递归创建并挂载
    patch(subTree, container);
}

function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children
    };
    return vnode;
}

// 创建实例
function createApp(rootComponent) {
    return {
        // 挂载
        mount(rootContainer) {
            // 先把所有的东西转成vnode
            // 后序所有的逻辑操作，都会基于vnode做处理
            // component -> vnode
            const vnode = createVNode(rootComponent);
            debugger;
            // 把虚拟dom往容器上渲染并挂载
            render(vnode, rootContainer);
        }
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

exports.createApp = createApp;
exports.h = h;
