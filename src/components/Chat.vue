<template>
  <div class="chat-section">
    <div class="chat-messages">
      <div
        v-for="message in messages"
        :key="message.id"
        :class="['message', message.type]"
      >
        <div class="avatar">
          <template v-if="message.type === 'agent'">
            <img :src="agentAvatar" alt="AI Avatar" />
          </template>
          <template v-else>
            <a-avatar :size="40">{{ userInitial }}</a-avatar>
          </template>
        </div>
        <div class="content">
          {{ message.content }}
        </div>
      </div>
    </div>

    <div class="chat-input">
      <input
        v-model="userInput"
        type="text"
        placeholder="输入消息..."
        @keyup.enter="handleSendMessage"
      />
      <button @click="handleSendMessage">发送</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { Avatar as AAvatar } from 'ant-design-vue';
import agentAvatar from '@/assets/agent-avatar.svg';
import {createThread, sendInitialMessageStream, sendMessageInvoke, sendUserMessageStream} from "@/api/agent.js";
import { useUserStore } from '@/stores/user';
import {addChat, updateChat, getChatDetail} from "@/api/chat.js";

const props = defineProps({
  chatId: {
    type: String,
    default: ''
  },
  reset: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['new-chat']);

const userStore = useUserStore();

// 计算用户头像显示
const userInitial = computed(() => {
  if (userStore.userInfo && userStore.userInfo.name) {
    return userStore.userInfo.name.charAt(0).toUpperCase();
  }
  return 'U';
});

// 聊天消息数据
const messages = ref([
  {
    id: 1,
    type: "agent",
    content: "想去哪玩呢？告诉我您的出发城市、出发日期、旅行天数和偏好，我来帮您规划行程。",
  }
]);

// 滚动到底部
const scrollToBottom = () => {
  const chatMessages = document.querySelector('.chat-messages');
  if (chatMessages) {
    setTimeout(() => {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 100);
  }
};

// 监听消息变化
watch(() => messages.value, () => {
  scrollToBottom();
}, { deep: true });

const userInput = ref("");
const assistantId = ref("fe096781-5601-53d2-b2f6-0d3403f7e9ca")
const threadId = ref("");

// 加载聊天记录
const loadChatHistory = async (id) => {
  if (!id) return;
  
  try {
    const response = await getChatDetail(id);
    if (response && response.data) {
      const chatData = response.data;
      messages.value = JSON.parse(chatData.messages);
      threadId.value = chatData.threadid;
    }
  } catch (error) {
    console.error('加载聊天记录失败:', error);
  }
};

// 创建新聊天
const createNewChat = async () => {
  try {
    // 1. 创建OpenAI对话线程
    const threadResponse = await createThread();
    if (!threadResponse || !threadResponse.thread_id) {
      throw new Error('创建对话线程失败');
    }

    // 2. 创建聊天记录
    const chatData = {
      userid: userStore.userInfo.id,
      messages: JSON.stringify(messages.value),
      threadid: threadResponse.thread_id
    };
    
    const response = await addChat(userStore.userInfo.id, chatData);
    if (response && response.data && response.data.id) {
      threadId.value = threadResponse.thread_id;
      const newChatId = response.data.id.toString();
      emit('new-chat', newChatId);
      return true;
    } else {
      throw new Error('创建聊天记录失败');
    }
  } catch (error) {
    console.error('创建新聊天失败:', error);
    throw error;
  }
};

// 监听chatId变化
watch(() => props.chatId, async (newId) => {
  if (newId) {
    await loadChatHistory(newId);
  } else {
    messages.value = [{
      id: 1,
      type: "agent",
      content: "想去哪玩呢？告诉我您的出发城市、出发日期、旅行天数和偏好，我来帮您规划行程。",
    }];
    threadId.value = "";
  }
}, { immediate: true });

// 发送消息
const handleSendMessage = async () => {
  if (!userInput.value.trim()) return;

  const messageContent = userInput.value;
  userInput.value = ""; // 立即清空输入框

  try {
    // 添加用户消息
    messages.value.push({
      id: messages.value.length + 1,
      type: "user",
      content: messageContent,
    });

    messages.value.push({
      id: messages.value.length + 1,
      type: "agent",
      content: "思考中..."
    });

    // 如果没有thread_id，需要先创建新聊天
    if (!threadId.value || props.reset) {
      await createNewChat();
      // 异步处理初始化流式消息
      await sendInitialMessageStream(threadId.value, assistantId.value, messageContent, pushAIMessage);
    }
    else {
      // 异步处理聊天流式消息
      await sendUserMessageStream(threadId.value, assistantId.value, messageContent, pushAIMessage);
    }

    // 更新数据库中的消息记录
    if (props.chatId) {
      const chatData = {
        messages: JSON.stringify(messages.value)
      };

      try {
        await updateChat(props.chatId, chatData);
      } catch (error) {
        console.error('更新聊天记录失败:', error);
      }
    }

  } catch (error) {
    console.error("发送消息失败:", error);
    // 发生错误时，回滚消息状态
    messages.value.pop(); // 移除AI的响应
    messages.value.pop(); // 移除用户的消息
    userInput.value = messageContent; // 恢复用户输入
  }
};

// 更新AI消息
function pushAIMessage(data){
  // 添加AI响应到消息列表
  if (data && messages.value[messages.value.length-1].type === "agent") {
    messages.value[messages.value.length-1].content = data;
    scrollToBottom();
  }
}
</script>

<style scoped>
.chat-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e0e0e0;
  height: 100%;
  overflow: hidden;
  position: relative;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 20px;
  scroll-behavior: smooth;
  position: absolute;
  top: 0;
  bottom: 80px; /* 留出输入框的高度 */
  left: 0;
  right: 0;
}

.message {
  display: flex;
  margin-bottom: 20px;
  gap: 12px;
}

.message .avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.message .avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.message .content {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 8px;
  max-width: 70%;
}

.message.user {
  flex-direction: row-reverse;
}

.message.user .content {
  background: #007aff;
  color: white;
}

.chat-input {
  padding: 20px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 10px;
  align-items: center;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  height: 80px;
}

.chat-input input {
  flex: 1;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.chat-input button {
  padding: 10px 20px;
  background: #007aff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.chat-input button:hover {
  background: #0056b3;
}
</style>