import request from '@/utils/request'

// 查询play列表
export function listBanner(query) {
  return request({
    url: '/play/banner/list',
    method: 'post',
    data: query

  })
}


// 新增play
export function saveBanner(data) {
  return request({
    url: '/play/banner/saveBanner/',
    method: 'post',
    data: data
  })
}

// 修改play
export function updateBanner(data) {
  return request({
    url: '/play/banner/updateBanner/',
    method: 'post',
    data: data
  })
}

// 删除play
export function delBanner(id) {
  return request({
    url: '/play/banner/delBanner/?id='+id,
    method: 'post'
  })
}
