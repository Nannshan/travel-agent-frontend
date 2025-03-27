import myAxios from "../util/request.js";

//获取聊天列表
export function getChatList(userid) {
    return myAxios.get(`/api/AgentManagement/chatList/${userid}`);
}

//获取聊天详情
export function getChatDetail(id) {
    return myAxios.get(`/api/AgentManagement/chatDetail/${id}`);
}

// 添加聊天
export function addChat(userid, data) {
    return myAxios.post(`/api/AgentManagement/chatList/${userid}`, data);
}

// 删除聊天
export function deleteChat(id) {
    return myAxios.delete(`/api/AgentManagement/chatDetail/${id}`);
}

// 更新聊天
export function updateChat(id, data) {
    return myAxios.put(`/api/AgentManagement/chatDetail/${id}`, data);
}