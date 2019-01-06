import Taro, { Component } from '@tarojs/taro'
import { View, } from '@tarojs/components'
import {AtActivityIndicator} from 'taro-ui'
import './index.scss'
import apis from '../../apis/apis'

export default class Index extends Component {

  config = {
    navigationBarTitleText: 'OpenOKR'
  }


  /**
   * 更新用户信息，同时获取列表数据, 启动后仅获取一次
   * @param openid
   */
  getUserInfo = (openid) => {
    let userInfo = Taro.getStorageSync('userinfo')
    if (userInfo) {
      apis.openokr('getokrlist', 'openid=' + openid, {
        success: (res) => {
          if(res.data.okrlist !== undefined) {
            Taro.setStorageSync('okrTitle', res.data.okrlist.okrTitle)
            Taro.setStorageSync('myWords', res.data.okrlist.myWords)
            Taro.setStorageSync('okrList', res.data.okrlist.list)
          }else{
            Taro.setStorageSync('okrList', [])
          }
          Taro.redirectTo({url:'/pages/index/index?type=login'})
        },
        fail: (err) => Taro.redirectTo({url:'/pages/index/index?type=login'})
      })

    }else{
      apis.openokr('getuserinfo', 'openid=' + openid, {
        success: (res) => {
          if(res.data.userinfo !== null && res.data.userinfo !== '' && res.data.userinfo !== undefined){
            Taro.setStorageSync('userinfo', res.data.userinfo)
            apis.openokr('getokrlist', 'openid=' + openid, {
              success: (ress) => {
                if(ress.data.okrlist !== undefined) {
                  Taro.setStorageSync('okrTitle', ress.data.okrlist.okrTitle)
                  Taro.setStorageSync('myWords', ress.data.okrlist.myWords)
                  Taro.setStorageSync('okrList', ress.data.okrlist.list)
                }else{
                  Taro.setStorageSync('okrList', [])
                }
                Taro.redirectTo({url:'/pages/index/index?type=login'})
              },
              fail: (err) => Taro.redirectTo({url:'/pages/index/index?type=login'})
            })
          }else{
            apis.openokr('getokrlist', 'openid=' + openid, {
              success: (ress) => {
                if(ress.data.okrlist !== undefined) {
                  Taro.setStorageSync('okrTitle', ress.data.okrlist.okrTitle)
                  Taro.setStorageSync('myWords', ress.data.okrlist.myWords)
                  Taro.setStorageSync('okrList', ress.data.okrlist.list)
                }else{
                  Taro.setStorageSync('okrList', [])
                }
                Taro.redirectTo({url:'/pages/index/index?type=logout'})
              },
              fail: (errr) => Taro.redirectTo({url:'/pages/index/index?type=logout'})
            })
          }
        },
        fail: (err) => {
          apis.openokr('getokrlist', 'openid=' + openid, {
            success: (ress) => {
              if(ress.data.okrlist !== undefined) {
                Taro.setStorageSync('okrTitle', ress.data.okrlist.okrTitle)
                Taro.setStorageSync('myWords', ress.data.okrlist.myWords)
                Taro.setStorageSync('okrList', ress.data.okrlist.list)
              }
              Taro.redirectTo({url:'/pages/index/index?type=logout'})
            }
          })
        }
      })
    }
  }

  /**
   *  检测登录等信息
   */
  checkLogin = () => {
    // 只是确保session_key是可用的,理论上需要调用checkSession，但是目前业务上只要拥有 openid 便可
    let openid = Taro.getStorageSync('openid')
    if (openid) {
      this.getUserInfo(openid)
    } else {
      Taro.login().then(res => {
        apis.openokr('login', "wxcode=" + res.code, {
          success: (ress) => {
            Taro.setStorageSync('openid', ress.data.openid)
            this.getUserInfo(ress.data.openid)
          }
        })
      })
    }
  }


  componentWillMount () {
    this.checkLogin()
  }


  componentWillUnmount () { }


  componentDidHide () { }

  render () {
    return (
      <View className='index'>
        <AtActivityIndicator mode='center' content='正在加载中，请稍后...'></AtActivityIndicator>
      </View>
    )
  }
}

