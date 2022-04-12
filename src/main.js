import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router';
import { Button } from 'vant';

const app = createApp(App);

// 路由、状态等相关
app.use(router);

// vant 相关
app.use(Button);


// 挂载
app.mount('#app');
