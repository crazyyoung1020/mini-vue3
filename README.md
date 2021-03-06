# mini-vue3
simplified vue3


### 项目目录结构

1. src
  - reactivity 数据响应式的实现主模块
    - tests
      - index.spec.ts
    - index.ts
  - shared，放置一些在src模块下，比较通用的函数
### 开发日志

1. 项目初始化，单元测试环境配置

npm init -y 创建空羡慕

tsc --init 初始化tsconfig.json

npm i jest @types/jest -D 引入jest和对应的ts申明文件

修改package.json的script脚本，配置jest测试启动脚本

配置babel，根据jest官方提供的文档来配置即可，npm i babel-jest @babel/core @babel/preset-env -D

新建babel.config.js

安装npm i @babel/preset-typescript -D，让babel可以解析typescript

2. 开发effect和reactive的单测

tsconfig的lib:[],要把DOM和es6加上，否则写new Proxy会报错

测试驱动开发TDD，真的很爽，这边配合vscode的jest插件，在编辑器里直接断点调试

3. 实现effect和reactive的基本功能

4. 实现effect的runner

  就是effect()执行完成之后我们可以拿到一个runner函数，这个runner就是effect传入的回调
  并且执行完runner还能拿到effect.run()的返回值

5. 实现effect的scheduler功能

  就是effect(fn,{scheduler})可以接受第二个参数，里面有一个scheduler函数
  如果我们有传scheduler，那么除了初始化调用effect函数会执行里面的fn，后面就都不执行了
  如果我们手动再执行runner，那么才可以执行fn

6. 实现stop功能以及对应的onStop回调

  我们可以调用stop(runner),去停掉这个runner，后面去修改响应式数据，则不会触发fn
  除非我们手动调用runner，那么仍然可以触发fn

  同时提供一个onStop回调，在effect(fn,{onStop})的第二个入参里面
  当我们执行stop的时候，会去清空掉effect对应的deps里面所有dep收集的当前的effect，清空完成则执行onStop

7. 实现reactive下的readonly功能
  用readonly创建的响应式对象，无法被set，那么也就不需要去track捕获了

8. 实现isReactive和isReadonly方法
  使用isReactive可以判断当前数据是否是响应式的，readonly就不是响应式的
  那么我们可以去proxy的get里面去做判断，如果读取'is_reactive'值的话，我们就把它是否响应式的结果返回出去
  isReadonly方法同理

9. 优化stop功能
  在之前的代码版本，stop之后，如果obj.prop++,又会触发fn执行，导致依赖被触发。

  因为obj.prop++ => obj.prop = obj.prop+1;
  会先执行get，然后触发track，由于我们什么也没做，这里就又把依赖收集了一遍。
  然后obj.prop+1,触发set，触发trigger，然后顺利成章的就更新了。

  那么我们需要做几个改变：
  1. 在track方法里，要做判断，知道显示是否能够去收集依赖。
  2. 是否能够收集依赖的标识需要在effect.run里面设置。因为触发get都是在fn中，外面有一层effect()包裹
    是由于执行了effect.run才去执行fn的，所以我们要再run里面去给出shouldTrack标识。在执行fn前是true，执行完则置为false。另外，需要判断如果isActive为true那么代表是stop过的runner，那么就直接执行fn并返回，这样shouldTrack就为false，一来就不会被收集起来。
  
  其实上面的改变，就是想控制，你初次effect.run或者后序执行runner，我让你收集依赖，而你自己去get，就不让你收集依赖了。
  并且由于set导致的run被触发要去收集依赖这个口子也给收住。

10. reactive和readonly嵌套的逻辑实现
  递归调用一下就好了，在reactive方法里面，我们是抽离了baseHandlers，在里面要判断一下isObject那么要递归调用reactive。

  这里要注意，proxy虽然可以直接代理对象，但只是我们不需要去遍历每一个属性，像defineProperty那样一个一个去劫持，可是如果子属性有对象或数组，我们仍然需要递归去代理。


11. 实现shallowReadonly

  shallow的意思是只对第一层属性做处理，内层的就不做了，那shallowReadOnly就是，只对第一层做readonly处理，内层不处理

12. 实现isProxy
  判断当前对象是否为代理，那么就是判断它是isReactive或者isReadonly即可。

13. 实现ref

  TODO，如下待验证
  TODO，1.正常的reactive数据，我设置一个新的值和原来的值一样的时候，会重新触发effect吗
  TODO, 2. 我们实现的ref，当设置相同的值的时候不会触发effect更新，但是如果设置一个结构和值相同但是引用不同的对象呢？
  TODO， 如，我们原来a.value = {count:1},现在再设置一遍a.value = {count:1},这两个对象值一样，但是引用不同，会触发effect么？

  为什么要有这个ref呢，因为我们proxy是需要传入一个对象，它是来代理对象的。
  而如果我们现在是一个单值如1,'1',true这种，那么用proxy就不好使了。
  所以我们需要推出这么一个ref，然后用一个对象来把这个单值报错一下。
  结构是{value:1},这个1就是传进来的单值，然后访问变量就多了一层value
  所以就有let a = ref(1);a.value = 1; 
  当然我们也要支持能够传对象进来，做到兼容，但如果是对象建议直接使用reactive

14. 实现isRef和unRef
  isRef用来判断对象是否是一个ref。我们可以在ref类里添加一个标识，用这个标识来判断。
  unRef则是用来获取ref对象的value
  TODO 了解一下unRef真正的逻辑，就是要获取value么？还是说将一个ref转换回正常的值？

15. 实现proxyRef

  当一个对象里面有ref子属性的时候，将这个对象转为proxyRef，那么访问ref就可以不用去通过value访问了

  这个使用场景，比如我们setup里面返回一个对象，里面有ref属性，而在template模板里面可以直接使用ref，而不用去.value，就是内部做了这个处理。

16. 实现computed计算属性

  原理其实很简单，
  1. 首先要实现一个类似于ref的功能，computed类需要访问value才能访问到值。
  2. 要有缓存功能，只有当用户第一次读取value或者computed内的依赖有改变的时候，我们才能去重新计算，否则都直接返回缓存值
  3. 我们可以直接使用ReactiveEffects类来实现computed，并且利用scheduler属性去做缓存控制。
  4. 核心思想就一是一个缓存锁，第一次读取值的时候会去计算，然后把锁锁上
  5. 当依赖发生变更的时候会触发set，那么我们这个effect也会收到，而我们配置了scheduler，所以触发set会触发我们scheduler，然后把锁打开。
  6. 下次用户再读取的时候，锁是开的，所以又可以计算了。

17. 实现component初始化流程

  主要逻辑都在runtime-core里
  用户调用createApp(App).mount('#app'),去开始初始化流程，根据传入的配置项生成vnode，然后调用render去patch比对
  我们这里就简化流程，先实现一个component的初始化，先不考虑元素节点的。

18. rollup打包配置
  rollup是天然支持esm的
  npm i rollup -D
  npm i @rollup/plugin-typescript -D,让rollup能够解析typescript
  npm i tslib -D,这个我没装，好像也没啥问题
  rollup -c rollup.config.js,指定配置文件来打包
  修改package.json的main和module，分别指向两个打包产物的路径

19. 实现element主流程

  从render -> patch -> element or component -> processElement -> 如果element中有component则仍需要继续patch

20. 实现render函数里面的this绑定
  在执行setup并挂载setupState的时候，去创建一个proxy组件代理对象一起挂载到组件实例上，方便后序可以直接通过this.$el、$data等直接访问。
  这个proxy要在组件挂载的时候，执行用户render函数得到vnode的时候绑定到render的this指向上即可。

21. shapeFlag优化

  我们之前判断节点类型都是通过type是否string或者isObject这样来判断的。可以通过位运算的方式做优化，性能会由于直接用对象取值比较。

22. 实现注册事件
  在我们处理mountElement的时候，遍历对应vnode属性的时候，将on开头的属性拿出来，截取它的事件名称，用addEventListener去绑定事件

23. 实现props传参
  1. 即setup函数里面能拿到一个props对象，并且是一个只读属性，实际上它是一个shallowReadonly类型
  2. 在render函数里面能通过this访问到props
  3. setup里面要有props，那么在我们执行setup方法的得到state的时候就传入props即可
  4. render里面要通过this访问props，我们直到render里面的this已经绑定给instance了，那我们把props挂载到instance即可。
  5. props可以在最开始就挂载到instance上一直往下带，方便取用

24. 实现emit子传父

  1. setup里需要有emit方法，可以让用户调用，那么在setupComponent里面执行setup的时候就要把emit传进去
  2. 可以将内部的emit函数挂载到Component的实例上一直带下去，方便传入setup
  3. 执行emit的时候需要去instance上找到用户注册的事件，然后触发，那这个instance可以内部通过component.emit.bind(null,component)这样去内部传，就无需用户传instance了。
  4. 解析onEvent这样事件规则，还有onAddFoo这种驼峰规则


25. 实现slot
  详细逻辑看example-componentSlot，实现了普通插槽，具名插槽，作用域插槽

26. 实现fragment和text节点
  在渲染slots的时候，如果不做处理，我们需要在完成去包装一层div来包裹。我们在renderSlots的时候传入Fragment类型的节点，来告诉patch方法，这种类型的节点直接渲染子节点即可。另外text节点我们也需要处理，用document.createTextNode来实现。