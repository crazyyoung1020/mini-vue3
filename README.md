# mini-vue3
simplified vue3


### 项目目录结构

1. src
  - reactivity 数据响应式的实现主模块
    - tests
      - index.spec.ts
    - index.ts
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