import myAxios from "../util/request.js";

//获取计划列表
export function getPlanList(userid) {
    return myAxios.get(`/api/Agent/planList/${userid}`);
}

//获取计划详情
export function getPlanDetail(id) {
    return myAxios.get(`/api/Agent/planDetail/${id}`);
}

// 添加计划
export function addPlan(userid, data) {
    return myAxios.post(`/api/Agent/planList/${userid}`, data);
}

// 删除计划
export function deletePlan(id) {
    return myAxios.delete(`/api/Agent/planDetail/${id}`);
}

// 更新计划
export function updateChat(id, data) {
    return myAxios.put(`/api/Agent/planDetail/${id}`, data);
}
