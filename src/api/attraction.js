import myAxios from "../util/request.js";

//获取景点详情
export function getAttractionDetail(Id) {
    return myAxios.get(`/api/AttractionManagement/attractionDetail/${Id}`);
}

//获取景点列表
export function getAttractionList() {
    return myAxios.get(`/api/AttractionManagement/attractionList`);
}

//根据名称搜索景点
export function searchAttraction(name) {
    return myAxios.get(`/api/AttractionManagement/attractionByName/${name}`);
}

//根据名称精确搜索景点
export function searchAccurateAttraction(name) {
    return myAxios.get(`/api/AttractionManagement/accurateAttractionByName/${name}`);
}
