import { createApp } from "vue";
import { createPinia } from 'pinia';
import Antd from "ant-design-vue";
import App from "./App.vue";
import "ant-design-vue/dist/reset.css";
import router from "./router/index.js";

const pinia = createPinia();
const app = createApp(App);

app.use(Antd).use(router).use(pinia).mount("#app");

