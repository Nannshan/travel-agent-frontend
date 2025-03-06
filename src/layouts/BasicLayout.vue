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
          <img src="../../public/assets/漫城方略.svg" alt="logo" class="logo-image" />
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
            <desktop-outlined style="font-size: 20px" />
            <span>景点广场</span>
          </a-menu-item>
          <a-sub-menu key="sub1">
            <template #title>
              <span>
                <user-outlined style="font-size: 20px" />
                <span>User</span>
              </span>
            </template>
            <a-menu-item key="/user/tom">Tom</a-menu-item>
            <a-menu-item key="/user/bill">Bill</a-menu-item>
            <a-menu-item key="/user/alex">Alex</a-menu-item>
          </a-sub-menu>
          <a-menu-item key="/history">
            <file-outlined style="font-size: 20px" />
            <span>历史计划</span>
          </a-menu-item>
          <a-menu-item key="/chat">
            <file-outlined style="font-size: 20px" />
            <span>聊天历史</span>
          </a-menu-item>
        </a-menu>
      </a-layout-sider>
      <a-layout>
        <a-layout-content>
          <router-view />
        </a-layout-content>
        <a-layout-footer class="layout-footer">
          Travel Agent ©2025 Created by mkl
        </a-layout-footer>
      </a-layout>
    </a-layout>
  </div>
</template>

<script lang="ts" setup>
import {
  DesktopOutlined,
  UserOutlined,
  FileOutlined,
  CommentOutlined,
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

<style scoped src="./BasicLayout.css"></style>
