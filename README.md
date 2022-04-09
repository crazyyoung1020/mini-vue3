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