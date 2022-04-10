// vue3

import { createApp } from '../../lib/guide-mini-vue.esm.js';
import { App } from './App.js';


// 先这么来，直接传入dom，简单一点，后面再去把container的解析封装到mount里面
const rootContainer = document.querySelector('#app');
createApp(App).mount(rootContainer);
// createApp(App).mount('#app');