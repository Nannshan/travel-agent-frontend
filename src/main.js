import { createApp } from "vue";
import { createPinia } from 'pinia';
import Antd from "ant-design-vue";
import App from "./App.vue";
import "ant-design-vue/dist/reset.css";
import router from "./router/index.js";
import { useUserStore } from './stores/user';

const pinia = createPinia();
const app = createApp(App);

app.use(Antd).use(router).use(pinia);

// 初始化用户状态
const userStore = useUserStore();
await userStore.initializeFromStorage();

app.mount("#app");

