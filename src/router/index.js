import {createRouter, createWebHashHistory, createWebHistory} from "vue-router";
import BasicLayout from "@/layouts/BasicLayout.vue";

const routes = [
  {
    path: "/",
    redirect: "/home",
  },
  //   首页（不使用基础布局）
  {
    path: "/home",
    name: "Home",
    component: () => import("@/views/HomePage.vue"),
    props: true,
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/user/Login.vue"),
    props: true,
  },
  //   使用基础布局的路由
  {
    path: "/",
    component: BasicLayout,
    children: [
      //   用户相关
      {
        path: "/user-profile/:username",
        name: "UserProfile",
        component: () => import("@/views/user/UserPlan.vue"),
        props: true,
      },
      {
        path: "/user-star",
        name: "SceneStar",
        component: () => import("@/views/user/SceneStar.vue"),
      },
      {
        path: "/user-plan",
        name: "UserPlan",
        component: () => import("@/views/user/UserPlan.vue"),
      },
      //   景点相关
      {
        path: "/scene-home",
        name: "SceneHome",
        component: () => import("@/views/scene/SceneHome.vue"),
        props: true,
      },
      {
        path: "/scene-detail/:id",
        name: "SceneDetail",
        component: () => import("@/views/scene/SceneDetail.vue"),
        props: true,
      },
      //  Agent相关
      {
        path: "/agent",
        name: "Agent",
        component: () => import("@/views/agent/Agent.vue"),
      },
    ]
  },
  //   404路由
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/NotFound.vue"),
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
