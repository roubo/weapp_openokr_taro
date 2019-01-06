import Taro, { Component } from '@tarojs/taro'
import { View, Text , ScrollView} from '@tarojs/components'
import {AtButton, AtProgress, AtList, AtAvatar, AtIcon, AtListItem, AtCard, AtDivider, AtActionSheetItem, AtActionSheet} from 'taro-ui'
import './index.scss'
import apis from '../../apis/apis'

export default class Index extends Component {

  config = {
    navigationBarTitleText: '我的ORK'
  }

  constructor(props) {
    super(props)
    this.state = {
      openid: null,
      isLogined: false,
      isSetted: false,
      userinfo: null,
      okrList: null,
      myWords: null,
      showFix: false,
      fixItemIndex: 0,
      systemInfo: null,
      myWordsH: 150
    }
  }


  /**
   * 用户授权回调，获取、上传、保持用户信息
   * @param data
   */
  onGetUserInfo = (data) => {
    let openid = Taro.getStorageSync('openid')
    if(data.detail.userInfo) {
      apis.openokr('setuserinfo', "openid=" + openid + "&userinfo=" + encodeURIComponent(JSON.stringify(data.detail.userInfo).toString()), {
        success: (res) => {
          console.log(res)
        }
      })
      Taro.setStorageSync('userinfo', data.detail.userInfo)
      this.setState({
        isLogined: true,
        userinfo: data.detail.userInfo
      })
    }
  }

  /**
   * 点击设置按钮
   */
  onClickSettingButton = () => {
    Taro.setStorageSync('krList', [])
    Taro.navigateTo({
      url: '/pages/setting/index'
    })
  }

  onTopSetting = () => {
    Taro.navigateTo({
      url: '/pages/topsetting/index'
    })
  }

  /**
   * 点击修改目标内容
   */
  onClickFixButton = (index, e) => {
    if(e._relatedInfo.anchorTargetText === '...' || e._relatedInfo.anchorTargetText === this.state.okrList[index].okrTarget) {
      this.setState({
        showFix: true,
        fixItemIndex: index
      })
    } else {
      Taro.setStorageSync('krList', [])
      Taro.navigateTo({
        url: '/pages/setting/index?editTargetIndex=' + index
      })
    }

  }

  /**
   * 取消浮层
   */
  onActionCancel = () => {
    this.setState({
      showFix: false
    })
  }
  /**
   * 编辑条目
   */
  onActionEdit = () => {
    this.setState({
      showFix: false
    })
    Taro.setStorageSync('krList', [])
    Taro.navigateTo({
      url: '/pages/setting/index?editTargetIndex=' + this.state.fixItemIndex
    })
  }

  /**
   * 设置分享时隐藏
   */
  onActionHide = () => {
    let tmpList = this.state.okrList
    tmpList[this.state.fixItemIndex]['hide'] = ! tmpList[this.state.fixItemIndex]['hide']
    this.setState({
      okrList: tmpList
    })
    Taro.setStorageSync('okrList', tmpList)
    this.uploadOkrList()
  }

  onActionDelete = () => {
    let tmpList = this.state.okrList
    tmpList.splice(this.state.fixItemIndex, 1)
    this.setState({
      okrList: tmpList,
      showFix: false
    })
    Taro.setStorageSync('okrList', tmpList)
    this.uploadOkrList()
  }

  onMyWordsLayout = (e) => {
    console.log(e.nativeEvent.layout.height)
    this.setState({
      myWordsH: e.nativeEvent.layout.height + 30
    })
  }

  /**
   *  更新数据到服务端
   * */
  uploadOkrList = () => {
    let okrTitle = Taro.getStorageSync('okrTitle')
    let myWords = Taro.getStorageSync('myWords')
    let okrList = Taro.getStorageSync('okrList')
    let openid = Taro.getStorageSync('openid')
    let okrlist = {
      okrTitle: okrTitle,
      myWords: myWords,
      list: okrList
    }
    // apis.openokr('setokrlist', 'openid=' + openid + '&okrlist=' + encodeURIComponent(JSON.stringify(okrlist).toString()), {
    //   success: (res) => console.log(res),
    //   fail: (err) => console.log(err)
    // })
    apis.openokr_post('setokrlist', {
      'openid': openid,
      okrlist: encodeURIComponent(JSON.stringify(okrlist).toString())
    }, {
      success: (res) => console.log(res),
      fail: (err) => console.log(err),
    })
  }

  refMyWordView = (ref) => {
    this.myWordView = ref
    console.log('....')
    console.log(this.myWordView)
  }

  componentWillMount () {
    // 只有从首页跳过来并且为未登录情况下，才显示登录按钮
    if(this.$router.params.type !== 'logout') {
        this.setState({
          isLogined: true,
          userinfo: Taro.getStorageSync('userinfo')
        })
    }
    // 上报
    let systemInfo = Taro.getSystemInfoSync()
    let openid = Taro.getStorageSync('openid')
    systemInfo['openid'] = openid
    apis.reportwx('openokr', encodeURIComponent(JSON.stringify(systemInfo).toString()), '1')

    this.setState({
      systemInfo
    })

    let okrTitle = Taro.getStorageSync('okrTitle')
    let myWords = Taro.getStorageSync('myWords')
    let okrList = Taro.getStorageSync('okrList')
    if(okrTitle) {
      Taro.setNavigationBarTitle({
        title: okrTitle
      })
    }
    if(okrList) {
      this.setState({
        okrList: okrList,
        myWords: myWords
      })
    }else {
      this.setState({
        okrList: [],
        myWords: myWords
      })
    }
  }

  /**
   * 页面分享
   * @returns {{title: string, path: string, imageURL: string}}
   */
  onShareAppMessage() {
    const openid = Taro.getStorageSync("openid")
    let okrTitle = Taro.getStorageSync("okrTitle")
    return {
      title: 'OpenOKR ' + okrTitle,
      path: '/pages/share/index?fromOpenid=' + openid + '&okrTitle=' + okrTitle,
      imageURL: 'https://junjiancard.manmanqiusuo.com/static/images/openokr.png'
    }
  }
  componentDidMount () {}

  componentWillUnmount () { }

  componentDidShow () {
    Taro.setStorageSync('editIndexKr', null)
    Taro.setStorageSync('editIndexOkr', null)
    if(Taro.getStorageSync('updateOkr')) {
      Taro.setStorageSync('updateOkr', false)
      let okrList = Taro.getStorageSync('okrList')
      let okrTitle = Taro.getStorageSync('okrTitle')
      let myWords = Taro.getStorageSync('myWords')
      Taro.setNavigationBarTitle({title: okrTitle})
      if(okrList) {
        this.setState({
          okrList: okrList,
          myWords: myWords
        })
      }else {
        this.setState({
          okrList: [],
          myWords: myWords
        })
      }
    }else{
      let okrTitle = Taro.getStorageSync('okrTitle')
      let myWords = Taro.getStorageSync('myWords')
      Taro.setNavigationBarTitle({title: okrTitle})
      this.setState({
        myWords: myWords
      })

    }
  }

  componentDidHide () { }

  onClickMyButton = () => {
    Taro.navigateTo({url:'/pages/share/index?fromOpenid=o-2oN5IaCDDZf-z85J6G3GLB2hQU&okrTitle=作者的分享'})
  }

  render () {
    const {okrList} = this.state
    return (
      <View className='index'>
        {this.state.isLogined ? null : (
          <View>
            <View className='tipsContainer'>
              <Text className='tipsText'>
                你好，很高兴你能来使用 OpenOKR 小程序，这是我的业余作品，如有不足之处，请海涵。OKR (Objectives and Key Results）即目标与关键结果，是一套英特尔发明的针对无法量化考核的研发部门的考核方法。我们尝试将这种方法在忙碌且可能较为杂乱的工作和生活中使用，比如新年里的一个全年规划。我们推荐为每个目标都设置进度条，可视化进度。
              </Text>
            </View>
            <View className='bottomContainer'>
              <AtButton lang='zh_CN' openType='getUserInfo' className='bottomButton' onGetUserInfo={this.onGetUserInfo}>微信一键登录</AtButton>
            </View>
          </View>
        )}
        {this.state.isLogined && okrList.length === 0 ? (
          <View>
            <View className='tipsContainer'>
              <Text className='tipsText'>
                {this.userinfo.nickName}, 你好，OKR (Objectives and Key Results）即目标与关键结果，一般有若干个目标组成你的规划，而每个目标需要设置若干个关键结果。我们建议，每个目标最多设置不超过5个关键结果，关键结果最好是可量化并且具有一定的挑战性。好吧，点击下面的设置按钮，来试试看吧。也可以参考下作者的页面。
              </Text>
              <View onClick={this.onClickMyButton}>
                <AtIcon value='link' size='28' color='#04d568'></AtIcon>
              </View>
            </View>
            <View className='bottomContainer'>
              <AtButton className='bottomButton' onClick={this.onClickSettingButton}>开始你的规划</AtButton>
            </View>
          </View>
          ): null}
        {
          this.state.isLogined && okrList.length > 0 ? (
            <View ref={this.refMyWordView} className='myWordsContainer' onLayout={this.onMyWordsLayout} onClick={this.onTopSetting}>
              <Text className='myWordsTitle'>
                我的寄语：
                <Text className='myWordsText'>
                  {this.state.myWords === null ? "Do My Best!!!" : this.state.myWords}
                </Text>
              </Text>
              <View className='avatarContainer'>
                <AtAvatar size='small' circle image={this.state.userinfo.avatarUrl}></AtAvatar>
              </View>
            </View>
          ) : null
        }
        {
          this.state.isLogined && okrList.length > 0 ? (
            <View className='addIconContainer'>
              <View onClick={this.onClickSettingButton}>
                <AtIcon value='add-circle' size='28' color='#04d568'></AtIcon>
              </View>
            </View>
          ):null
        }
        {
          this.state.myWordsH !== 0 && this.state.isLogined && okrList.length > 0 ? (
            <ScrollView scrollY scrollWithAnimation style={{height: (this.state.systemInfo.windowHeight-this.state.myWordsH)+'px'}}>
              {
                this.state.okrList.map((item, index) => {
                  return (
                    <View className='itemContainer' key={index}>
                      <AtCard
                        onClick={this.onClickFixButton.bind(this, index)}
                        className='cardContainer'
                        note={"截止时间：" + item.okrDeadLine}
                        thumb={item.hide ? "https://junjiancard.manmanqiusuo.com/static/images/hide.png" : ""}
                        extra='...'
                        title={item.okrTarget}
                      >
                        <AtList>
                          {item.krList.map((kr, krIndex) => {
                            return (
                              <View className='krItemContainer' key={krIndex}>
                                <Text>{kr.krName}</Text>
                                <AtProgress
                                  status={(kr.krNow-kr.krStart)/(kr.krTarget-kr.krStart)*100 >= 100?'success':'progress'}
                                  percent={Math.round((kr.krNow-kr.krStart)/(kr.krTarget-kr.krStart)*100)}
                                  color={kr.krNow/(kr.krTarget-kr.krStart)*100 > 80 ? '#04d568':'#FF4949'}
                                />
                                <View className='divider'/>
                              </View>
                            )
                          })}
                        </AtList>
                      </AtCard>
                    </View>
                  )
                })
              }
            </ScrollView>
          ):null
        }
        {/*{this.state.isLogined && okrList.length > 0 ? (*/}
          {/*<View className='bottomContainer'>*/}
            {/*<AtButton className='bottomButton' onClick={this.onClickSettingButton}>增加目标</AtButton>*/}
          {/*</View>*/}
        {/*): null}*/}
        <AtActionSheet isOpened={this.state.showFix} cancelText='取消' onCancel={this.onActionCancel} onClose={this.onActionCancel}>
          <AtActionSheetItem onClick={this.onActionEdit}>
            查看编辑该目标详情
          </AtActionSheetItem>
          <AtActionSheetItem onClick={this.onActionHide}>
            {okrList && okrList[this.state.fixItemIndex] && okrList[this.state.fixItemIndex].hide ? "恢复分享时可见" : "设置分享时不可见"}
          </AtActionSheetItem>
          <AtActionSheetItem onClick={this.onActionDelete}>
            删除该目标
          </AtActionSheetItem>
        </AtActionSheet>
      </View>
    )
  }
}

