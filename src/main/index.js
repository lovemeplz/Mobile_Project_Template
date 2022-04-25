// 主程序
import { createApp } from 'vue'
import App from '../App.vue'
const app = createApp(App);

// 其他
import VConsole from 'vconsole';
import * as dd from 'dingtalk-jsapi'; // 此方式为整体加载，也可按需进行加载
import { Form, Field, CellGroup, Button } from 'vant';
import { router } from '../router';
import { createPinia } from 'pinia'


// vant 相关
app.use(Form);
app.use(Field);
app.use(CellGroup);
app.use(Button);



// 挂载
// 路由、状态等相关
app.use(router);
app.use(createPinia());
app.mount('#app');


// 调试
if (process.env.NODE_ENV === 'development') {
  new VConsole();
}
