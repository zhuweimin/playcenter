import request from '@/utils/request'

// 查询play列表
export function listHot(query) {
  return request({
    url: '/play/hot/list',
    method: 'post',
    data: query

  })
}


// 新增play
export function saveHot(data) {
  return request({
    url: '/play/hot/saveHot/',
    method: 'post',
    data: data
  })
}

// 修改play
export function updateHot(data) {
  return request({
    url: '/play/hot/updateHot/',
    method: 'post',
    data: data
  })
}

// 删除play
export function delHot(id) {
  return request({
    url: '/play/hot/delHot/?id='+id,
    method: 'post'
  })
}
