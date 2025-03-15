import myAxios from "../util/request.js";

// 创建新的对话线程
export const createThread = async () => {
  try {
    const { data } = await myAxios.post('/agent/threads', {
      if_exists: 'raise'
    });
    return data;
  } catch (error) {
    console.error('创建线程失败:', error.message);
  }
};

// 根据id获取对话线程状态
export const getThread = async (threadId) => {
  try {
    const { data } = await myAxios.get(`/agent/threads/${threadId}/state`);
    return data;
  } catch (error) {
    console.error('获取线程失败:', error.message);
  }
};


// 非流式消息
export const sendMessageInvoke = async (threadId, assistantId, input) => {
  try {
    const response = await myAxios.post(`/agent/threads/${threadId}/runs/wait`, {
      assistant_id: assistantId,
      command: {resume: input},
      stream_mode: ["values"],
    });
    return response.data.plans;
  } catch (error) {
    console.error('发送消息失败:', error.message);
    throw error;
  }
};

// 处理流式数据的进度
const handleStreamProgress = (progressEvent, onMessage) => {
  const chunks = progressEvent.event.target.response.split('\n');
  chunks.forEach(chunk => {
    if (chunk.trim()) {
      try {
        if(chunk.startsWith("data:")){
          const jsonStr = chunk.substring(6);
          const data = JSON.parse(jsonStr);
          if (Array.isArray(data) && data[0]?.type === 'ai' && data[0]?.content) {
            // 只处理非空内容
            if (data[0].content.trim()) {
              // console.log('AI消息:', data[0].content);
              onMessage(data[0].content);
            }
          }
        }
      } catch (e) {
        console.warn('解析流数据失败:', e);
      }
    }
  });
};

// 流式初始化消息
export const sendInitialMessageStream = async (threadId, assistantId, input, onMessage) => {
  try {
    const response = await myAxios.post(
      `/agent/threads/${threadId}/runs/stream`,
      {
        assistant_id: assistantId,
        input: input,
        stream_mode: ["messages"],
      },
      {
        responseType: "stream",
        onDownloadProgress: (progressEvent) =>
          handleStreamProgress(progressEvent, onMessage),
      },
    );
    return response.data;
  } catch (error) {
    console.error('发送消息失败:', error.message);
    throw error;
  }
};

// 用户聊天
export const sendUserMessageStream = async (threadId, assistantId, resume, onMessage) => {
  try {
    const response = await myAxios.post(`/agent/threads/${threadId}/runs/stream`, {
      assistant_id: assistantId,
      command: {resume: resume},
      stream_mode: ["messages"],
    }, {
      responseType: 'stream',
      onDownloadProgress: (progressEvent) => handleStreamProgress(progressEvent, onMessage)
    });
    return response.data;
  } catch (error) {
    console.error('发送消息失败:', error.message);
    throw error;
  }
};