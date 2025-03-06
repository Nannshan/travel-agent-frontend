import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    redirect: "/plan", // 默认重定向到plan页面
  },
  {
    path: "/plan",
    name: "Plan",
    component: () => import("../views/Plan.vue"),
  },
  {
    path: "/attractions",
    name: "Attractions",
    component: () => import("../views/Plan.vue"),
  },
  {
    path: "/user/:username",
    name: "UserProfile",
    component: () => import("../views/Plan.vue"),
    props: true,
  },
  {
    path: "/history",
    name: "History",
    component: () => import("../views/Plan.vue"),
  },
  {
    path: "/agent",
    name: "ChatHistory",
    component: () => import("../views/Plan.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
