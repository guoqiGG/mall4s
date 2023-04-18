<template>
  <view class="scan-pick">
    <!-- 提货人信息 -->
    <view v-if="isSelfPickup && (stationAddress || stationTime || stationUserName || stationUserMobile)" class="personal-inf">
      <view class="personal-inf-wrapper">
        <view class="pick-addr line">
          <view class="title">提<text class="fourWord">货</text><text class="fourWord">地</text>点：</view>
          <view class="detail">{{ stationAddress }}</view>
        </view>
        <view class="pick-time line">
          <view class="title">提<text class="fourWord">货</text><text class="fourWord">时</text>间：</view>
          <view class="detail">{{ stationTime[0] }}&nbsp;&nbsp;&nbsp;{{ stationTime[1] }}</view>
        </view>
        <view class="pick-people line">
          <view class="title">提<text class="threeWord">货</text>人：</view>
          <view class="detail">{{ stationUserName }}</view>
        </view>
        <view class="pick-people line">
          <view class="title">提货人号码：</view>
          <view class="detail">{{ stationUserMobile }}</view>
        </view>
      </view>
    </view>
    <!-- 商品信息 -->
    <view v-if="orderList && orderList.length" class="commodity-inf">
      <view class="commodity-inf-wrapper">
        <view class="title">
          <!-- <view class="icon"><image src=""></image></view> -->
          <view class="icon">
            <image src="/static/images/icon/shop.png" />
          </view>
          <view class="font">{{ shopName }}</view>
        </view>
        <view class="prod-box">
          <view v-for="(item, key) in orderList" :key="key" class="item-cont">
            <view v-if="item.returnMoneySts!==5" class="prod-detail">
              <view class="prod-img">
                <image v-if="!item.isPicError" :src="item.pic" @error="handlePicError(item)" />
                <image v-else src="/static/images/icon/def.png" />
              </view>
              <view class="prod-inf">
                <view class="prod-title">{{ item.prodName }}</view>
                <view class="brief">
                  <text v-if="orderItemDtos.length === 1 && item.giveawayOrderItemId" class="gift-icon">赠品</text>
                  <text class="sku-name">{{ item.skuName }}</text>
                </view>
                <view>
                  <!-- <text class="price">￥{{item.price}}</text> -->
                  <text class="num">×{{ item.prodCount }}</text>
                </view>
              </view>
            </view>
            <!-- 赠品：多个商品时展示 -->
            <view v-if="orderItemDtos.length > 1 && item.giveawayList && item.giveawayList.length" class="gift-prods">
              <view
                v-for="giftItem in item.giveawayList"
                :key="giftItem.orderItemId"
                class="gift-item"
              >
                <text class="name">【赠品】{{ giftItem.prodName }}</text>
                <text class="num">×{{ giftItem.prodCount }}</text>
              </view>
            </view>
            <!-- / 赠品 -->
          </view>
        </view>
        <view class="total-box">
          <view class="total">
            <text>共{{ productNums }}件商品，合计：</text>
            <text v-if="actualTotal" class="red">￥{{ actualTotal }}</text><text v-if="useScore&&actualTotal">+</text><text v-if="useScore" class="red">{{ useScore }} 积分</text>
          </view>
        </view>
      </view>
    </view>
    <!-- 券码列表(虚拟商品核销) -->
    <view v-if="!isSelfPickup && orderVirtualInfoList.length" class="virtual-goods-code">
      <view class="code-tit">即将核销（{{ orderVirtualInfoList.length }}张）</view>
      <view class="code-list">
        <view class="code-item date weak">
          <view class="lf">有效期限：</view>
          <view class="rg">
            <text v-if="writeOffStart && !writeOffEnd">永久有效</text>
            <text v-if="writeOffStart && writeOffEnd">{{ writeOffStart }} 至 {{ writeOffEnd }}</text>
          </view>
        </view>
        <view class="code-item date weak">
          <view class="lf">核销次数：</view>
          <view class="rg">
            <text v-if="writeOffNum === -1">多次核销</text>
            <text v-if="writeOffNum === 1">单次核销</text>
            <text v-if="writeOffNum === 0">无需核销</text>
          </view>
        </view>
      </view>
      <view class="code-list code-box">
        <view v-for="(item,index) in orderVirtualInfoList" :key="index" class="code-item">
          券码<text v-if="orderVirtualInfoList.length > 1">{{ index+1 }}</text>：
          <text>{{ item.writeOffCode }}</text>
        </view>
      </view>
    </view>
    <!-- 全部留言(虚拟商品核销) -->
    <view v-if="!isSelfPickup && virtualRemark && virtualRemark.length" class="virtual-goods-code">
      <view class="code-tit">全部留言</view>
      <view class="code-list">
        <view v-for="(item,index) in virtualRemark" :key="index" class="code-item weak">
          {{ item.name }}&nbsp;&nbsp;&nbsp;&nbsp;{{ item.value }}
        </view>
      </view>
    </view>
    <!-- 订单备注 -->
    <view v-if="remarks" class="order-remarks">
      <text class="remarks-title">订单备注：</text>
      <text class="remarks-txt">{{ remarks }}</text>
    </view>
    <!-- 提货按钮 -->
    <view v-if="!requestPageError" class="pick-btn" @tap="pickGood">
      {{ isSelfPickup ? '确认取件' : '确认核销' }}
    </view>
  </view>
</template>

<script>
const http = require('../../utils/http.js')

export default {
  data() {
    return {
      pickCode: '',							// 提货码
      shopName: '',							// 店铺名称
      status: '',								// 订单状态	1:待付款 2:待发货 3:待收货 4:待评价 5:成功 6:失败
      orderNumber: '',					// 订单号
      stationUserName: '',			// 提货人名字
      stationUserMobile: '', // 提货人号码
      stationTime: '',					// 提货时间
      stationAddress: '',				// 提货地点
      productNums: 0,						// 订单商品总件数
      actualTotal: 0,						// 订单总价
      useScore: 0, // 积分
      orderList: [],						// 订单的商品列表
      remarks: '',							// 订单备注
      orderType: 0, // 订单类型(0普通订单 1团购订单 2秒杀订单)

      pageType: 1, // 1扫码 2手动输入核销码

      // 是否自提
      isSelfPickup: true,

      // 虚拟商品
      orderVirtualInfoList: [],
      // 虚拟商品-全部留言
      virtualRemark: [],
      // 核销有效期
      writeOffStart: null,
      writeOffEnd: null,
      // 核销次数 -1多次 1单次 0无需
      writeOffNum: 0,

      // 是否成功请求页面数据
      requestPageError: true,

      timer: '',

      orderItemDtos: []
    }
  },
  /* 生命周期函数--监听页面加载 */
  onLoad: function(options) {
    // 拿到扫码得到的提货码
    const pickCode = options.pickCode
    if (pickCode) {
      this.setData({
        pickCode
      })
    }
    // 进入页面类型：1扫码进入 2输入核销码进入
    this.pageType = Number(options.pageType)
  },
  /* 生命周期函数--监听页面显示 */
  onShow: function() {
    this.getPickGoodInf()
  },
  methods: {
    /**
		 * 获取核销码信息
		 */
    getPickGoodInf() {
      uni.showLoading()
      var param = {
        url: '/p/station/getStationOrderByCode',
        method: 'GET',
        data:	{
          code: this.pickCode
        },
        callBack: res => {
          // console.log(res)
          if (Object.keys(res).length > 0) {
            // 自提
            if (res.orderSelfStationDto) {
              this.setData({
                stationUserName: res.orderSelfStationDto.stationUserName,
                stationUserMobile: res.orderSelfStationDto.stationUserMobile,
                stationAddress: res.orderSelfStationDto.stationAddress,
                stationTime: res.orderSelfStationDto.stationTime.split(' ')
              })
              this.isSelfPickup = true
            }
            // 虚拟商品核销
            if (res.orderVirtualInfoList) {
              this.isSelfPickup = false
              this.setData({
                orderVirtualInfoList: res.orderVirtualInfoList,
                virtualRemark: res.virtualRemark ? JSON.parse(res.virtualRemark) : [],
                writeOffStart: res.writeOffStart,
                writeOffEnd: res.writeOffEnd,
                writeOffNum: parseInt(res.writeOffNum)
              })
              if (this.virtualRemark && this.virtualRemark.length) {
                this.virtualRemark = this.virtualRemark.filter(el => el.value)
              }
              // 处理从输入核销码页面输入订单号进入的情况
              if (!this.orderVirtualInfoList.find(el => el.writeOffCode == this.pickCode) &&
									this.pickCode == res.orderNumber &&
									this.pageType == 2) {
                this.pageType = 1
              }
            }
            let useScore = 0
            res.orderItemDtos.forEach(item => {
              useScore += item.useScore
            })
            this.setData({
              shopName: res.shopName,
              status: res.status,
              orderNumber: res.orderNumber,
              productNums: res.productNums,
              actualTotal: res.actualTotal,
              orderItemDtos: res.orderItemDtos,
              remarks: res.remarks,
              orderType: res.orderType,
              useScore: useScore
            })
            this.requestPageError = false

            this.orderList = res.orderItemDtos
            // 处理单个商品时，有赠品的商品列表
            if (res.orderItemDtos &&
                res.orderItemDtos.length === 1 &&
								res.orderItemDtos[0].giveawayList &&
								res.orderItemDtos[0].giveawayList.length
            ) {
              this.orderList = [...res.orderItemDtos, ...res.orderItemDtos[0].giveawayList]
            }
          } else {
            this.requestPageError = true
            uni.showModal({
              title: '提示',
              content: '没有该货物信息，请确认登录账号是否正确',
              showCancel: false,
              confirmText: '确定',
              success: (res) => {
                if (res.confirm) {
                  uni.redirectTo({
                    url: '/pages/index/index'
                  })
                }
              }
            })
          }
          uni.hideLoading()
        },
        errCallBack: res => {
          uni.hideLoading()
          this.requestPageError = true
          uni.showModal({
            title: '提示',
            content: res.data.msg,
            showCancel: false,
            confirmText: '确定',
            success: (res) => {
              if (res.confirm) {
                uni.redirectTo({
                  url: '/pages/index/index'
                })
              }
            }
          })
        }
      }
      http.request(param)
    },

    /**
		 * 确认核销
		 */
    pickGood: function() {
      if (this.requestPageError) {
        return
      }
      const isSelfPickup = this.isSelfPickup
      const status = this.status
      let title = ''
      // 1、自提商品购买后取货前状态是status==2
      // 2、虚拟商品购买后核销前状态是status==3(确认收货即状态5已完成，未核销的券码仍然可以核销)
      if ((isSelfPickup && status == 2) || (!isSelfPickup && (status == 3 || status == 5))) {
        const url = isSelfPickup ? '/p/station/orderStationByOrderNumber' : '/p/station/orderWriteOffByOrderNumber'
        const code = isSelfPickup ? this.orderNumber : { orderNumber: this.orderNumber }
        // 虚拟商品输入核销码核销单个券码时再传writeOffCode，扫码进入无需传writeOffCode
        if (this.pageType == 2 && !isSelfPickup) { code.writeOffCode = this.pickCode }
        var param = {
          url: url,
          method: 'PUT',
          data: code,
          callBack: res => {
            uni.showToast({
              title: isSelfPickup ? '取件成功' : '核销成功',
              icon: 'success'
            })
            this.timer = setTimeout(() => {
              uni.redirectTo({
                url: '/pages/index/index'
              })
            }, 800)
            uni.hideLoading()
          },
          errCallBack: err => {
            console.log('失败err:', err)
            uni.showToast({
              title: err.data.msg,
              icon: 'none'
            })
            uni.hideLoading()
          }
        }
        uni.showModal({
          title: '提示',
          content: isSelfPickup ? '是否确认取件' : '是否确认核销',
          cancelText: '取消',
          confirmText: '确定',
          success: (res) => {
            if (res.confirm) {
              uni.showLoading()
              http.request(param)
            }
          }
        })
      } else {
        if (status == 1) {
          title = isSelfPickup ? '订单待支付,请支付后再来取货' : '订单待支付,请先完成支付'
        } else if ((isSelfPickup && (status == 3 || status == 5)) || status == 4) {
          title = isSelfPickup ? '订单已取货' : '订单已核销'
        } else if (status == 6) {
          title = '订单已取消'
        } else if (status == 7) {
          title = '订单未成团，不支持核销'
        }
        uni.showModal({
          title: '提示',
          content: title,
          showCancel: false,
          confirmText: '确定',
          success: (res) => {
            if (res.confirm) {
              uni.redirectTo({
                url: '/pages/index/index'
              })
            }
          }
        })
      }
    },

    /**
     * 图片加载失败时显示默认图片
     */
    handlePicError(item) {
      // console.log(1231231)
      this.$set(item, 'isPicError', true)
    }
  },

  onUnload() {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }
}
</script>

<style>
		@import "./scan-pick.css";
</style>
