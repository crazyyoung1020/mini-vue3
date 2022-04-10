'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // TODO setup执行结果是function的逻辑处理也加上
    if (typeof setupResult === 'object') {
        // 如果setup执行结果是对象，那么把该对象挂载到vue实例上
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    // 假设用户一定会传render函数进来，不传那就报错
    instance.render = Component.render;
}

function render(vnode, container) {
    // patch
    patch(vnode);
}
function patch(vnode, container) {
    // TODO 判断vnode是不是一个element，如果是element那么就要去处理element
    // 如何去区分element类型和component类型？
    // processElement();
    // 去处理组件
    processComponent(vnode);
}
function processComponent(vnode, container) {
    mountComponent(vnode);
}
function mountComponent(vnode, container) {
    const instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffects(instance);
}
function setupRenderEffects(instance, container) {
    const subTree = instance.render();
    // 到这里位置，就通过调用用户传入的render函数，拿到了虚拟节点了
    // 接着就可以 vnode -> patch
    // 而vnode如果是element的话，就需要去mountElement了
    patch(subTree);
}

function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children
    };
    return vnode;
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // 先把所有的东西转成vnode
            // 后序所有的逻辑操作，都会基于vnode做处理
            // component -> vnode
            const vnode = createVNode(rootComponent);
            render(vnode);
        }
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

exports.createApp = createApp;
exports.h = h;
