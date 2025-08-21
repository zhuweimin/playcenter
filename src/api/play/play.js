import request from '@/utils/request'

// 查询play列表
export function listPlay(query) {
  return request({
    url: '/play/info/list',
    method: 'post',
    data: query

  })
}


// 新增play
export function addPlay(data) {
  return request({
    url: '/play/info/savePlay/',
    method: 'post',
    data: data
  })
}

// 修改play
export function updatePlay(data) {
  return request({
    url: '/play/info/updatePlay/',
    method: 'post',
    data: data
  })
}
export function playList(type) {
  return request({
    url: '/play/info/playList/?queryType='+type,
    method: 'get',
  })
}

// 删除play
export function delPlay(id) {
  return request({
    url: '/play/info/delPlay/?id='+id,
    method: 'post'
  })
}

export function uploadImg( data) {

  return request({
    url: '/play/info/uploadImg/',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}
export function uploadGame(data) {

  return request({
    url: '/play/info/uploadGame/',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

