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