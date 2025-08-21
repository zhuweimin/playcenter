import request from "@/utils/request";

export function eventList(query) {
  return request({
    url: '/play/log/list',
    method: 'post',
    data: query

  })
}
  export function flushData() {
    return request({
      url: '/play/log/flushData',
      method: 'post'

    })
  }
    export function exportData(query) {
    return request({
      url: '/play/log/exportData',
      method: 'post',
      data: query,
      responseType: 'blob'
    })
}
