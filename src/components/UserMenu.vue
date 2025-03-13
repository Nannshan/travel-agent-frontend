<template>
  <div class="user-profile">
    <a-dropdown placement="topRight" :trigger="['click']">
      <div class="avatar-wrapper">
        <a-avatar :size="40">{{ userInitial }}</a-avatar>
      </div>
      <template #overlay>
        <a-menu @click="handleMenuClick">
          <div class="dropdown-header">
            <a-avatar :size="48">{{ userInitial }}</a-avatar>
            <span class="dropdown-username">{{ username }}</span>
          </div>
          <a-menu-divider />
          <a-menu-item key="settings">
            <template #icon><setting-outlined /></template>
            <span>账户设置</span>
          </a-menu-item>
          <a-menu-item key="statistics">
            <template #icon><bar-chart-outlined /></template>
            <span>使用统计</span>
          </a-menu-item>
          <a-menu-divider />
          <a-menu-item key="signout">
            <template #icon><logout-outlined /></template>
            <span>退出登录</span>
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
  </div>
</template>

<script setup>
import { SettingOutlined, BarChartOutlined, LogoutOutlined } from '@ant-design/icons-vue';
import { useUserStore } from '@/stores/user.js';
import { computed } from 'vue';

const userStore = useUserStore();

const username = computed(() => userStore.name || 'momo');
const userInitial = computed(() => username.value.charAt(0).toUpperCase());


const emit = defineEmits(['menuClick']);

const handleMenuClick = ({ key }) => {
  if (key === 'signout') {
    userStore.userlogout();
  }
  emit('menuClick', key);
};
</script>

<style scoped>
.user-profile {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 14px;
  border-top: 1px solid #f0f0f0;
  background: white;
}

.avatar-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.3s;
  margin: 50px 0;
}

.avatar-wrapper:hover {
  background: #f5f5f5;
}

.dropdown-header {
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
}

.dropdown-username {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-top: 4px;
}

:deep(.ant-dropdown-menu) {
  min-width: 280px;
  padding: 12px 0;
}

:deep(.ant-dropdown-menu-item) {
  padding: 12px 32px;
  font-size: 14px;
  height: 48px;
  line-height: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}

:deep(.ant-menu-item:hover) {
  background-color: #f5f5f5;
}

:deep(.ant-menu-divider) {
  margin: 8px 0;
}

:deep(.anticon) {
  font-size: 18px;
  color: #666;
}
</style> 