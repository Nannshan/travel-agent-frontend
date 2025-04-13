import myAxios from "../util/request.js";
import OpenAI from "openai";

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
export const sendInitialMessageInvoke = async (threadId, assistantId, input) => {
  try {
    const response = await myAxios.post(`/agent/threads/${threadId}/runs/wait`, {
      assistant_id: assistantId,
      input: input,
      stream_mode: ["values"],
    });
    const messages = response.data.messages;
    // 返回最后一条消息的content
    return messages[messages.length - 1].content;
  } catch (error) {
    console.error('发送消息失败:', error.message);
    throw error;
  }
};

export const sendUserMessageInvoke = async (threadId, assistantId, input) => {
  try {
    const response = await myAxios.post(`/agent/threads/${threadId}/runs/wait`, {
      assistant_id: assistantId,
      command: {resume: input},
      stream_mode: ["values"],
    });
    const messages = response.data.messages;
    // 返回最后一条消息的content
    console.log(messages[messages.length - 1].content);
    return messages[messages.length - 1].content;
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

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: 'sk-6bf57ceb23e9467cb5e77f81b57b8c84',
  dangerouslyAllowBrowser: true
});

//生成昵称
export const generateTitle = async (messageContents) => {
  try {
    const messages = [
      { 
        role: "system", 
        content: "你是一个标题生成助手。请根据对话内容生成一个简短的标题，主要关注旅行目的地和特点。标题长度控制在15个字以内。" 
      },
      { 
        role: "user", 
        content: `请为以下对话生成一个标题：\n${messageContents}，直接返回标题，不要使用json格式。`
      }
    ];
    
    const completion = await openai.chat.completions.create({
      messages: messages,
      model: "deepseek-chat",
      max_tokens: 50,
      temperature: 0.7
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('生成标题失败:', error);
    return '新的旅行计划';  // 返回默认标题
  }
};