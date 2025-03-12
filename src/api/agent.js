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
    const response = await myAxios.post(`/agent/threads/${threadId}/runs`, {
      assistant_id: assistantId,
      input: input,
    });
    return response.data;
  } catch (error) {
    console.error('发送消息失败:', error.message);
    throw error;
  }
};

// 流式消息
export const sendMessageStream = async (threadId, assistantId, input, onMessage) => {
  let str ='';
  try {
    const response = await myAxios.post(`/agent/threads/${threadId}/runs/stream`, {
      assistant_id: assistantId,
      input: input,
      stream_mode: ["messages"],
    }, {
      responseType: 'stream',
      onDownloadProgress: (progressEvent) => {
        const chunks = progressEvent.event.target.response.split('\n');
        chunks.forEach(chunk => {
          if (chunk.trim()) {
            try {
              let data = null;
              if(chunk.startsWith("data:")){
                data = chunk.substring("data: ".length);
              }
              data = JSON.parse(data);
              if(data[0]?.content){
                str = data[0].content;
                console.log(str);
                onMessage(str)
              }
            } catch (e) {
              console.warn('解析流数据失败:', e);
            }
          }
        });
      }
    });
    return response.data;
  } catch (error) {
    console.error('发送消息失败:', error.message);
    throw error;
  }
};