import request from '@/utils/request'

// 获取用户列表
export function getUserList(params) {
  return request({
    url: '/play/user/list',
    method: 'post',
    data: params
  })
}

// 获取用户详情
export function getUserDetail(id) {
  return request({
    url: `/play/user/log/${id}`,
    method: 'get'
  })
}

// 导出用户数据
export function exportUserData(params) {
  return request({
    url: '/play/user/export',
    method: 'post',
    data: params,
    responseType: 'blob'
  })
}


