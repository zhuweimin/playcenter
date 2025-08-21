import request from '@/utils/request'

// 查询play列表
export function listGuess(query) {
  return request({
    url: '/play/guess/list',
    method: 'post',
    data: query

  })
}


// 新增play
export function saveGuess(data) {
  return request({
    url: '/play/guess/saveGuess/',
    method: 'post',
    data: data
  })
}

// 修改play
export function updateGuess(data) {
  return request({
    url: '/play/guess/updateGuess/',
    method: 'post',
    data: data
  })
}

// 删除play
export function delGuess(id) {
  return request({
    url: '/play/guess/delGuess/?id='+id,
    method: 'post'
  })
}
