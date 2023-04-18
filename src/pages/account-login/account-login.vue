<template>
  <view class="con">
    <view class="logo">
      <image :src="stationLoginLogoImg" mode="heightFix" />
    </view>
    <!-- 登录 -->
    <view v-if="!isForgetPassword" class="login-form">
      <view :class="['item',errorTips==1 && !isForgetPassword? 'error':'']">
        <view class="account">
          <text class="input-item">账号</text>
          <input type="text" data-type="account" placeholder-class="inp-palcehoder" placeholder="请输入账号" @input="getInputVal">
        </view>
        <view v-if="errorTips==1 && !isForgetPassword" class="error-text"><text class="warning-icon">!</text>账号不能为空</view>
      </view>
      <view :class="['item',errorTips==2? 'error':'']">
        <view class="account">
          <text class="input-item">密码</text>
          <input type="password" data-type="password" placeholder-class="inp-palcehoder" placeholder="请输入密码" @input="getInputVal">
        </view>
        <view v-if="errorTips==2" class="error-text"><text class="warning-icon">!</text>请输入密码</view>
      </view>
    </view>

    <view v-if="!isForgetPassword">
      <button class="authorized-btn" @tap="login">登录</button>
    </view>
  </view>
</template>

<script>
var http = require('../../utils/http')
import { encrypt } from '@/utils/crypto'

export default {
  components: {},
  props: {},
  data() {
    return {
      principal: '',
      credentials: '',
      isForgetPassword: false, // 是否修改密码
      isPersonalCenter: false, // 是否从个人中心页面跳转过来
      stationLoginLogoImg: '',
      errorTips: 0 // 错误提示
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (options.isForgetPassword) {
      this.isForgetPassword = options.isForgetPassword
    }
    if (options.isPersonalCenter) {
      this.isPersonalCenter = options.isPersonalCenter
    }
    this.getUniWebConfig()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {},

  /**
		 * 生命周期函数--监听页面卸载
		 */
  onUnload: function() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {},

  methods: {

    /**
     * 初始加载数据
     */
    getUniWebConfig: function() {
      var params = {
        url: '/webConfig/getStationWebConfig',
        method: 'GET',
        data: {},
        callBack: res => {
          const logo = res.stationLoginLogoImg || require('@/static/logo.png')
          this.setData({
            stationLoginLogoImg: logo
          })
          uni.setStorageSync('mall4jStationLoginLogoImg', this.stationLoginLogoImg)
        }
      }
      http.request(params)
    },
    /**
     * 输入框的值
     */
    getInputVal: function(e) {
      const type = e.currentTarget.dataset.type
      if (type == 'account') {
        this.setData({
          principal: e.detail.value
        })
      } else if (type == 'password') {
        this.setData({
          credentials: e.detail.value
        })
      }
    },

    /**
     * 登录
     */
    login() {
      if (!this.principal) {
        this.setData({
          errorTips: 1
        })
        return
      } else if (this.credentials.length == 0) {
        this.setData({
          errorTips: 2
        })
        return
      } else {
        this.setData({
          errorTips: 0
        })
        var params = {
          url: '/stationLogin',
          method: 'POST',
          data: {
            userName: this.principal,
            passWord: encrypt(this.credentials),
            tempUid: uni.getStorageSync('mall4jSTempUid')
          },
          callBack: res => {
            http.loginSuccess(res, () => {
              uni.showToast({
                title: '登录成功!',
                icon: 'none',
                complete() {
                  uni.reLaunch({
                    url: '/pages/index/index'
                  })
                }
              })
            })
          }
        }
        http.request(params)
      }
    },

    /**
     * 修改密码（登录页修改密码按钮）
     */
    forgotPassword() {
      this.setData({
        isForgetPassword: true
      })
    },

    /**
     * 回到首页
     */
    toIndex() {
      wx.navigateTo({
        url: '/pages/index/index'
      })
    }

  }
}
</script>
<style>
	@import "./account-login.css";
</style>
