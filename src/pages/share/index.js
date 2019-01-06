import Taro, { Component } from '@tarojs/taro'
import { View, Text , ScrollView} from '@tarojs/components'
import {AtButton, AtProgress, AtList, AtAvatar, AtIcon, AtListItem, AtCard, AtDivider, AtActionSheetItem, AtActionSheet} from 'taro-ui'
import './index.scss'
import apis from '../../apis/apis'

export default class Index extends Component {

  config = {
    navigationBarTitleText: 'OpenOKR 分享'
  }

  constructor(props) {
    super(props)
    this.state = {
      openid: null,
      isLogined: false,
      isSetted: false,
      userinfo: null,
      okrList: [],
      myWords: null,
      showFix: false,
      fixItemIndex: 0,
      systemInfo: null,
      myWordsH: 150,
      show: false
    }
  }

  componentWillMount () {
    let openid = this.$router.params.fromOpenid
    let okrTitle = this.$router.params.okrTitle
    if(okrTitle) {
      Taro.setNavigationBarTitle({title: okrTitle})
    }
    if(openid) {
      apis.openokr('getshokrlist', 'openid=' + openid, {
        success: (res) => {
          if(res.data.okrlist !== undefined) {
            this.setState({
              myWords: res.data.okrlist.myWords,
              okrList: res.data.okrlist.list,
              okrTitle: res.data.okrlist.okrTitle,
              show: true
            })
            Taro.setNavigationBarTitle({
              title: res.data.okrlist.okrTitle
            })
          }
        },
        fail: (err) => console.log(err)
      })
      apis.openokr('getuserinfo', 'openid=' + openid, {
        success: (res) => {
          if(res.data.userinfo !== undefined) {
            this.setState({
              userinfo: res.data.userinfo
            })
          }
        }
      })
    }

    // 上报
    let systemInfo = Taro.getSystemInfoSync()
    systemInfo['openid'] = 'share'
    apis.reportwx('openokr', encodeURIComponent(JSON.stringify(systemInfo).toString()), '2')

    this.setState({
      systemInfo
    })
  }

  /**
   * 页面分享
   * @returns {{title: string, path: string, imageURL: string}}
   */
  onShareAppMessage() {
    const openid = this.$router.params.fromOpenid
    return {
      title: 'OpenOKR ' + this.state.okrTitle,
      path: '/pages/share/index?fromOpenid=' + openid,
      imageURL: 'https://junjiancard.manmanqiusuo.com/static/images/openokr.png'
    }
  }

  onClickMyButton = () => {
    Taro.redirectTo({url:'/pages/firstpage/index?'})
  }

  componentDidMount () {}

  componentWillUnmount () { }

  componentDidShow () {}

  componentDidHide () { }

  render () {
    const {okrList} = this.state
    return (
      <View className='index'>
        {this.state.show && okrList.length === 0 ? (
          <View>
            <View className='tipsContainer'>
              <Text className='tipsText'>
                分享的内容暂时为空
              </Text>
            </View>
            <View className='bottomContainer'>
              <AtButton className='bottomButton' onClick={this.onClickMyButton}>回自己的主页</AtButton>
            </View>
          </View>
        ): null}
        {
          this.state.show && okrList.length > 0 ? (
            <View className='myWordsContainer'>
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
          this.state.show && okrList.length > 0 ? (
            <View className='addIconContainer'>
              <View onClick={this.onClickMyButton}>
                <AtIcon value='link' size='28' color='#04d568'></AtIcon>
              </View>
            </View>
          ):null
        }
        {
          this.state.show && this.state.myWordsH !== 0 && okrList.length > 0 ? (
            <ScrollView scrollY scrollWithAnimation style={{height: (this.state.systemInfo.windowHeight-this.state.myWordsH)+'px'}}>
              {
                this.state.okrList.map((item, index) => {
                  return (
                    <View className='itemContainer' key={index}>
                      <AtCard
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
      </View>
    )
  }
}

