import Taro from '@tarojs/taro'


let ROUBOAPI = 'https://junjiancard.manmanqiusuo.com/roubo/rouboapi/v1/'

const openokr = (type, params, callback) => {
  Taro.request({
    url: ROUBOAPI + 'openokr/' + '?type=' + type + "&" + params
  }).then(res => {
    callback.success(res.data)
  }).catch(err => {
    callback.fail(err)
  })
}

const openokr_post = (type, params, callback) => {
  let data = {'type': type}
  for (let key in params){
    data[key] = params[key]
  }
  Taro.request({
    url: ROUBOAPI + 'openokr/',
    method: 'POST',
    data: data
  }).then(res => {
    callback.success(res.data)
  }).catch(err => {
    callback.fail(err)
  })
}
const reportwx = (type, systeminfo, pageinfo, callback) => {
  Taro.request({
    url: ROUBOAPI + 'wxreport/' + '?report_type=' + type + "&" + "system_info=" + systeminfo + '&page_info=' + pageinfo
  })
}


const apis = {
  openokr,
  openokr_post,
  reportwx
}

export default apis
