import {createRouter, createWebHashHistory, createWebHistory} from "vue-router";
import BasicLayout from "@/layouts/BasicLayout.vue";
import { useUserStore } from '@/stores/user';

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
        path: "/user-star",
        name: "SceneStar",
        component: () => import("@/views/user/SceneStar.vue"),
      },
      {
        path: "/user-plan",
        name: "UserPlan",
        component: () => import("@/views/user/UserPlan.vue"),
      },
      {
        path: '/user-profile',
        name: 'UserProfile',
        component: () => import('@/views/user/UserProfile.vue'),
        meta: {
          requiresAuth: true
        }
      },
      {
        path: '/user-statistics',
        name: 'UserStatistics',
        component: () => import('@/views/user/UserStatistics.vue'),
        meta: {
          requiresAuth: true
        }
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
        props: true,
      },
      {
        path: "/agent/chat/:id",
        name: "AgentChat",
        component: () => import("@/views/agent/Agent.vue"),
        props: true,
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

// 添加全局前置守卫
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();
  const publicPages = ['/login', '/home', '/'];
  const authRequired = !publicPages.includes(to.path);

  if (authRequired && !userStore.isLoggedIn) {
    console.log(userStore.isLoggedIn);
    // 如果需要登录但用户未登录，重定向到登录页
    next('/login');
  } else {
    next();
  }
});

export default router;
