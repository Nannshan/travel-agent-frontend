import {createRouter, createWebHashHistory, createWebHistory} from "vue-router";

const routes = [
  {
    path: "/",
    redirect: "/user-star", // 默认重定向到agent页面
  },
  //   用户相关
  {
    path: "/user-profile/:username",
    name: "UserProfile",
    component: () => import("../views/user/UserPlan.vue"),
    props: true,
  },
  {
    path: "/user-star",
    name: "SceneStar",
    component: () => import("../views/user/SceneStar.vue"),
  },
  {
    path: "/user-plan",
    name: "UserPlan",
    component: () => import("../views/user/UserPlan.vue"),
  },

    //   景点相关
  {
    path: "/scene-home",
    name: "SceneHome",
    component: () => import("../views/scene/SceneHome.vue"),
    props: true,
  },
  {
    path: "/scene-detail/:id",
    name: "SceneDetail",
    component: () => import("../views/scene/SceneDetail.vue"),
    props: true,
  },

    //  Agent相关
  {
    path: "/agent",
    name: "Agent",
    component: () => import("../views/agent/Agent.vue"),
  },
  //   404路由
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("../views/NotFound.vue"),
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
