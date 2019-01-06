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

export default class Index extends Component {

  config = {
    navigationBarTitleText: '设置ORK'
  }

  constructor(props) {
    super(props)
    this.state = {
      okrTitleOk: false,
      okrTitle: '',
      myWords : null,
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


  onMyWordsChange = (e) => {
    this.setState({
      myWords: e.target.value
    })
  }

  componentWillMount () {
    this.checkOkrTitle()
    // 获取所有数据
    let myWords = Taro.getStorageSync('myWords')
    let okrTitle = Taro.getStorageSync('okrTitle')
    this.setState({
      myWords,
      okrTitle
    })
  }

  componentDidMount () { }

  componentWillUnmount () {
    Taro.setStorageSync('okrTitle', this.state.okrTitle)
    Taro.setStorageSync('myWords', this.state.myWords)
  }

  componentDidShow () {
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
        <AtTextarea
          value={this.state.myWords}
          onChange={this.onMyWordsChange}
          maxLength={200}
          placeholder='我的寄语是...'
        />
      </View>
    )
  }
}

