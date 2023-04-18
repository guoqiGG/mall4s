<template>
  <view class="container">
    <view class="delivery-certificate">
      <view class="address-box item">
        <view class="btn">商家码</view>
      </view>
      <view class="code-det item">
        <view class="bar-code">
          <tki-barcode
            ref="barcode"
            onval
            :val="stationId"
            :load-make="true"
            :opations="barOpations"
          />
        </view>
        <!-- <view class="code-number">自提点id：{{stationId}}</view> -->
        <view class="code">
          <image :src="stationQrCode" />
        </view>
      </view>
      <view class="btn-box">
        扫码一键核销
      </view>
    </view>
  </view>
</template>

<script>
import tkiBarcode from '@/components/tki-barcode/tki-barcode'
const Qr = require('../../utils/wxqrcode.js')
const http = require('../../utils/http.js')

export default {
  components: {
    tkiBarcode
  },
  data() {
    return {
      shopId: '', // 店铺id
      stationId: '', // 自提点id
      stationQrCode: '', // 自提点id码
      barOpations: {
        height: 150,
        displayValue: false
      }
    }
  },
  /**
	 * 生命周期函数--监听页面加载
	 */
  onLoad: function(options) {
    this.getBusCodeInf()
  },
  methods: {
    /* 请求自提点码信息 */
    getBusCodeInf: function() {
      uni.showLoading()
      var param = {
        url: '/p/station/getCode',
        method: 'GET',
        data: {},
        callBack: res => {
          const shopId = res.split('#station#')[0]
          const stationId = res.split('#station#')[1]
          this.shopId = shopId
          this.stationId = stationId
          // 请求到自提点码信息，执行生成二维码函数
          setTimeout(() => {
            this.getQrcode()
          }, 50)
          uni.hideLoading()
        }
      }
      http.request(param)
    },
    /* 生成二维码 */
    getQrcode: function() {
      this.stationQrCode = Qr.createQrCodeImg(this.stationId)
    }
  }
}
</script>

<style>
@import "./business-code.css";
</style>
