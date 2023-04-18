<template>
  <view class="con-wrapper">
    <view class="title">输入核销码</view>
    <view class="inp-wrapper">
      <input class="input" :value="code" placeholder="请输入核销码" @input="pinkCodeInp">
      <view class="sub-btn" @tap="toScanPick">确定</view>
    </view>
  </view>
</template>

<script>
const util = require('../../utils/util.js')

export default {
  data() {
    return {
      code: ''
    }
  },
  /**
	 * 生命周期函数--监听页面加载
	 */
  onShow: function() {
  },
  methods: {
    /* 跳转到取件页面 */
    toScanPick: function() {
      if (this.code == '') {
        wx.showToast({
          title: '请输入核销码',
          icon: 'none'
        })
      } else if (!util.checkIsVerification(this.code)) {
        this.code = ''
        wx.showToast({
          title: '请输入正确的核销码',
          icon: 'none'
        })
      } else {
        const code = this.code
        // 扫码后跳转核销页面
        uni.navigateTo({
          url: '/pages/scan-pick/scan-pick?pickCode=' + code + '&pageType=2'
        })
      }
    },
    // 获取提货码
    pinkCodeInp: function(e) {
      this.code = e.detail.value
    }
  }
}
</script>

<style>
@import "./pick-code.css";
</style>
