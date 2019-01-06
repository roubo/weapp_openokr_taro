import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import './index.scss'
import {AtInput, AtSwitch, AtRadio, AtListItem, AtButton} from "taro-ui";
import {Picker} from "../setting";

export default class Index extends Component {

  config = {
    navigationBarTitleText: '新增关键结果'
  }

  constructor(props) {
    super(props)
    this.state = {
      krName: '',
      krDeadLine: '不限制',
      showDetail: false,
      showDetailInfo: false,
      option: 'progressor',
      krTarget: 100,
      krStart: 0,
      krNow: 0,
      krUnit: '个',
      updateSelector: ['每天', '每周', '每月', '每季度'],
      selectorChecked: '每天',
      nameHolder: '比如，跑步800公里'
    }
  }

  /**
   * 关键目标名称输入变化
   * @param value
   */
  onChangeKrNameInput = (value) => {
    this.setState({
      krName: value
    })
  }


  /**
   * 时间选择器变化回调
   */
  onDateChange = (e) => {
    this.setState({
      krDeadLine: e.target.value
    })
  }

  /**
   * switch 切换事件
   */
  onSwitchChange = (value) => {
    this.setState({
      showDetail: value,
      showDetailInfo: value
    })
  }

  /**
   * 点击单选框事件
   * @param value
   */
  onClickRadio = (value) => {
    this.setState({
      option: value
    })
  }

  /**
   * 输入目标值
   * @param value
   */
  onChangeKrTargetInput = (value) => {
    this.setState({
      krTarget: value
    })
  }


  /**
   * 输入初始值
   * @param value
   */
  onChangeKrStartInput = (value) => {
    this.setState({
      krStart: value
    })
  }

  /**
   * 输入已完成值
   * @param value
   */
  onChangeKrNowInput = (value) => {
    this.setState({
      krNow: value
    })
  }

  /**
   * 输入单位值
   * @param value
   */
  onChangeKrUnitInput = (value) => {
    this.setState({
      krUnit: value
    })
  }

  /**
   * 更新时间选择器
   * @param e
   */
  onChangeSelect = (e) => {
    this.setState({
      selectorChecked: this.state.updateSelector[e.detail.value]
    })
  }

  /**
   * 点击取消
   */
  onClickCancel = () => {
    Taro.navigateBack({
      delta: 1
    })
  }

  /**
   * 点击确认
   */
  onClickOk = () => {
    let krList = Taro.getStorageSync('krList')
    if(krList === '') {
      krList = []
    }
    // 如果是编辑操作，则先删除原内容
    if(this.$router.params.editIndex !== undefined) {
      krList.splice(this.$router.params.editIndex, 1)
    }
    krList.push({
        krName: this.state.krName,
        krDeadLine: this.state.krDeadLine,
        krShowDetail: this.state.showDetail,
        krChartType: this.state.showDetail ? this.state.option : 'progressor',
        krTarget: this.state.showDetail ? this.state.krTarget:100,
        krStart: this.state.showDetail ? this.state.krStart:0,
        krNow: this.state.showDetail ? this.state.krNow : 0,
        krUnit: this.state.showDetail ? this.state.krUnit : '个',
        krUpdateType: this.state.showDetail ? this.state.selectorChecked:'每天',
        hide: false
      })
    Taro.setStorageSync('krList', krList)
    Taro.setStorageSync('updateKr', true)
    Taro.navigateBack({
      delta: 1
    })
  }

  componentWillMount () {
    if(this.$router.params.editItem) {
      Taro.setStorageSync('editIndexKr', this.$router.params.editIndex)
      let editItem = JSON.parse(this.$router.params.editItem)
      this.setState({
        krName: editItem.krName,
        krDeadLine: editItem.krDeadLine,
        showDetail: editItem.krShowDetail,
        showDetailInfo: editItem.krShowDetail,
        option: editItem.krChartType,
        krTarget: editItem.krTarget,
        krStart: editItem.krStart,
        krNow: editItem.krNow,
        krUnit: editItem.krUnit,
        selectorChecked: editItem.krUpdateType,
        nameHolder: '',
        hide: editItem.hide
      })
    }
  }

  componentDidMount () { }

  componentWillUnmount () {
    let krList = Taro.getStorageSync('krList')
    if(krList === '') {
      krList = []
    }
    let tmp = {
      krName: this.state.krName,
      krDeadLine: this.state.krDeadLine,
      krShowDetail: this.state.showDetail,
      krChartType: this.state.showDetail ? this.state.option : 'progressor',
      krTarget: this.state.showDetail ? this.state.krTarget:100,
      krStart: this.state.showDetail ? this.state.krStart:0,
      krNow: this.state.showDetail ? this.state.krNow : 0,
      krUnit: this.state.showDetail ? this.state.krUnit : '个',
      krUpdateType: this.state.showDetail ? this.state.selectorChecked:'每天',
      hide: false
    }
    // 如果是编辑操作，则先删除原内容
    if(Taro.getStorageSync('editIndexKr')) {
      // 当未修改任何内容时，则不做列表更新
      if(JSON.stringify(tmp).toString() === JSON.stringify(krList[Taro.getStorageSync('editIndexKr')]).toString()){
        return
      }
      krList.splice(Taro.getStorageSync('editIndexKr'), 1)
    }
    krList.push(tmp)
    Taro.setStorageSync('krList', krList)
    Taro.setStorageSync('updateKr', true)
  }

  componentDidShow () { }

  componentDidHide () { }

  render () {
    return (
      <View className='index'>
        <View>
          <AtInput
            className='krInput'
            type='text'
            title='关键结果：'
            name='krName'
            onChange={this.onChangeKrNameInput}
            value={this.state.krName}
            // placeholderStyle='font-size: small;'
            placeholder={this.state.nameHolder}
          />
          <View className='deadLineContainer'>
            <Picker mode='date' onChange={this.onDateChange}>
              <View>
                <AtListItem title='截止时间：' extraText={this.state.krDeadLine} />
              </View>
            </Picker>
          </View>
          <View className='detailContainer'>
            <AtSwitch style='font-size: medium;' className='switch' color='#04d568' title='打开进度设置' checked={this.state.showDetail} onChange={this.onSwitchChange} />
            {this.state.showDetailInfo === false ? null : (
              <View>
                <View className='radioContainer'>
                  <AtRadio
                    options={[
                      { label: '使用进度条记录进度', value: 'progressor', desc: '适用于不会产生波动进度的场景，比如锻炼的时长' },
                      { label: '使用折线图记录进度', value: 'snaper', desc: '适用于进度会产生波动的场景，比如投资的收益率' },
                    ]}
                    value={this.state.option}
                    onClick={this.onClickRadio}
                    className='radio'
                  />
                </View>
                {this.state.option === 'option1' ? (
                  <View>
                    <AtInput
                      className='krDetailInput'
                      title='目标值：'
                      type='number'
                      name='krTarget'
                      onChange={this.onChangeKrTargetInput}
                      value={this.state.krTarget}
                      placeholderStyle='font-size: small;'
                      placeholder='比如，跑步800公里, 则填写800'
                    />
                    <AtInput
                      className='krDetailInput'
                      title='初始值：'
                      type='number'
                      name='krStart'
                      onChange={this.onChangekrStartInput}
                      value={this.state.krStart}
                      placeholderStyle='font-size: small;'
                      placeholder='比如，已经完成跑步10公里, 则填写10'
                    />
                  </View>
                ) : (
                  <View>
                    <AtInput
                      className='krDetailInput'
                      title='目标值：'
                      type='number'
                      name='krTarget'
                      onChange={this.onChangeKrTargetInput}
                      value={this.state.krTarget}
                      placeholderStyle='font-size: small;'
                      placeholder='比如，跑步800公里, 则填写800'
                    />
                    <AtInput
                      className='krDetailInput'
                      title='初始值：'
                      type='number'
                      name='krStart'
                      onChange={this.onChangeKrStartInput}
                      value={this.state.krStart}
                      placeholderStyle='font-size: small;'
                      placeholder='比如，已经完成跑步10公里, 则填写10'
                    />
                    <AtInput
                      className='krDetailInput'
                      title='已完成：'
                      type='number'
                      name='krNow'
                      onChange={this.onChangeKrNowInput}
                      value={this.state.krNow}
                      placeholderStyle='font-size: small;'
                    />
                    <AtInput
                      className='krDetailInput'
                      title='计量单位：'
                      type='text'
                      name='krUnit'
                      onChange={this.onChangeKrUnitInput}
                      value={this.state.krUnit}
                      placeholder='比如，课程以章节为单位，跑步以公里为单位'
                      placeholderStyle='font-size: small;'
                    />
                    <View className='updatePickerContainer'>
                      <Picker mode='selector' range={this.state.updateSelector} onChange={this.onChangeSelect}>
                        <AtListItem title='更新进度时间:' extraText={this.state.selectorChecked} />
                      </Picker>
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
        {/*<View className='bottomContainer'>*/}
          {/*<AtButton className='bottomButton' onClick={this.onClickCancel}>*/}
            {/*{this.$router.params.editIndex !== undefined ? '取消修改' : '取消添加'}*/}
          {/*</AtButton>*/}
          {/*<AtButton className='bottomButtonOk' onClick={this.onClickOk}>*/}
            {/*{this.$router.params.editIndex !== undefined ? '确认修改' : '确认添加'}*/}
          {/*</AtButton>*/}
        {/*</View>*/}
      </View>
    )
  }
}

