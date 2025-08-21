import request from '@/utils/request'
export function dauList(query) {
  return request({
    url: '/play/dau/list',
    method: 'post',
    data: query

  })
}
  export function reportList(query) {
    return request({
      url: '/play/dau/reportList',
      method: 'post',
      data: query
    })
  }


// 导出日报数据
export function exportData(query) {
  return request({
    url: '/play/dau/reportExport',
    method: 'post',
    data: query,
    responseType: 'blob'
  });

}

