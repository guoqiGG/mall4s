<template>
  <view class="self-delivery-order">
    <!-- 订单信息 -->
    <view class="order-info layout-block">
      <view class="block-line">
        <view class="line-left">提货地点：</view>
        <view class="line-right">广东省广州市番禺区青蓝街22号国家数字基地B栋</view>
      </view>
      <view class="block-line">
        <view class="line-left">提货时间：</view>
        <view class="line-right">2020年05月19日 17:00-18:00</view>
      </view>
      <view class="block-line">
        <view class="line-left">提货人：</view>
        <view class="line-right">石榴姐 12345678910</view>
      </view>
      <view class="block-line">
        <view class="line-left">支付方式：</view>
        <view class="line-right">微信支付</view>
      </view>
    </view>
    <!-- 订单商品信息 -->
    <view class="order-prod-info layout-block">
      <view class="shop-info">
        <image src="/static/images/icon/shop.png" />
        <view class="shop-name">亚米官方旗舰店</view>
      </view>
      <view v-for="(item,index) in prodList" :key="index" class="block-line">
        <view class="line-left">
          <image src="" />
        </view>
        <view class="line-right">
          <view class="prod-name">{{ item.prodName }}</view>
          <view class="prod-sku">{{ item.prodSku }}</view>
          <view class="prod-num">
            <view class="prod-price"><text class="symbol">￥</text>{{ item.price }}</view>
            <view class="prod-qua">×{{ item.num }}</view>
          </view>
        </view>
      </view>
      <view class="bottom-total">共1件商品，合计：<text class="red-pri">￥355.00</text></view>
    </view>
    <!-- 订单备注 -->
    <view class="order-remarks layout-block">
      <view class="block-line">
        <view class="line-left">订单备注：</view>
        <view class="line-right">暂无备注留言</view>
      </view>
    </view>
  </view>
</template>

<script module="wxs" lang="wxs" src="../../wxs/number.wxs"></script>

<script>
var http = require("../../utils/http.js");
var config = require("../../utils/config.js");

export default {
  data () {
    return {
      prodList: [
        {
          prodName: '【全新上市】纪梵希绒雾柔焦棒隐匿毛孔抑制油光细腻哑光妆效',
          prodSku:'绒雾柔焦棒',
          price: '355.00',
          num: '1'
        },
        {
          prodName: '【全新上市】纪梵希绒雾柔焦棒隐匿毛孔抑制油光细腻哑光妆效',
          prodSku:'绒雾柔焦棒',
          price: '355.00',
          num: '1'
        },
        {
          prodName: '【全新上市】纪梵希绒雾柔焦棒隐匿毛孔抑制油光细腻哑光妆效',
          prodSku:'绒雾柔焦棒',
          price: '355.00',
          num: '1'
        },
        {
          prodName: '【全新上市】纪梵希绒雾柔焦棒隐匿毛孔抑制油光细腻哑光妆效',
          prodSku:'绒雾柔焦棒',
          price: '355.00',
          num: '1'
        },
      ]
    };
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  methods: {

  }

}

</script>

<style>
@import "./self-mention-order.css";
</style>
