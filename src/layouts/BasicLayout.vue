<template>
  <div id="BasicLayout">
    <a-layout class="basic-layout-container">
      <a-layout-sider
        v-model:collapsed="collapsed"
        collapsible
        theme="light"
        width="160"
        :style="{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }"
      >
        <div class="logo-container">
          <img src="../assets/logo.svg" alt="logo" class="logo-image" />
          <span v-if="!collapsed" class="logo-text">漫程方略</span>
        </div>
        <a-menu
          v-model:selectedKeys="selectedKeys"
          mode="inline"
          @select="handleMenuSelect"
          class="main-menu"
        >
          <a-menu-item key="/agent">
            <comment-outlined style="font-size: 20px" />
            <span>旅行规划</span>
          </a-menu-item>
          <a-menu-item key="/scene-home">
            <search-outlined style="font-size: 20px" />
            <span>景点广场</span>
          </a-menu-item>
          <a-menu-item key="/user-star">
            <star-outlined style="font-size: 20px" />
            <span>我的景点</span>
          </a-menu-item>
          <a-menu-item key="/user-plan">
            <container-outlined style="font-size: 20px" />
            <span>我的计划</span>
          </a-menu-item>
        </a-menu>

        <!-- 用户头像和下拉菜单 -->
        <user-menu
          :collapsed="collapsed"
          @menu-click="handleUserMenuClick"
        />
      </a-layout-sider>
      <a-layout>
        <a-layout-content :style="{ marginLeft: collapsed ? '80px' : '160px' }">
          <router-view />
        </a-layout-content>
      </a-layout>
    </a-layout>
  </div>
</template>

<script lang="ts" setup>
import {
  SearchOutlined,
  CommentOutlined,
  StarOutlined,
  HistoryOutlined,
  ContainerOutlined,
} from "@ant-design/icons-vue";
import { ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import UserMenu from '@/components/UserMenu.vue';

const router = useRouter();
const route = useRoute();

const collapsed = ref<boolean>(true);
const selectedKeys = ref<string[]>([route.path]);

// 监听路由变化更新选中菜单项
watch(
  () => route.path,
  (newPath) => {
    selectedKeys.value = [newPath];
  },
);

const handleMenuSelect = ({ key }: { key: string }) => {
  router.push(key);
};

const handleUserMenuClick = (key: string) => {
  console.log('User menu clicked:', key);
  // TODO: 处理用户菜单点击事件
  if (key === 'signout') {
    // 处理登出逻辑
  }
};
</script>

<style scoped>
.basic-layout-container {
  min-height: 100vh;
  background: #fff;
}

.logo-container {
  display: flex;
  align-items: flex-end;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  margin: 16px;
}

.logo-image {
  width: 50px;
  height: 50px;
  margin-right: 15px;
}

.logo-text {
  font-weight: bold;
  font-family: Arial, sans-serif;
  font-size: 20px;
  width: 40px;
  height: 40px;
  margin-right: 15px;
}

.main-menu {
  flex: 1;
}

:deep(.ant-layout-footer) {
  padding: 2px 0;
  min-height: unset;
}

:deep(.ant-layout) {
  background: #fff;
}

[data-theme="light"] .site-layout .site-layout-background {
  background: #ffffff;
}
</style>
