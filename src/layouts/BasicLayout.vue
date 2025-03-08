<template>
  <div id="BasicLayout">
    <a-layout class="basic-layout-container">
      <a-layout-sider
        v-model:collapsed="collapsed"
        collapsible
        theme="light"
        width="160"
      >
        <div class="logo-container">
          <img src="../assets/漫城方略.svg" alt="logo" class="logo-image" />
          <span v-if="!collapsed" class="logo-text">漫程方略</span>
        </div>
        <a-menu
          v-model:selectedKeys="selectedKeys"
          mode="inline"
          @select="handleMenuSelect"
        >
          <a-menu-item key="/plan">
            <comment-outlined style="font-size: 20px" />
            <span>plan</span>
          </a-menu-item>
          <a-menu-item key="/attractions">
            <search-outlined style="font-size: 20px" />
            <span>景点广场</span>
          </a-menu-item>
          <a-menu-item key="/star">
            <star-outlined style="font-size: 20px" />
            <span>我的景点</span>
          </a-menu-item>
          <a-menu-item key="/history">
            <container-outlined style="font-size: 20px" />
            <span>我的计划</span>
          </a-menu-item>
          <a-menu-item key="/chat">
            <history-outlined style="font-size: 20px" />
            <span>聊天历史</span>
          </a-menu-item>
        </a-menu>
      </a-layout-sider>
      <a-layout>
        <a-layout-content>
          <router-view />
        </a-layout-content>
        <a-layout-footer class="layout-footer">
          © 2025 TravelPlanner. All rights reserved.
        </a-layout-footer>
      </a-layout>
    </a-layout>
  </div>
</template>

<script lang="ts" setup>
import {
  SearchOutlined,
  UserOutlined,
  CommentOutlined,
  StarOutlined,
  HistoryOutlined,
  ContainerOutlined,
} from "@ant-design/icons-vue";
import { ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";

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
</script>

<style scoped>
.basic-layout-container {
  min-height: 100vh;
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

.layout-footer {
  text-align: center;
  background: rgba(239, 239, 239, 0.42);
  padding: 10px 0;
}

/* 保留原有作用域样式 */
[data-theme="light"] .site-layout .site-layout-background {
  background: #ffffff;
}
</style>
