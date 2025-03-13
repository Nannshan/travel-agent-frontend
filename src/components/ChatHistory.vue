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
        >
          <div class="history-item-content" @click="selectChat(chat)">
            <div class="history-item-header">
              <div class="history-item-info">
                <span class="history-item-title">{{ chat.title || '未命名对话' }}</span>
                <span class="history-item-time">{{ formatTime(chat.updated_at) }}</span>
              </div>
            </div>
          </div>
          <div class="history-item-actions">
            <a-button type="link" size="small" @click.stop="showEditModal(chat)">
              <template #icon><EditOutlined /></template>
            </a-button>
            <a-button type="link" size="small" @click.stop="handleDelete(chat)">
              <template #icon><DeleteOutlined /></template>
            </a-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑标题对话框 -->
    <a-modal
      v-model:visible="editModalVisible"
      title="修改标题"
      @ok="handleEditSubmit"
      @cancel="handleEditCancel"
      :confirmLoading="editLoading"
    >
      <a-input v-model:value="editTitle" placeholder="请输入新标题" />
    </a-modal>
  </a-drawer>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getChatList, deleteChat, updateChat } from '../api/chat';
import { useUserStore } from '../stores/user';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:visible', 'select']);

const chatHistory = ref([]);
const userStore = useUserStore();

// 编辑标题相关的状态
const editModalVisible = ref(false);
const editTitle = ref('');
const editLoading = ref(false);
const currentEditChat = ref(null);

const fetchChatHistory = async () => {
  try {
    if (userStore.id) {
      const response = await getChatList(userStore.id);
      chatHistory.value = response.data;
    }
  } catch (error) {
    console.error('获取聊天历史失败:', error);
  }
};

onMounted(() => {
  if (userStore.isLoggedIn) {
    fetchChatHistory();
  }
});

const onClose = () => {
  emit('update:visible', false);
};

const selectChat = async (chat) => {
  await fetchChatHistory();
  emit('select', chat);
  onClose();
};

const showEditModal = (chat) => {
  currentEditChat.value = chat;
  editTitle.value = chat.title || '';
  editModalVisible.value = true;
};

const handleEditCancel = () => {
  editModalVisible.value = false;
  editTitle.value = '';
  currentEditChat.value = null;
};

const handleEditSubmit = async () => {
  if (!editTitle.value.trim()) {
    message.warning('标题不能为空');
    return;
  }

  try {
    editLoading.value = true;
    await updateChat(currentEditChat.value.id, { title: editTitle.value.trim() });
    message.success('修改成功');
    await fetchChatHistory();
    handleEditCancel();
  } catch (error) {
    console.error('修改失败:', error);
    message.error('修改失败');
  } finally {
    editLoading.value = false;
  }
};

const handleDelete = async (chat) => {
  try {
    await deleteChat(chat.id);
    message.success('删除成功');
    await fetchChatHistory();
  } catch (error) {
    console.error('删除失败:', error);
    message.error('删除失败');
  }
};

const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const date = new Date(timeStr);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${month}-${day} ${hours}:${minutes}`;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

.history-item:hover {
  background: #e6f7ff;
}

.history-item-content {
  flex: 1;
  min-width: 0;
}

.history-item-header {
  display: flex;
  align-items: center;
}

.history-item-info {
  display: flex;
  flex: 1;
  min-width: 0;
  gap: 16px;
  align-items: center;
}

.history-item-title {
  font-weight: 500;
  color: #333;
  flex-shrink: 0;
}

.history-item-time {
  font-size: 12px;
  color: #999;
  flex-shrink: 0;
}

.history-item-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.history-item-actions .ant-btn {
  color: #999;
}

.history-item-actions .ant-btn:hover {
  color: #1890ff;
}
</style> 