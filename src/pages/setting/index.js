import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import {
  AtInput,
  AtDivider,
  AtTextarea,
  AtButton,
  Picker,
  AtActionSheet,
  AtActionSheetItem,
  AtListItem,
  AtList,
  AtCard,
  AtProgress,
  AtTag,
  AtInputNumber,
  AtIcon
} from 'taro-ui'
import './index.scss'
import apis from '../../apis/apis'
export default class Index extends Component {

  config = {
    navigationBarTitleText: '设置ORK'
  }

  constructor(props) {
    super(props)
    this.state = {
      okrTitleOk: false,
      okrTitle: '',
      okrTarget: '',
      deadLine: '无限制',
      openFloat: false,
      krList: [],
      okrList: [],
      showFix: false,
      fixItemIndex: 0,
      myWords : null,
      showMyWords: false
    }
  }

  /**
   * 检测是否设置过标题
   */
  checkOkrTitle = () => {
    let okrTitle = Taro.getStorageSync('okrTitle')
    if(okrTitle) {
      this.setState({
        okrTitleOk: true,
        okrTitle: okrTitle
      })
    }
  }

  /**
   * 标题输入栏变化回调
   * @param value
   */
  onChangeTitleInput = (value) => {
    this.setState({
      okrTitle: value
    })
  }

  /**
   * 目标输入栏变化回调
   * @param value
   */
  onChangeTargetInput = (value) => {
    this.setState({
      okrTarget: value
    })
  }


  /**
   * 时间选择器变化回调
   */
  onDateChange = (e) => {
    this.setState({
      deadLine: e.target.value
    })
  }

  /**
   * 点击添加关键结果按钮
   */
  onClickAddKr = () => {
    Taro.setStorageSync('krList', this.state.krList)
    Taro.navigateTo({
      url: '/pages/krsetting/index?title=' + this.state.okrTitle + '&target=' + this.state.okrTarget
    })
  }

  /**
   * 点击card修改按钮
   * @param index
   * @param e
   */
  onClickFix = (index, e) => {
    if(e._relatedInfo.anchorTargetText === '...' || e._relatedInfo.anchorTargetText === this.state.krList[index].krName) {
      this.setState({
        showFix: true,
        fixItemIndex: index
      })
    }
  }

  /**
   * action 被取消
   */
  onActionCancel = () => {
    this.setState({
      showFix: false
    })
  }

  /**
   *  编辑选项
   */
  onActionEdit = () => {
    if(this.state.fixItemIndex !== null) {
      Taro.setStorageSync('krList', this.state.krList)
      this.setState({
        showFix: false
      })
      Taro.navigateTo({
        url: '/pages/krsetting/index?editIndex='+this.state.fixItemIndex+'&editItem=' + JSON.stringify(this.state.krList[this.state.fixItemIndex])
      })
    }
  }

  /**
   * 删除
   */
  onActionDelete = () => {
    if(this.state.fixItemIndex !== null) {
      this.setState({
        showFix: false
      })
      let tmpList = this.state.krList
      tmpList.splice(this.state.fixItemIndex, 1)
      Taro.setStorageSync('krList', tmpList)
      this.setState({
        krList: tmpList
      })
    }
  }


  /**
   * 设置分享时隐藏
   */
  onActionHide = () => {
    let tmpList = this.state.krList
    tmpList[this.state.fixItemIndex]['hide'] = ! tmpList[this.state.fixItemIndex]['hide']
    this.setState({
      krList: tmpList
    })
  }

  /**
   * 更新进度值
   * @param index
   * @param value
   */
  onFixNowChange = (index, value) => {
    let tmpKrList = this.state.krList
    tmpKrList[index].krNow = value
    Taro.setStorageSync('krList', tmpKrList)
    this.setState({
      krList: tmpKrList,
    })

  }

  onMyWordsChange = (e) => {
    this.setState({
      myWords: e.target.value
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
    apis.openokr_post('setokrlist', {
      'openid': openid,
      okrlist: encodeURIComponent(JSON.stringify(okrlist).toString())
    }, {
      success: (res) => console.log(res),
      fail: (err) => console.log(err),
    })

  }

  componentWillMount () {
    this.checkOkrTitle()
    // 获取所有数据
    let okrList = Taro.getStorageSync('okrList')
    let myWords = Taro.getStorageSync('myWords')
    if(okrList) {
      this.setState({
        myWords: myWords,
        showMyWords: myWords === null
      })
    }
    Taro.setStorageSync('edit', this.$router.params.editTargetIndex !== undefined)
    Taro.setStorageSync('editIndexOkr', this.$router.params.editTargetIndex)
    // 如果是编辑某目标，则提取当前数据
    if(this.$router.params.editTargetIndex !== undefined) {
      this.setState({
        krList: okrList[this.$router.params.editTargetIndex].krList,
        okrTarget: okrList[this.$router.params.editTargetIndex].okrTarget,
        okrDeadLine: okrList[this.$router.params.editTargetIndex].okrDeadLine,
      })
    }
  }

  componentDidMount () { }

  componentWillUnmount () {
    Taro.setStorageSync('okrTitle', this.state.okrTitle)
    Taro.setStorageSync('myWords', this.state.myWords)
    let tmpList = Taro.getStorageSync('okrList')
    console.log(tmpList)
    if(! tmpList) {
      tmpList = []
    }
    let tmp = {
      okrTarget: this.state.okrTarget,
      krList: this.state.krList,
      okrDeadLine: this.state.deadLine
    }
    if(Taro.getStorageSync('edit')) {
      // 修改
      // 如无变化，则不更新列表
      if(JSON.stringify(tmpList[Taro.getStorageSync('editIndexOkr')]).toString() === JSON.stringify(tmp).toString()){
        return
      }
      tmpList.splice(Taro.getStorageSync('editIndexOkr'), 1)
      tmpList.push(tmp)
      Taro.setStorageSync('edit', false)
    } else {
      // 新增
      tmpList.push(tmp)
    }
    Taro.setStorageSync('okrList', tmpList)
    Taro.setStorageSync('updateOkr', true)
    this.uploadOkrList()
  }

  componentDidShow () {
    // 从子页面返回后，更新一次数据
    if(Taro.getStorageSync('updateKr')) {
      let krList = Taro.getStorageSync('krList')
      if(krList) {
        this.setState({
          krList: krList
        })
      }
      Taro.setStorageSync('updateKr', false)
    }
  }

  componentDidHide () {
  }

  render () {
    return (
      <View className='index'>
        <AtInput
          title='规划名称：'
          className='targetInput'
          placeholderStyle='font-size: small; text-align: center;'
          name='title'
          type='text'
          placeholder='为规划设置一个标题，比如, 我的2019 OKR'
          value={this.state.okrTitle}
          onChange={this.onChangeTitleInput}
        />
        {this.state.showMyWords ? (<AtTextarea
          value={this.state.myWords}
          onChange={this.onMyWordsChange}
          maxLength={200}
          placeholder='我的寄语是...'
        />):null}
        <View>
          <AtInput
            className='targetInput'
            title='目标名称：'
            name='target'
            onChange={this.onChangeTargetInput}
            value={this.state.okrTarget}
            placeholderStyle='font-size: small;'
            placeholder='比如，加强锻炼，保持身体健康 ...'
          />
          <View className='deadLineContainer'>
            <Picker mode='date' onChange={this.onDateChange}>
              <AtListItem title='截止时间:' extraText={this.state.deadLine} />
            </Picker>
          </View>
          <AtDivider  content='本目标的关键结果' fontColor='#EA6853' lineColor='#EA6853' fontSize='20' />
          {/*<View className='addIconContainer'>*/}
            {/*<View onClick={this.onClickAddKr}>*/}
              {/*<AtIcon value='add-circle' size='28' color='#04d568'></AtIcon>*/}
            {/*</View>*/}
          {/*</View>*/}
          <View className='krListContainer'>
            <AtList>
              {this.state.krList.map((item, index) => {
                return (
                  <AtCard onClick={this.onClickFix.bind(this, index)} className='krCard' isFull title={item.krName} key={item.krName} note={item.krShowDetail?"截止时间:"+item.krDeadLine + "    目标值:" + item.krTarget + item.krUnit + "    初始值:" + item.krStart + item.krUnit : "无详情信息" } extra='...' thumb='https://junjiancard.manmanqiusuo.com/static/images/producthunt.jpg'>
                    <View className='krCardContainer'>
                      {item.krShowDetail ? (
                        <View className='detailContainer'>
                          <AtTag className='tag' type='primary' size='small'>{item.krUpdateType}更新进度</AtTag>
                          <AtProgress
                            status={(item.krNow-item.krStart)/(item.krTarget-item.krStart)*100 >= 100?'success':'progress'}
                            percent={Math.round((item.krNow-item.krStart)/(item.krTarget-item.krStart)*100)}
                            color={item.krNow/(item.krTarget-item.krStart)*100 > 80 ? '#04d568':'#FF4949'}
                          />
                        </View>
                      ):null}
                      {item.krShowDetail ? (<View className='fixNowContainer'>
                        <AtInputNumber
                          className='fixNowInput'
                          min={0}
                          max={item.krTarget*10}
                          step={1}
                          value={item.krNow}
                          onChange={this.onFixNowChange.bind(this, index)}
                        />
                      </View>): null}
                    </View>
                  </AtCard>
                )
              })}
            </AtList>
          </View>
          <View>
            <AtActionSheet isOpened={this.state.showFix} cancelText='取消' onCancel={this.onActionCancel} onClose={this.onActionCancel}>
              <AtActionSheetItem onClick={this.onActionEdit}>
                编辑该关键结果
              </AtActionSheetItem>
              <AtActionSheetItem onClick={this.onActionHide}>
                {this.state.krList && this.state.krList[this.state.fixItemIndex] && this.state.krList[this.state.fixItemIndex].hide ? "恢复分享时可见" : "设置分享时不可见"}
              </AtActionSheetItem>
              <AtActionSheetItem onClick={this.onActionDelete}>
                删除该关键结果
              </AtActionSheetItem>
            </AtActionSheet>
          </View>
        </View>
        <View className='bottomContainer'>
          <AtButton className='bottomButton' onClick={this.onClickAddKr}>添加关键结果</AtButton>
        </View>
      </View>
    )
  }
}

