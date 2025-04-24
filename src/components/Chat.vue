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
            <a-avatar :size="40" :src="userAvatarUrl">
              <template #icon v-if="!userAvatarUrl">
                {{ userInitial }}
              </template>
            </a-avatar>
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
import { computed, ref, watch } from "vue";
import { Avatar as AAvatar } from "ant-design-vue";
import { UserOutlined } from "@ant-design/icons-vue";
import agentAvatar from "@/assets/agent-avatar.svg";
import {
  createThread,
  sendInitialMessageStream,
  sendInitialMessageInvoke,
  sendUserMessageInvoke,
  sendUserMessageStream,
  generateTitle,
} from "@/api/agent.js";
import { useUserStore } from "@/stores/user";
import { addChat, getChatDetail, updateChat } from "@/api/chat.js";
import { addPlan, getByTwo, updatePlan } from "@/api/plan.js";

const props = defineProps({
  chatId: {
    type: String,
    default: "",
  },
  reset: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["new-chat", "ready-generate", "load-plan"]);
const userStore = useUserStore();

// 获取API基础URL
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// 计算用户头像URL
const userAvatarUrl = computed(() => {
  const url = userStore.userInfo.avatar_url;
  if (!url) return "";

  // 移除URL中可能存在的开头的/media
  const cleanUrl = url.startsWith("/media/") ? url.substring(6) : url;
  // 使用API URL访问头像
  return `${baseURL}/media/${cleanUrl}`;
});

// 计算用户头像显示
const userInitial = computed(() => {
  if (userStore.userInfo && userStore.userInfo.name) {
    return userStore.userInfo.name.charAt(0).toUpperCase();
  }
  return "U";
});

const userInput = ref("");
const assistantId = ref("fe096781-5601-53d2-b2f6-0d3403f7e9ca");
const threadId = ref("");
const messages = ref([
  {
    id: 1,
    type: "agent",
    content:
      "🌞 嗨～我是你的旅行小助手！准备好开始计划旅程了吗？想去哪玩呢？告诉我您的出发城市、出发日期、旅行天数和旅行偏好，我来帮您规划行程。",
  },
]);

// 滚动到底部
const scrollToBottom = () => {
  const chatMessages = document.querySelector(".chat-messages");
  if (chatMessages) {
    setTimeout(() => {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 100);
  }
};

// 监听消息变化
watch(
  () => messages.value,
  () => {
    scrollToBottom();
  },
  { deep: true },
);

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
    console.error("加载聊天记录失败:", error);
  }
};

// 创建新聊天
const createNewChat = async () => {
  try {
    // 1. 创建OpenAI对话线程
    const threadResponse = await createThread();
    if (!threadResponse || !threadResponse.thread_id) {
      throw new Error("创建对话线程失败");
    }

    // 2. 创建聊天记录
    const chatData = {
      userid: userStore.userInfo.id,
      messages: JSON.stringify(messages.value),
      threadid: threadResponse.thread_id,
    };

    const response = await addChat(userStore.userInfo.id, chatData);
    if (response && response.data && response.data.id) {
      threadId.value = threadResponse.thread_id;
      // 确保发送字符串类型的chatId
      emit("new-chat", response.data.id.toString());
      return response.data.id.toString();
    } else {
      throw new Error("创建聊天记录失败");
    }
  } catch (error) {
    console.error("创建新聊天失败:", error);
    throw error;
  }
};

// 监听chatId变化
watch(
  () => props.chatId,
  async (newId) => {
    if (newId) {
      await loadChatHistory(newId);
    } else {
      messages.value = [
        {
          id: 1,
          type: "agent",
          content:
            "🌞 嗨～我是你的旅行小助手！准备好开始计划旅程了吗？想去哪玩呢？告诉我您的出发城市、出发日期、旅行天数和旅行偏好，我来帮您规划行程。",
        },
      ];
      threadId.value = "";
    }
  },
  { immediate: true },
);

// 加载聊天记录和计划
const loadChatAndPlan = async (chatId, planId) => {
  await loadChatHistory(chatId);
  if (planId) {
    emit("load-plan", planId);
  }
};

// 发送消息
const handleSendMessage = async () => {
  if (!userInput.value.trim()) return;

  const messageContent = userInput.value;
  userInput.value = ""; // 立即清空输入框

  // 添加用户消息
  messages.value.push({
    id: messages.value.length + 1,
    type: "user",
    content: messageContent,
  });

  messages.value.push({
    id: messages.value.length + 1,
    type: "agent",
    content: "正在思考中...",
  });

  try {
    // 如果没有thread_id，需要先创建新聊天
    if (!threadId.value || props.reset) {
      const newChatId = await createNewChat();
      // 异步处理初始化流式消息
      const input = {
        initial_input: messageContent,
        chat_id: threadId.value,
      };
      const res = await sendInitialMessageInvoke(
        threadId.value,
        assistantId.value,
        input,
      );
      await pushAIMessage(res);
    } else {
      // 异步处理聊天流式消息
      const res = await sendUserMessageInvoke(
        threadId.value,
        assistantId.value,
        messageContent,
      );
      await pushAIMessage(res);
    }

    // 更新数据库中的消息记录
    if (props.chatId) {
      // 提取消息内容用于生成标题
      const messageContents = messages.value
        .map((msg) => msg.content)
        .join("\n");
      const title = await generateTitle(messageContents);

      const chatData = {
        title: title,
        messages: JSON.stringify(messages.value),
      };

      await updateChat(props.chatId, chatData);
    }
  } catch (error) {
    console.error("发送消息失败:", error);
    // 移除"正在思考中..."消息
    messages.value.pop();
    // 添加错误消息
    messages.value.push({
      id: messages.value.length + 1,
      type: "agent",
      content: "抱歉，发送消息失败，请重试。",
    });
  }
};

//更新计划
async function handle_plan(planData) {
  //根据是否存在决定更新还是新建
  try {
    const existingPlan = await getByTwo(userStore.userInfo.id, props.chatId);
    // 如果计划存在，则更新
    const res = await updatePlan(existingPlan.data.id, planData);
    emit("ready-generate", res.data.id);
    emit("load-plan", res.data.id); // 直接触发 load-plan 事件
  } catch (error) {
    if (error.response && error.response.status === 404) {
      // 如果计划不存在，则新建
      const res = await addPlan(userStore.userInfo.id, planData);
      emit("ready-generate", res.data.id);
      emit("load-plan", res.data.id); // 直接触发 load-plan 事件
    } else {
      throw error; // 其他错误则抛出
    }
  }
}

// 更新AI消息
async function pushAIMessage(data) {
  if (!data) return;

  const jsonData = JSON.parse(data);

  // 检查是否为生成行程的数据
  if (jsonData.type === "pre") {
    messages.value[messages.value.length - 1].content = jsonData.res;
    scrollToBottom();
  } else {
    const planData = {
      userid: userStore.userInfo.id,
      chatid: props.chatId,
      travel_plan: JSON.stringify(jsonData.travel_plan),
      threadid: threadId.value,
    };
    await handle_plan(planData);
    messages.value[messages.value.length - 1].content = jsonData.res || "已为您规划好一场完美的旅行，祝您旅途愉快！";
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
  padding: 12px 16px;
  border-radius: 12px;
  max-width: 70%;
  font-size: 16px;
  line-height: 1.6;
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
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
}

.chat-input button {
  padding: 12px 24px;
  background: #007aff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
}

.chat-input button:hover {
  background: #0056b3;
}
</style>
