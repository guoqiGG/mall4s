<template>
  <view class="my-shop-wrapper">
    <view class="shop-data">
      <view class="bg">
        <image src="/static/images/icon/bg-home.png" />
      </view>
      <!-- 自提点信息 -->
      <view class="data-top">
        <view class="shop-info">
          <view class="shop-icon"><image :src="imgUrl" @error="defImg" /></view>
          <view class="shop-name">{{ stationName }}</view>
          <view class="switch-num" @tap="switchNum">
            <image src="/static/images/icon/handoff.png" />
            <view>切换账号</view>
          </view>
        </view>
      </view>
      <!-- 日/月业绩信息 -->
      <view class="achievement">
        <view class="data-line">
          <view class="data-block">
            <view class="data-cont">{{ dayTurnover.payOrderNumber || 0 }}</view>
            <view class="data-tit">今日订单</view>
          </view>
          <view class="data-block dividing">
            <view class="data-cont">{{ dealNum(dayTurnover.payAmount).res }}<text v-if="dealNum(dayTurnover.payAmount).isW">w</text></view>
            <view class="data-tit">今日交易额</view>
          </view>
          <view class="data-block">
            <view class="data-cont">{{ dealNum(dayTurnover.customerUnitPrice).res }}<text v-if="dealNum(dayTurnover.customerUnitPrice).isW">w</text></view>
            <view class="data-tit">今日客单价</view>
          </view>
        </view>
        <view class="data-line">
          <view class="data-block">
            <view class="data-cont">{{ monthTurnover.payOrderNumber || 0 }}</view>
            <view class="data-tit">本月订单</view>
          </view>
          <view class="data-block dividing">
            <view class="data-cont">{{ dealNum(monthTurnover.payAmount).res }}<text v-if="dealNum(monthTurnover.payAmount).isW">w</text></view>
            <view class="data-tit">本月交易额</view>
          </view>
          <view class="data-block">
            <view class="data-cont">{{ dealNum(monthTurnover.customerUnitPrice).res }}<text v-if="dealNum(monthTurnover.customerUnitPrice).isW">w</text></view>
            <view class="data-tit">本月客单价</view>
          </view>
        </view>
      </view>
    </view>
    <!-- 常见应用 -->
    <view class="commom-app">
      <view class="commom-tit">常见应用</view>
      <view class="app-list">
        <view class="app-item" @tap="toShopAdministration">
          <image src="/static/images/icon/shop-manage.png" />
          <view class="app-name">店铺管理</view>
        </view>
        <view class="app-item" @tap="toOrderAdministration">
          <image src="/static/images/icon/orders.png" />
          <view class="app-name">订单管理</view>
        </view>
        <view class="app-item" @tap="scanCode">
          <image src="/static/images/icon/verification.png" />
          <view class="app-name">验证核销</view>
        </view>
        <view class="app-item" @tap="toBusinessCode">
          <image src="/static/images/icon/merchant-code.png" />
          <view class="app-name">商家码</view>
        </view>
        <view class="app-item" @tap="toPinkCode">
          <image src="/static/images/icon/verification-code.png" />
          <view class="app-name">核销码</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import Wechat from '../../utils/wechat.js'
const util = require('../../utils/util.js')
const http = require('../../utils/http.js')
const config = require('../../utils/config.js')

export default {
  data() {
    return {
      stationName: '',		 // 自提点名称
      imgUrl: '',					 // 自提点logo
      imgPath: '',				 // 自提点logo的path
      dayTurnover: [],		 // 日营业额
      monthTurnover: []		 // 月营业额
    }
  },
  /**
	 * 生命周期函数--监听页面加载
	 */
  onShow: function() {
    this.getIndexData()
  },
  methods: {
    /* 自提点首页数据 */
    getIndexData: function() {
      uni.showLoading()
      const param = {
        url: '/p/station/getStationIndexInfo',
        method: 'GET',
        data: {},
        callBack: res => {
          // 自提点信息赋值
          this.stationName = res.stationName
          this.imgPath = res.pic
          this.imgUrl = res.pic ? config.picDomain + res.pic : '/static/images/icon/normal-bg.png'
          for (var i = 0; i < res.stationSalesDtoList.length; i++) {
            const salesType = res.stationSalesDtoList[i].salesType
            if (salesType == 1) {
              this.dayTurnover = res.stationSalesDtoList[i]
            } else if (salesType == 2) {
              this.monthTurnover = res.stationSalesDtoList[i]
            }
          }
          uni.hideLoading()
        }
      }
      http.request(param)
    },
    /* 切换账号 */
    switchNum: function() {
      // 清除登录缓存
      uni.removeStorageSync('mall4jStationLoginResult')
      uni.removeStorageSync('mall4jStationToken')
      uni.removeStorageSync('mall4jStationHadLogin')
      uni.redirectTo({
        url: '/pages/account-login/account-login'
      })
    },
    /* 跳转店铺管理页 */
    toShopAdministration: function() {
      uni.navigateTo({
        url: '/pages/shop-adminsistration/shop-adminsistration'
      })
    },
    /* 跳转订单管理页 */
    toOrderAdministration: function() {
      uni.navigateTo({
        url: '/pages/order-list/order-list'
      })
    },
    /* 跳转商家码页 */
    toBusinessCode: function() {
      uni.navigateTo({
        url: '/pages/business-code/business-code'
        // url: '/pages/scan-pick/scan-pick'
      })
    },
    /* 跳转提货码取件页 */
    toPinkCode: function() {
      uni.navigateTo({
        url: '/pages/pick-code/pick-code'
      })
    },
    /* 唤醒扫码功能 */
    scanCode: util.debounce(function() {
      // #ifdef H5
      if (!Wechat.isWechat()) {
        uni.showToast({
          title: '请在微信浏览器打开!',
          icon: 'none'
        })
        return
      }
      Wechat.scanQRCode((codeStr) => {
        const code = codeStr.indexOf(',') > -1 ? codeStr.split(',')[1] : codeStr
        // 扫码后跳转核销页面
        uni.navigateTo({
          url: '/pages/scan-pick/scan-pick?pickCode=' + code + '&pageType=1'
        })
      }, () => {
        uni.showToast({
          title: '唤起扫码失败，请稍后重试',
          icon: 'none'
        })
      })
      // #endif
    }, 1000),

    // 单价交易额显示
    dealNum(val) {
      if (!val) return { res: 0, isW: false }
      var res = val
      let isW = false
      if (res >= 100000) {
        isW = true
        res = res / 10000
      }
      res = String(res)
      if (res && res.indexOf('.') > -1 && res.indexOf('.') <= res.length - 3) {
        res = res.slice(0, res.indexOf('.') + 2)
      }
      return { res, isW }
    },

    defImg() {
      this.imgUrl = '/static/images/icon/normal-bg.png'
    }
  }
}
</script>

<style>
@import "./index.css";
</style>
