<template>
  <div class="agent-container">
    <!-- 左侧聊天区域 -->
    <div class="chat-container">
      <div class="chat-header">
        <h2>旅行规划助手</h2>
        <div class="header-actions">
          <a-button type="text" @click="handleNewChat">
            <template #icon><plus-outlined /></template>
            新建聊天
          </a-button>
          <a-button type="text" @click="showHistory = true">
            <template #icon><history-outlined /></template>
            历史记录
          </a-button>
        </div>
      </div>
      
      <Chat
        ref="chatRef"
        :chat-id="currentChatId"
        :reset="resetChat"
        @new-chat="handleNewChat"
        @ready-generate="handleReadyGenerate"
        @load-plan="handlePlanLoad"
      />
    </div>

    <!-- 右侧区域 -->
    <div class="right-section">
      <Recommend 
        ref="recommendRef"
        v-if="!showTripPlan || !currentPlanId" 
      />
      <TripPlan 
        v-else-if="currentPlanId" 
        :plan-id="currentPlanId"
        ref="tripPlanRef"
      />
    </div>

    <!-- 聊天历史抽屉 -->
    <ChatHistory
      v-model:visible="showHistory"
      @select="handleHistorySelect"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Recommend from '@/components/Recommend.vue';
import Chat from '@/components/Chat.vue';
import TripPlan from '@/components/TripPlan.vue';
import ChatHistory from '@/components/ChatHistory.vue';
import { HistoryOutlined, PlusOutlined } from '@ant-design/icons-vue';
import { getByTwo } from '@/api/plan.js';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

// 状态管理
const showHistory = ref(false);
const resetChat = ref(false);
const showTripPlan = ref(false);
const currentPlanId = ref(null);
const currentChatId = computed(() => route.params.id);
const chatRef = ref(null);
const recommendRef = ref(null);
const tripPlanRef = ref(null);

// 监听路由参数变化，自动加载计划
watch(currentChatId, async (newChatId) => {
  if (newChatId && userStore.userInfo?.id) {
    try {
      const response = await getByTwo(userStore.userInfo.id, newChatId);
      if (response.data?.id) {
        handlePlanLoad(response.data.id);
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('获取计划失败:', error);
      }
      showTripPlan.value = false;
    }
  }
}, { immediate: true });

// 处理新建聊天
const handleNewChat = async (event) => {
  try {
    showTripPlan.value = false;
    currentPlanId.value = null;
    
    // 检查参数类型，确保正确处理chatId
    const chatId = typeof event === 'string' ? event : null;
    
    if (chatId) {
      await router.push(`/agent/chat/${chatId}`);
    } else {
      resetChat.value = true;
      await router.push('/agent');
      resetChat.value = false;
    }
  } catch (error) {
    console.error('创建新聊天失败:', error);
  }
};

// 处理历史记录选择
const handleHistorySelect = async ({ chat, planId }) => {
  try {
    if (chat && chat.id) {
      await router.push(`/agent/chat/${chat.id}`);
      if (planId) {
        handlePlanLoad(planId);
      }
      showHistory.value = false;
    }
  } catch (error) {
    console.error('选择历史记录失败:', error);
  }
};

// 处理计划加载
const handlePlanLoad = (planId) => {
  if (planId) {
    currentPlanId.value = planId;
    showTripPlan.value = true;
    // 使用 nextTick 确保组件已经挂载
    nextTick(() => {
      if (tripPlanRef.value) {
        tripPlanRef.value.refresh();
      }
    });
  } else {
    currentPlanId.value = null;
    showTripPlan.value = false;
  }
};

// 处理准备生成行程
const handleReadyGenerate = (planId) => {
  currentPlanId.value = planId;
  showTripPlan.value = true;
};

// 添加生命周期钩子
onMounted(() => {
  // 确保Recommend组件在挂载时重新加载数据
  if (recommendRef.value) {
    recommendRef.value.$forceUpdate();
  }
});
</script>

<style scoped>
.agent-container {
  display: flex;
  height: 100vh;
  width: 100%;
}

.chat-container {
  flex: 0 0 35%;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e0e0e0;
}

.chat-header {
  padding: 16px 24px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chat-header h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.right-section {
  flex: 0 0 65%;
  background: #f9f9f9;
  overflow: hidden;
}

.map-container {
  height: 100%;
  width: 100%;
}

.map-placeholder {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
}

.info-window {
  padding: 8px;
}

.info-window h3 {
  margin: 0 0 5px 0;
  color: #333;
}

.info-window p {
  margin: 0;
  color: #666;
}
</style>
