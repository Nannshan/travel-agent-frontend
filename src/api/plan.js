import myAxios from "../util/request.js";

//获取计划列表
export function getPlanList(userid) {
    return myAxios.get(`/api/AgentManagement/planList/${userid}`);
}

//获取计划详情
export function getPlanDetail(id) {
    return myAxios.get(`/api/AgentManagement/planDetail/${id}`);
}

//根据userid和chatid获取
export function getByTwo(userid, chatid) {
    return myAxios.get(`/api/AgentManagement/getByTwo/${userid}/${chatid}`);
}

// 添加计划
export function addPlan(userid, data) {
    return myAxios.post(`/api/AgentManagement/planList/${userid}`, data);
}

// 删除计划
export function deletePlan(id) {
    return myAxios.delete(`/api/AgentManagement/planDetail/${id}`);
}

// 更新计划
export function updatePlan(id, data) {
    return myAxios.put(`/api/AgentManagement/planDetail/${id}`, data);
}
