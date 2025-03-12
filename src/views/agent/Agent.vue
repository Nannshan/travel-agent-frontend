<template>
  <div class="left-section">
    <!-- 左侧聊天区域 -->
    <div class="chat-container">
      <div class="chat-header">
        <h2>旅行规划助手</h2>
        <a-button type="text" @click="showHistory = true">
          <template #icon>
            <history-outlined />
          </template>
          历史记录
        </a-button>
      </div>
      <Chat />
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
import { HistoryOutlined } from '@ant-design/icons-vue';
import { ref } from 'vue';

const showHistory = ref(false);

const handleHistorySelect = (chat) => {
  console.log('选择的聊天记录：', chat);
  // TODO: 加载选中的聊天记录
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
