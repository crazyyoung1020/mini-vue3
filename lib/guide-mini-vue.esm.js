const extend = Object.assign;
const isObject = (val) => {
    return val !== null && typeof val === 'object';
};
const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);

// targetMap是总的管家，它的结构跟observe观察的data结构是一样的
// 子项有对象，那以对象为key，仍然是一个map，子项是基本数据类型了，那么对应的就是一个dep，即Set
// 这里也可以这么理解，当读取一个值的时候，是从一个target对象上读取对应的key
// 那么就对target对象建立一个map，对key建立一个set，就这么简单
// 而且所有target对象，不管层次有多深，都被平铺开了，放在一个targetMap里
const targetMap = new Map();
function trigger(target, key) {
    let depsMap = targetMap.get(target);
    let dep = depsMap.get(key);
    triggerEffects(dep);
}
function triggerEffects(dep) {
    // 这里拿出来的dep里面，存放是多个依赖的对应的那个effect传入的回调函数fn。
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}

// 这里创建一遍get之后，后序就都用这个get了，不需要每次都创建，所以抽离出来
const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
// 把get方法抽离出来
function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key) {
        // 如果来读取这个字段，那么就直接返回它是否reactive就行了
        if (key === "__v_isReactive" /* IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "__v_isReadonly" /* IS_READONLY */) {
            return isReadonly;
        }
        // 获取对象的对应key值
        const res = Reflect.get(target, key);
        // 判断如果是shallow类型，那么下面的递归就不用做了，而且我们这个其实是shallowReadonly，那么track也不用
        // 那么就直接返回了就可以了
        if (shallow) {
            return res;
        }
        // 看看res是不是object
        if (isObject(res)) {
            // 这里等于是递归了一波
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
// 把set方法抽离出来
function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        // 触发依赖
        trigger(target, key);
        return res;
    };
}
const mutableHandlers = {
    get,
    set
};
const readonlyHandlers = {
    get: readonlyGet,
    set(target, key, value) {
        console.warn(`key:${key} set 失败 因为 target 是 readonly`, target);
        return true;
    }
};
// 因为shallowReadonly的set方法和readonly是重复的，所以直接使用我们之前写好的extend方法扩展一下就好了
const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet
});

function reactive(raw) {
    return createReactiveObject(raw, mutableHandlers);
}
function readonly(raw) {
    return createReactiveObject(raw, readonlyHandlers);
}
function shallowReadonly(raw) {
    return createReactiveObject(raw, shallowReadonlyHandlers);
}
function createReactiveObject(raw, baseHandlers) {
    return new Proxy(raw, baseHandlers);
}

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
    // attrs
}

const publicPropertiesMap = {
    // 这个el我们在renderer里面mountElement时候创建标签的时候保存过一份在vnode上
    $el: (i) => i.vnode.el
};
const PublicInstanceProxyHandlers = {
    // 这个写法等于从target中解构出_,起名字为instance，可以理解为const instance = target._
    get({ _: instance }, key) {
        // 获取setupState里面的属性
        const { setupState, props } = instance;
        // if(key in setupState){
        //   return setupState[key];
        // }
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        // 获取$el、$data、$prop等
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {}
    };
    return component;
}
function setupComponent(instance) {
    // TODO
    initProps(instance, instance.vnode.props);
    // initSlots()
    // 执行组件实例的setup方法，将得到的对象挂载到组件实例上
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    // 这里实例上的type是我们在前面处理了以下，挂载到实例上来的
    const Component = instance.type;
    // 创建一个代理挂载到实例上，方便用户访问setupState
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    // 从component这个options配置中解析出用户的setup方法
    const { setup } = Component;
    // setup方法，用户可能会不传，所以需要做判断
    if (setup) {
        // Function or Object，而且setup执行结果可能是函数也可能是对象
        // 这里要注意props是一个readonly，而其实它是一个shallowReadonly类型
        const setupResult = setup(shallowReadonly(instance.props));
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
    const { shapeFlag } = vnode;
    // 通过位运算的 与("&"),来判断shapeFlag是不是一个element类型
    if (shapeFlag & 1 /* ELEMENT */) {
        processElement(vnode, container);
    }
    else if (shapeFlag & 2 /* STATEFUL_COMPONENT */) {
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
    // 这里将创建的节点保存在vnode一份,便于其他地方要拿出来操作
    // 这里的vnode是element的，比如div
    const el = (vnode.el = document.createElement(vnode.type));
    const { children, props, shapeFlag } = vnode;
    // 这里children有可能是string，也有可能是array
    if (shapeFlag & 4 /* TEXT_CHILDREN */) {
        el.textContent = children;
    }
    else if (shapeFlag & 8 /* ARRAY_CHILDREN */) {
        // children如果是数组，那数据里面的元素就都是vnode
        mountChildren(vnode, el);
    }
    // 从props里面解析出属性并设置到元素里
    for (const key in props) {
        const val = props[key];
        // 这里是实现了一个具体的click事件的处理，可以抽离成一个通用的事件注册
        // 通用规范，on + Event name,如onClick，onMousedown
        // TODO 这里其实还有个问题，如果直接在自定义组件上绑定时间呢，自定义组件的相关逻辑都还没有处理
        const isOn = (key) => /^on[A-Z]/.test(key);
        // 表示属性是on开头并且第三位是大写字母，那么代表这是一个事件绑定属性
        if (isOn(key)) {
            const event = key.slice(2).toLowerCase();
            el.addEventListener(event, val);
        }
        else {
            el.setAttribute(key, val);
        }
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
function mountComponent(initialVNode, container) {
    // 通过vnode创建组件实例
    const instance = createComponentInstance(initialVNode);
    // 去处理组件实例，执行setup方法，并挂载相应的state到实例上
    setupComponent(instance);
    // 上一步setup结束后，实例上就会挂载render函数，执行render函数得到虚拟dom
    setupRenderEffects(instance, initialVNode, container);
}
function setupRenderEffects(instance, initialVNode, container) {
    // 从instance中取出proxy，然后将render的this绑定为这个代理对象
    const { proxy } = instance;
    // 执行render函数得到虚拟dom
    const subTree = instance.render.call(proxy);
    // 到这里位置，就通过调用用户传入的render函数，拿到了虚拟节点了
    // 接着就可以 vnode -> patch
    // 而vnode如果是element的话，就需要去mountElement了
    // TODO 这里其实有点不理解了，怎么就递归起来了，patch不是要去比对新旧vnode么？
    // 这里subTree就是我们用户写的render函数，执行之后得到的虚拟dom
    // 那么这个虚拟dom我们仍然需要对他去做初始化或者更新处理，所以需要递归的调用一下
    // 如果subTree里面没有组件了，就不会往下再递归了，如果还有组件，那么还会往下去递归创建并挂载
    patch(subTree, container);
    // 这里所有的子树都已经创建完了，那么把这个子树的el给挂载到我们组件对应的el属性上
    // 这样在外部其他地方就可以通过this.$el访问到我们的组件根节点了
    initialVNode.el = subTree.el;
}

function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        shapeFlag: getShapeFlag(type),
        el: null
    };
    // 如果是children，则给它加上TEXT_CHILDREN类型
    if (typeof children === 'string') {
        // 这里给它的shapeFlag 通过位运算，或("|")一个TEXT_CHILDREN即可
        vnode.shapeFlag = vnode.shapeFlag | 4 /* TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag = vnode.shapeFlag | 8 /* ARRAY_CHILDREN */;
    }
    return vnode;
}
function getShapeFlag(type) {
    return typeof type === 'string'
        ? 1 /* ELEMENT */
        : 2 /* STATEFUL_COMPONENT */;
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
            // 把虚拟dom往容器上渲染并挂载
            render(vnode, rootContainer);
        }
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

export { createApp, h };
