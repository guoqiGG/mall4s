<template>
  <!-- pages/order-list/order-list.wxml -->
  <view class="container">
    <!-- 头部菜单 -->
    <view class="order-tit">
      <text data-sts="0" :class="sts==0?'on':''" @tap="onStsTap">全部</text>
      <text data-sts="1" :class="sts==1?'on':''" @tap="onStsTap">待付款</text>
      <text data-sts="2" :class="sts==2?'on':''" @tap="onStsTap">待发货</text>
      <text data-sts="3" :class="sts==3?'on':''" @tap="onStsTap">待收货</text>
      <text data-sts="5" :class="sts==5?'on':''" @tap="onStsTap">已完成</text>
    </view>
    <!-- end 头部菜单 -->
    <view class="main">
      <!-- <view class="empty" wx:if="{{list.length==0}}">这里还没有相关订单~</view> -->
      <!-- 订单列表 -->
      <block v-for="(item, orderNumber) in list" :key="orderNumber">
        <view class="prod-item">
          <!-- 店铺 -->
          <view class="shop-box">
            <view class="shop-icon">
              <image src="/static/images/icon/shop.png" />
            </view>
            <view class="shop-name">{{ item.shopName }}</view>
          </view>
          <!-- 订单编号 -->
          <view class="order-num">
            <text>订单编号：{{ item.orderNumber }}</text>
            <view class="order-state">
              <text :class="['order-sts' , {red: (item.status < 5) }]">{{ ['','待付款','待发货','待收货','待评价','已完成','已取消','拼团中'][item.status] }}</text>
            </view>
            <view v-if="item.refundStatus" class="order-state red">
              <!-- refundStatus 订单退款状态 1.申请退款 2.退款完成 3.部分退款完成 4.退款失败 -->
              <text>({{ ['','退款中','退款完成','部分退款','退款关闭'][item.refundStatus] }})</text>
            </view>
          </view>
          <!-- 商品列表 -->
          <!-- 一个订单单个商品的显示 -->
          <block v-if="item.orderItemDtos.length==1">
            <block v-for="(prod, prodId) in item.orderItemDtos" :key="prodId">
              <view class="item-cont" @tap="toOrderDetailPage(item.orderNumber, item.refundStatus)">
                <view class="prod-pic">
                  <image v-if="prod.pic" :src="prod.pic" />
                  <image v-else src="/static/images/icon/def.png" />
                </view>
                <view class="prod-info">
                  <view class="prodname">{{ prod.prodName }}</view>
                  <view class="prod-info-cont">{{ prod.skuName }}</view>
                  <view class="price-nums">
                    <text class="prodprice">
                      <text v-if="prod.price" class="symbol">￥</text>
                      <text v-if="prod.price" class="big-num">{{ wxs.parsePrice(prod.price)[0] }}</text>
                      <text v-if="prod.price" class="small-num">.{{ wxs.parsePrice(prod.price)[1] }}</text>
                      <text v-if="prod.price && item.orderType==3" class="small-num" decode="true">&emsp;+&emsp;</text>
                      <text v-if="prod.useScore && item.orderType==3" class="small-num">{{ prod.useScore }} 积分</text>
                    </text>
                    <text class="prodcount">× {{ prod.prodCount }}</text>
                  </view>
                </view>
              </view>
            </block>
          </block>
          <!-- 一个订单多个商品时的显示 -->
          <block v-else>
            <view class="item-cont" @tap="toOrderDetailPage(item.orderNumber, item.refundStatus)">
              <scroll-view scroll-x="true" scroll-left="0" scroll-with-animation="false" class="categories">
                <block v-for="(prod, prodId) in item.orderItemDtos" :key="prodId">
                  <view class="prod-pic">
                    <image v-if="prod.pic" :src="prod.pic" />
                    <image v-else src="/static/images/icon/def.png" />
                  </view>
                </block>
              </scroll-view>
            </view>
          </block>
          <view class="total-num">
            <view v-if="item.orderType" class="spell-group-icon">
              <!-- orderType 订单类型(0普通订单 1团购订单 2秒杀订单) -->
              {{ ['','拼团','秒杀','积分'][item.orderType] }}
            </view>
            <view v-if="item.orderMold == 1" class="spell-group-icon">虚拟</view>
            <!-- <view class="spell-group-icon">自提</view> -->
            <view class="right">
              <view class="prodcount">共 {{ item.productNums }} 件商品</view>
              <view class="prodprice">合计：
                <text v-if="item.actualTotal" class="symbol">￥</text>
                <text v-if="item.actualTotal" class="big-num">{{ wxs.parsePrice(item.actualTotal)[0] }}</text>
                <text v-if="item.actualTotal" class="small-num">.{{ wxs.parsePrice(item.actualTotal)[1] }}</text>
                <text v-if="(item.actualTotal && item.actualTotal > 0) && (item.orderType==3 || item.orderToataluseScore > 0)" class="small-num">+</text>
                <text v-if="item.orderType==3 || item.orderToataluseScore > 0" class="small-num">{{ item.orderToataluseScore }} 积分</text>
              </view>
            </view>
          </view>
        <!-- end 商品列表 -->
        <!-- <view class="prod-foot" v-if="item.status == 1 || item.status == 2 || item.status == 3 || item.status==5 || (item.status==5 && item.orderItemDtos[0].commSts==0)"> -->
        <!-- <view class="prod-foot" v-if="item.status == 2"> -->
          <!-- <view class="btn"> -->
          <!-- <text v-if="item.status==2" class="button warn" @tap="pickGood" :data-ordernum="item.orderNumber" hover-class="none">提货</text> -->
          <!-- </view> -->
        <!-- </view> -->
        </view>
      </block>
    </view>

    <view v-show="isLoaded">
      <!-- 到底了~ -->
      <view v-if="list.length > 10 && loadAll" class="loadall">已加载全部数据</view>

      <!-- 空 -->
      <view v-if="!list.length" class="empty">
        <view class="empty-icon">
          <image src="/static/images/icon/empty.png" />
        </view>
        <view class="empty-text">这里还没有相关订单~</view>
      </view>
    </view>

  </view>
<!-- end 订单列表 -->
</template>

<script module="wxs" lang="wxs" src="../../wxs/number.wxs"></script>

<script>
var http = require("../../utils/http.js");
var config = require("../../utils/config.js");
export default {
  data() {
    return {
      list: [],
      current: 1,
      pages: 0,
      sts: 0,
      endTime: '',  //订单过期时间
      loadAll: false,// 已加载全部
      isLoaded:false
    };
  },

  components: {},
  props: {},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.sts) {
      this.setData({
        sts: options.sts
      });
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.loadOrderData(this.sts, 1);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.current < this.pages) {
			this.loadOrderData(this.sts, this.current + 1);
		} else {
			this.setData({
				loadAll: true
			})
		}
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},
  methods: {
    /**
     * 加载订单数据
     */
    loadOrderData: function (sts, current) {
      var ths = this;
      wx.showLoading(); //加载订单列表
      this.isLoaded = false

      var params = {
        url: "/p/station/orderListByStatus",
        method: "GET",
        data: {
          current: current,
          size: 10,
          status: sts
        },
        callBack: function (res) {
					res.records.forEach(order=> {
						order.orderToataluseScore = 0
						order.orderItemDtos.forEach(orderItem=> {
							if (orderItem.useScore) {
								order.orderToataluseScore += orderItem.useScore
							}
						})
					})
          var list = [];
					if (res.current == 1) {
						list = res.records;
					} else {
						list = ths.list.concat(res.records)
					}
					ths.setData({
						list: list,
						pages: res.pages,
						current: res.current,
					});
          wx.hideLoading();
          ths.isLoaded = true
        },
      };
      http.request(params);
    },

    /**
     * 状态点击事件
     */
    onStsTap: function (e) {
      var sts = e.currentTarget.dataset.sts;
      this.setData({
        sts: sts
      });
      this.loadOrderData(sts, 1);
    },

		/**
     * 跳转提货页面
     */
		pickGood: function (e) {
			let orderNum = e.currentTarget.dataset.ordernum
			let ths = this
			wx.showModal({
        title: '',
        content: '确认取货？',
        confirmColor: "#3e62ad",
        cancelColor: "#3e62ad",
        cancelText: '否',
        confirmText: '是',
        success(res) {
          if (res.confirm) {
						wx.showLoading()
						var param = {
							url: "/p/station/orderStationByOrderNumber",
							method: "PUT",
							data: this.orderNumber,
							callBack: res => {
								ths.loadOrderData(ths.sts, 1)
								wx.hideLoading()
							}
						}
						http.request(param)
          } else if (res.cancel) {}
        }
			})
		},

    /**
     * 查看订单详情
     */
    toOrderDetailPage: function (orderNum, refundStatus) {
      let sts = refundStatus ? refundStatus : 0
      wx.navigateTo({
        url: '/pages/order-detail/order-detail?orderNum=' + orderNum + '&refundStatus=' + sts
      })
    }
  }
};
</script>
<style>
@import "./order-list.css";
</style>
