<template>
  <a-drawer
    :visible="visible"
    title="聊天历史"
    placement="right"
    width="400"
    @close="onClose"
  >
    <div class="chat-history-container">
      <a-empty v-if="!chatHistory.length" description="暂无聊天历史" />
      <div v-else class="history-list">
        <div
          v-for="(chat, index) in chatHistory"
          :key="index"
          class="history-item"
          @click="selectChat(chat)"
        >
          <div class="history-item-header">
            <span class="history-item-title">{{ chat.title || '未命名对话' }}</span>
            <span class="history-item-time">{{ formatTime(chat.createTime) }}</span>
          </div>
          <div class="history-item-preview">{{ chat.lastMessage }}</div>
        </div>
      </div>
    </div>
  </a-drawer>
</template>

<script setup>
import { ref } from 'vue';
import { Empty } from 'ant-design-vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:visible', 'select']);

// 模拟的聊天历史数据
const chatHistory = ref([
  {
    id: 1,
    title: '青岛三日游规划',
    createTime: '2024-03-20 14:30:00',
    lastMessage: '好的，我来帮您规划青岛三日游的行程...'
  },
  {
    id: 2,
    title: '济南一日游',
    createTime: '2024-03-19 10:15:00',
    lastMessage: '济南最著名的景点是趵突泉、大明湖...'
  }
]);

const onClose = () => {
  emit('update:visible', false);
};

const selectChat = (chat) => {
  emit('select', chat);
  onClose();
};

const formatTime = (timeStr) => {
  const date = new Date(timeStr);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
};
</script>

<style scoped>
.chat-history-container {
  height: 100%;
  padding: 0 16px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  padding: 16px;
  border-radius: 8px;
  background: #f5f5f5;
  cursor: pointer;
  transition: all 0.3s;
}

.history-item:hover {
  background: #e6f7ff;
}

.history-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.history-item-title {
  font-weight: 500;
  color: #333;
}

.history-item-time {
  font-size: 12px;
  color: #999;
}

.history-item-preview {
  font-size: 13px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style> 