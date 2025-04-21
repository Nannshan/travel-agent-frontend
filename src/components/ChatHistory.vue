<template>
  <a-drawer
    :open="open"
    title="历史对话"
    width="800"
    placement="right"
    @close="handleCancel"
  >
    <div class="history-container">
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
            <a-button type="link" size="small" @click.stop="handleEdit(chat)">
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
      v-model:open="editModalOpen"
      title="编辑对话名称"
      @ok="handleEditOk"
      @cancel="handleEditCancel"
    >
      <a-input v-model:value="editTitle" placeholder="请输入新标题" />
    </a-modal>
  </a-drawer>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { getChatList, deleteChat, updateChat } from '@/api/chat';
import { getByTwo } from '@/api/plan';
import { useUserStore } from '@/stores/user';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:open', 'select']);

const chatHistory = ref([]);
const userStore = useUserStore();

// 编辑标题相关的状态
const editModalOpen = ref(false);
const editTitle = ref('');
const currentEditingChat = ref(null);

const fetchChatHistory = async () => {
  try {
    if (userStore.userInfo?.id) {
      const response = await getChatList(userStore.userInfo.id);
      chatHistory.value = response.data;
    }
  } catch (error) {
    console.error('获取聊天历史失败:', error);
    message.error('获取聊天历史失败');
  }
};

// 监听open变化，当显示时刷新列表
watch(() => props.open, (newOpen) => {
  if (newOpen && userStore.isLoggedIn) {
    fetchChatHistory();
  }
});

onMounted(() => {
  if (userStore.isLoggedIn) {
    fetchChatHistory();
  }
});

const handleCancel = () => {
  emit('update:open', false);
};

const selectChat = async (chat) => {
  try {
    // 先获取最新的聊天历史
    await fetchChatHistory();
    
    // 尝试获取对应的旅行计划
    try {
      const planResponse = await getByTwo(userStore.userInfo.id, chat.id);
      emit('select', { chat, planId: planResponse.data.id });
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // 如果没有找到计划，只传递聊天信息
        emit('select', { chat, planId: null });
      } else {
        throw error;
      }
    }
    
    handleCancel();
  } catch (error) {
    console.error('选择聊天记录失败:', error);
    message.error('加载聊天记录失败');
  }
};

const handleEdit = (chat) => {
  currentEditingChat.value = chat;
  editTitle.value = chat.title || '';
  editModalOpen.value = true;
};

const handleEditCancel = () => {
  editModalOpen.value = false;
  editTitle.value = '';
  currentEditingChat.value = null;
};

const handleEditOk = async () => {
  if (!editTitle.value.trim()) {
    message.warning('标题不能为空');
    return;
  }

  try {
    await updateChat(currentEditingChat.value.id, { title: editTitle.value.trim() });
    message.success('修改成功');
    await fetchChatHistory();
    handleEditCancel();
  } catch (error) {
    console.error('修改失败:', error);
    message.error('修改失败');
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
.history-container {
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
  align-items: flex-start;
  gap: 12px;
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
  flex-direction: column;
  gap: 8px;
}

.history-item-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item-title {
  font-weight: 500;
  color: #333;
  font-size: 16px;
}

.history-item-time {
  font-size: 12px;
  color: #999;
}

.history-item-actions {
  display: flex;
  gap: 4px;
  padding-top: 4px;
}

.history-item-actions .ant-btn {
  color: #999;
  padding: 4px 8px;
}

.history-item-actions .ant-btn:hover {
  color: #1890ff;
  background: rgba(24, 144, 255, 0.1);
}

:deep(.right-side-modal) {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  padding: 0;
}

:deep(.right-side-modal .ant-modal) {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  margin: 0;
  padding: 0;
  height: 100vh;
  width: 800px !important;
}

:deep(.right-side-modal .ant-modal-content) {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 0;
}

:deep(.right-side-modal .ant-modal-body) {
  flex: 1;
  overflow-y: auto;
}

:deep(.right-side-modal .ant-modal-wrap) {
  position: absolute;
  right: 0;
}

:deep(.right-side-modal .ant-modal-mask) {
  background-color: rgba(0, 0, 0, 0.45);
}

/* 添加滑入动画 */
:deep(.right-side-modal .ant-modal) {
  transform: translateX(100%);
  animation: slideIn 0.3s forwards;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

/* 添加滑出动画 */
:deep(.right-side-modal .ant-modal.zoom-leave) {
  animation: slideOut 0.3s forwards;
}

@keyframes slideOut {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(100%);
  }
}
</style> 