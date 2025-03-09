import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    redirect: "/plan", // 默认重定向到plan页面
  },
  //   用户相关
  {
    path: "/user/:username",
    name: "UserProfile",
    component: () => import("../views/Plan.vue"),
    props: true,
  },
  {
    path: "/star",
    name: "SceneStar",
    component: () => import("../views/user/SceneStar.vue"),
  },

    //   景点相关
  {
    path: "/scene/:id",
    name: "Scene",
    component: () => import("../views/scene/SceneDetail.vue"),
    props: true,
  },

    //Agent相关
  {
    path: "/plan",
    name: "Plan",
    component: () => import("../views/Plan.vue"),
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
