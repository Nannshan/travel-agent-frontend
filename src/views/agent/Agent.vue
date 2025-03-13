<template>
  <div class="left-section">
    <!-- 左侧聊天区域 -->
    <div class="chat-container">
      <div class="chat-header">
        <h2>旅行规划助手</h2>
        <div class="header-right">
          <a-button type="text" @click="() => handleNewChat()">
            <template #icon>
              <plus-outlined />
            </template>
            新建聊天
          </a-button>
          <a-button type="text" @click="showHistory = true">
            <template #icon>
              <history-outlined />
            </template>
            历史记录
          </a-button>
        </div>
      </div>
      <Chat
        :reset="resetChat"
        :chat-id="$route.params.id"
        @new-chat="handleNewChat" 
      />
    </div>

    <!-- 右侧地图区域 -->
    <div class="right-section">
      <Map />
    </div>

    <!-- 聊天历史抽屉 -->
    <chat-history
      v-model:visible="showHistory"
      @select="handleHistorySelect"
    />
  </div>
</template>

<script setup>
import Map from '@/components/Map.vue';
import Chat from '@/components/Chat.vue';
import ChatHistory from '@/components/ChatHistory.vue';
import { HistoryOutlined, PlusOutlined } from '@ant-design/icons-vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const showHistory = ref(false);
const resetChat = ref(false);

// 处理新建聊天按钮点击
const handleNewChat = async (chatId) => {
  try {
    if (chatId) {
      // 当Chat组件创建了新聊天时，更新路由到新聊天
      await router.push(`/agent/chat/${chatId}`);
    } else {
      // 当点击新建聊天按钮时，重置到基础路由
      resetChat.value = true;
      await router.push('/agent');
      resetChat.value = false;
    }
  } catch (error) {
    console.error('创建新聊天失败:', error);
  }
};

// 处理选择历史记录
const handleHistorySelect = async (chat) => {
  if (chat && chat.id) {
    await router.push(`/agent/chat/${chat.id}`);
    showHistory.value = false;
  }
};

</script>

<style scoped>
.left-section {
  display: flex;
  height: 100vh;
  width: 100%;
}

.chat-container {
  flex: 1;
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
}

.header-right {
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
  flex: 1;
  background: #f9f9f9;
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
