<template>
  <!--pages/order-detail/order-detail.wxml-->

  <view class="container">
    <view class="order-detail">
      <!-- 订单状态 -->
      <view class="order-status">
        <view class="status-bg"><image src="/static/images/icon/status-bg.png" /></view>
        <view class="status-text">{{ ['','等待买家支付','等待商家发货','等待买家收货','订单已完成','订单已完成','订单已取消','正在拼团中'][status] }}</view>
        <view class="step">
          <view :class="['item',status==2 || status == 3 || (status == 6 && orderItemDtos[0].refundSn) || status==4 || status==5 ? 'active' : '']">
            <view class="select" />
            <view class="des">买家付款</view>
          </view>
          <!-- <view :class="['item',(dvyType == 2 && status==2) || (dvyType != 2 && status==3)?'active':'']">
          <view class="select"></view>
          <view class="des">商家发货</view>
        </view> -->
          <view v-if="dvyType == 2" :class="['item',status==3 || status==4 || status==5 ? 'active' : '']">
            <view class="select" />
            <view class="des">买家提货</view>
          </view>
          <view :class="['item',status==4||status==5?'active':'']">
            <view class="select" />
            <view class="des">交易完成</view>
          </view>
        </view>
      </view>

      <!-- 配送地址 -->
      <!-- <view class="address-box" v-if="dvyType == 1 && userAddrDto">
      <view class="img"><image src="/static/images/icon/addr.png"></image></view>
      <view class="user-info">
        <view class="name">{{userAddrDto.receiver}}</view>
        <view class="phone">{{userAddrDto.mobile}}</view>
      </view>
      <view class="address-detail">{{userAddrDto.province}}{{userAddrDto.city}}{{userAddrDto.area}}{{userAddrDto.area}}{{userAddrDto.addr}}</view>
    </view> -->

      <!-- 自提地址 -->
      <!-- <view class="delivery-certificate" v-if="dvyType == 2">
      <view class="tit">提货凭证</view>
      <view class="address">
        <view class="text">{{stationAddress}}</view>
        <view class="icon-box">
          <view class="icon" @tap="callStation"><image src="/static/images/icon/phone.png"></image></view>
          <view class="icon bl" @tap="openMap"><image src="/static/images/icon/addr.png"></image></view>
        </view>
      </view>
      <view class="code-box no-code" v-if="status == 1">
        <view class="text-box">
          <view class="item">
            <view class="i-lable">提 货 码：</view>
            <view class="i-text fw">{{stationCode?stationCode:'暂无提货码'}}</view>
          </view>
          <view class="item">
            <view class="i-lable">提 货 人：</view>
            <view class="i-text">{{stationUserName+' '+stationUserMobile}}</view>
          </view>
        </view>
      </view>
      <view class="code-box code-det" @tap="viewCertificate"  v-if="status == 2">
        <view class="code">
          <image :src="stationQrCode"></image>
        </view>
        <view class="text-box">
          <view class="item">
            <view class="i-lable">提 货 码：</view>
            <view class="i-text fw">{{stationCode}}</view>
          </view>
          <view class="item">
            <view class="i-lable">提 货 人：</view>
            <view class="i-text">{{stationUserName+' '+stationUserMobile}}</view>
          </view>
          <view class="item">
            <view class="i-lable">预约时间：</view>
            <view class="i-text">{{stationTime}}</view>
          </view>
        </view>
      </view>
    </view> -->

      <!-- 商品信息 -->
      <view class="prod-item">
        <!-- 店铺 -->
        <view class="shop-box">
          <view class="shop-icon"><image src="/static/images/icon/shop.png" /></view>
          <view class="shop-name">{{ shopName }}</view>
          <view v-if="refundStatus !=0" class="refund-sts">
            <!-- refundStatus 订单退款状态 1.申请退款 2.退款完成 3.部分退款完成 4.退款失败 -->
            <text>({{ ['','退款中','退款完成','部分退款','退款关闭'][refundStatus] }})</text>
          </view>
        </view>
        <!-- /店铺 -->
        <view v-for="(item, prodId) in prodList" :key="prodId" class="prod-box">
          <view class="item-cont" :data-prodid="item.prodId" @tap="toProdPage">
            <view class="prod-pic">
              <image v-if="item.pic" :src="item.pic.indexOf('http') === -1 ? picDomain + item.pic : item.pic" />
              <image v-else src="/static/images/icon/def.png" />
            </view>
            <!-- 拼团商品展示icon -->
            <view class="prod-info">
              <view class="prodname">
                <view v-if="orderType" class="a-icon">{{ ['','拼团','秒杀','积分'][orderType] }}</view>
                <view class="text">{{ item.prodName }}</view>
              </view>
              <view class="sku-name">
                <text
                  v-if="orderItemDtos.length === 1 && item.giveawayOrderItemId"
                  class="gift-icon"
                >赠品</text>
                <text>{{ item.skuName }}</text>
              </view>
              <view class="price-nums">
                <view class="prodprice"><text v-if="item.price" class="symbol">￥</text>
                  <text v-if="item.price" class="big-num">{{ wxs.parsePrice(item.price)[0] }}</text>
                  <text v-if="item.price" class="small-num">.{{ wxs.parsePrice(item.price)[1] }}</text>
                  <text v-if="item.price && orderType==3" class="small-num">+</text>
                  <text v-if="orderType==3" class="small-num">{{ item.useScore }} 积分</text>
                </view>
                <view class="number">
                  <text>{{ orderMold == 1 ? totalNum : item.prodCount }}</text>件
                </view>
              </view>
            </view>
          </view>
          <!-- 赠品：多个商品时展示 -->
          <view v-if="orderItemDtos.length > 1 && item.giveawayList && item.giveawayList.length" class="gift-prods">
            <view
              v-for="giftItem in item.giveawayList"
              :key="giftItem.orderItemId"
              class="gift-item"
              @tap="toProdDetail(giftItem.prodId)"
            >
              <text class="name">【赠品】{{ giftItem.prodName }}</text>
              <text class="num">×{{ giftItem.prodCount }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 订单信息 -->
      <view class="order-msg">
        <view class="msg-item">
          <view class="item">
            <text class="item-tit">订单编号：</text>
            <text class="item-txt">{{ orderNumber }}</text>
            <!--  #ifdef  APP-PLUS -->
            <text class="copy-btn" @tap="copyBtn">复制</text>
          <!--  #endif -->
          </view>
          <view class="item">
            <text class="item-tit">下单时间：</text>
            <text class="item-txt">{{ createTime }}</text>
          </view>
        </view>
        <view class="msg-item">
          <view v-if="payType !== null" class="item">
            <text class="item-tit">支付方式：</text>
            <text class="item-txt">{{ ['积分支付','微信支付','支付宝支付','微信支付','微信支付','微信支付','支付宝支付','支付宝支付','微信支付','余额支付','PayPal支付'][payType] }}</text>
          </view>
          <view class="item">
            <text class="item-tit">配送方式：</text>
            <text class="item-txt">{{ ['','卖家配送','到店自提','无需快递'][dvyType] }}</text>
          </view>
          <!-- 全部留言（虚拟商品） -->
          <view v-if="orderMold === 1 && virtualRemarkList.length >= 0" class="item all-msg" @tap="showViewMsgPopup">
            <view class="item-tit">全部留言：</view>
            <view class="item-txt" :class="{'pd': isExtraLong}"><span v-for="(item, index) in virtualRemarkList" :key="index">{{ item[0] }}&nbsp;&nbsp;&nbsp;&nbsp;{{ item[1] }}</span></view>
            <view v-if="isExtraLong" class="more-msg" />
          </view>
        </view>
        <view v-if="remarks" class="msg-item">
          <view class="item">
            <text class="item-tit remarks-tit">订单备注：</text>
            <text class="item-txt remarks-txt">{{ remarks }}</text>
          </view>
        </view>
      </view>

      <!-- 虚拟商品-券码情况 -->
      <view
        v-if="orderMold === 1"
        class="order-msg voucher-code-con"
      >
        <view class="msg-item">
          <view class="item">
            <view class="item-left">
              <view class="txt strong">已使用（{{ totalNum }}张）</view>
              <view class="txt weak flex-item">
                <view class="lf">有效期限：</view>
                <view class="rg">
                  <text v-if="writeOffStart && !writeOffEnd">购买后长期有效</text>
                  <text v-if="writeOffStart && writeOffEnd">{{ writeOffStart }} 至 {{ writeOffEnd }}</text>
                </view>
              </view>
              <view class="txt weak flex-item">
                <view class="lf">核销次数：</view>
                <view class="rg">
                  <text v-if="writeOffNum === -1">多次核销</text>
                  <text v-if="writeOffNum === 1">单次核销</text>
                  <text v-if="writeOffNum === 0">无需核销</text>
                </view>
              </view>
            </view>
          </view>
        </view>
        <!-- 券码列表 -->
        <view v-if="virtualInfoList && virtualInfoList.length" class="msg-item voucher-code-list">
          <view v-for="(item, index) in virtualInfoList" :key="index" class="item" :class="{'used': item.isWriteOff === 1}">
            <view v-if="item.isWriteOff === 1" class="code-row">
              券码<text v-if="virtualInfoList.length > 1">{{ index+1 }}</text>：<text class="code">{{ item.writeOffCode }}</text>
            </view>
            <view v-if="item.isWriteOff === 1" class="tips">已使用</view>
          </view>
        </view>
      </view>

      <view class="order-msg payment">
        <view class="msg-item">
          <view class="item">
            <view class="item-tit">商品总额：</view>
            <view class="item-txt">￥{{ wxs.parsePrice(productTotalAmount)[0] }}.{{ wxs.parsePrice(productTotalAmount)[1] }}</view>
          </view>
          <view v-if="transfee" class="item">
            <view class="item-tit">运费：</view>
            <view class="item-txt">￥{{ wxs.parsePrice(transfee)[0] }}.{{ wxs.parsePrice(transfee)[1] }}</view>
          </view>
          <view v-if="reduceAmount" class="item">
            <view class="item-tit"><text v-if="orderType && orderType!=3" class="item-tit">{{ orderType==1?'团购':'秒杀' }}</text>优惠：</view>
            <view class="item-txt">-￥{{ wxs.parsePrice(reduceAmount)[0] }}.{{ wxs.parsePrice(reduceAmount)[1] }}</view>
          </view>
          <view class="item price">
            <view class="item-txt">
              <!-- <text class="gray">订单总额：</text>
            <text class="symbol" v-if="actualTotal">￥</text>
            <text class="big-num" v-if="actualTotal">{{wxs.parsePrice(actualTotal)[0]}}</text>
            <text class="small-num" v-if="actualTotal">.{{wxs.parsePrice(actualTotal)[1]}}</text>
            <text class="small-num" v-if="actualTotal && orderType==3">+</text>
            <text class="small-num" v-if="orderType==3">{{orderItemDtos[0].useScore}} 积分</text> -->
              <text class="gray">订单总额：</text>
              <text v-if="actualTotal && actualTotal > 0" class="symbol">￥</text>
              <text v-if="actualTotal && actualTotal > 0" class="big-num">{{ wxs.parsePrice(actualTotal)[0] }}</text>
              <text v-if="actualTotal && actualTotal > 0 || actualTotal > 0" class="small-num">.{{ wxs.parsePrice(actualTotal)[1] }}</text>
              <text v-if="(actualTotal && actualTotal > 0) && (orderType==3 || orderScore > 0)" class="small-num">+</text>
              <text v-if="orderType==3 || orderScore > 0" class="big-num">{{ orderScore }} <text class="small-num">积分</text></text>
            </view>
          </view>
        </view>
      </view>

    <!-- 团购底部 -->
    <!-- <view class="order-detail-footer" v-if="orderType==1&& status>1">
      <view class="group-det" @tap="toGroupDetails" :data-ordernumber="orderNumber">查看团购详情</view>
    </view> -->

    </view>

    <!-- 查看留言（虚拟商品） -->
    <view class="popup-hide" :hidden="!showViewMsg">
      <view class="popup-box virtual-goods-msg-pop">
        <view class="con-tit">
          <view class="tit-text">查看留言</view>
          <view class="close" @tap="closeMsgPopup" />
        </view>
        <view class="msg-pop-con">
          <view class="msg-list">
            <view v-for="(item, index) in virtualRemark" :key="index" class="msg-item">
              <view class="item-con weak">{{ item.name }}</view>
              <view class="item-con">{{ item.value }}</view>
            </view>
          </view>
          <view class="pop-foot">
            <view class="foot-btn" @tap="closeMsgPopup">我知道了</view>
          </view>
        </view>
      </view>
    </view>

  </view>
</template>

<script module="wxs" lang="wxs" src="../../wxs/number.wxs"></script>

<script>
// pages/order-detail/order-detail.js
var http = require("../../utils/http.js")
// var qrCode = require("../../utils/weapp-qrcode.js")
import config from "../../utils/config.js";

export default {
  data() {
    return {
      //图片地址
      picDomain: config.picDomain,
      orderItemDtos: [],
      remarks: "",
      actualTotal: 0,
      userAddrDto: null,
      orderNumber: "",
			orderScore: 0, // 整单使用积分
      createTime: "",
      status: 0, // 订单状态 0全部 1待支付 2待发货 3待收货 4待评价 5已完成 6已取消 7拼团中
      productTotalAmount: '',
      transfee: '',
      reduceAmount: '',
      prodid: '',
      orderType: 0,
      shopName: '',
      //店铺名称
      canRefund: false,
      // 能否退款
      canAllRefund: false, // 能否增单退款
      isLastProd: false,  //最后一款商品
      irrevocable: false,  //不可撤销
      sum: [],  //本单已申请单个退款的商品数组
      dvyType: 1, //配送类型 1:快递 2:自提 3：无需快递

      id: 0, // 自提信息id
      stationAddress: '', // 自提点的地址
      stationCode: '', // 提货码
      stationId: 0, // 自提点id
      stationPhone: '', // 自提点的联系电话
      stationTime: '', // 自提时间(用户下单时选择)
      stationUserMobile: '', // 自提人的手机
      stationUserName: '', // 自提人的名字
      stationQrCode: '', // 提货码二维码
      stationName: '', // 自提点名称
      payType: '', // 支付方式

      // 虚拟商品
      orderMold: '', // 订单类型 1虚拟商品
      virtualRemark: [], // 留言
      virtualRemarkList: [],
      virtualInfoList: [], // 券码
      writeOffNum: 0,
      writeOffStart: null,
      writeOffEnd: null,
      isExtraLong: false, // 虚拟商品留言是否超长
      showViewMsg: false, // 查看全部留言弹窗
      totalNum: null, // 已核销的商品总件数

      // 商品列表
      prodList: [],
      // 退款状态
      refundStatus: 0
    };
  },

  components: {},
  props: {},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadOrderDetail(options.orderNum);
    this.refundStatus = options.refundStatus
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

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
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},
  methods: {
    //跳转商品详情页
    toProdPage: function (e) {
      var prodid = e.currentTarget.dataset.prodid;

      if (this.orderType == 3) {
        console.log('积分商品');
        wx.navigateTo({
          url: '/pages/convertProdDet/convertProdDet?prodid=' + prodid
        });
      } else {
        wx.navigateTo({
          url: '/pages/prod/prod?prodid=' + prodid
        });
      }
    },

    /**
     * 加载订单数据
     */
    loadOrderDetail: function (orderNum) {
      wx.showLoading(); //加载订单详情

      var params = {
        url: "/p/myOrder/orderDetail",
        method: "GET",
        data: {
          orderNumber: orderNum
        },
        callBack: res => {
          wx.hideLoading();
          this.setData({
            orderNumber: orderNum,
            actualTotal: res.actualTotal,
            //实际支付总额（商品总额+运费)
            userAddrDto: res.userAddrDto,
            remarks: res.remarks,
            orderItemDtos: res.orderItemDtos,
            createTime: res.createTime,
            status: res.status,
            productTotalAmount: res.total,
            //所有商品总额
            transfee: res.transfee,
            //运费
            reduceAmount: res.reduceAmount,
            orderType: res.orderType,
						orderScore: res.orderScore, // 整单使用积分
            shopName: res.shopName,
            canRefund: res.canRefund,
            canAllRefund: res.canAllRefund,
            dvyType: res.dvyType, // 配送类型 1:快递 2:自提 3：无需快递
            payType: res.payType, // 支付方式
            orderMold: res.orderMold, // 订单类型 1虚拟商品
            virtualInfoList: res.virtualInfoList, // 券码
            virtualRemark: res.virtualRemark ? JSON.parse(res.virtualRemark) : [], // 留言
            writeOffNum: res.writeOffNum, // 核销次数 -1多次 0无需核销 1单次核销
            writeOffStart: res.writeOffStart, // 核销有效期开始时间
            writeOffEnd: res.writeOffEnd, // 核销有效期结束时间（仅有开始时间没有结束时间标识长期有效）
            totalNum: res.totalNum
          });

          if(res.dvyType == 2) {
            this.loadStationDetail(orderNum)
          }

          // 虚拟商品留言处理
          this.handlevirtualRemark()

          this.prodList = res.orderItemDtos
          // 赠品：单个商品时
          if (res.orderItemDtos.length === 1 &&
             res.orderItemDtos[0].giveawayList &&
             res.orderItemDtos[0].giveawayList.length) {
            this.prodList = [...res.orderItemDtos, ...res.orderItemDtos[0].giveawayList]
          }
          console.log('prodList：', this.prodList)
          console.log('orderItemDtos：', this.orderItemDtos)

        },
        errCallBack: err => {
          console.log('err:', err)
					uni.hideLoading()
					this.requestPageError = true
					uni.showModal({
						title: '提示',
						content: err.data,
						showCancel: false,
						confirmText: '确定',
						success: (err) => {
							if (err.confirm) {
								uni.redirectTo({
									url: '/pages/order-list/order-list'
								})
							}
						}
					})
				}
      };
      http.request(params);
    },

    /**
     * 加载订单详情自提信息
     */
    loadStationDetail: function (orderNum) {
      wx.showLoading(); //加载订单详情
      var params = {
        url: "/p/myStationOrder/stationDetail",
        method: "GET",
        data: {
          orderNumber: orderNum
        },
        callBack: (res) => {
          wx.hideLoading();
          this.id = res.id, // 自提信息id
          this.stationAddress = res.stationAddress, // 自提点的地址
          this.stationCode = res.stationCode, // 提货码
          this.stationId = res.stationId, // 自提点id
          this.stationPhone = res. stationPhone, // 自提点的联系电话
          this.stationTime = res.stationTime, // 自提时间(用户下单时选择)
          this.stationUserMobile = res.stationUserMobile, // 自提人的手机
          this.stationUserName = res.stationUserName, // 自提人的名字
          this.stationName = res.stationName // 自提点名称
          // this.getQrcode(this.stationCode)
        }
      };
      http.request(params);
    },

    // 虚拟商品-留言列表处理
    handlevirtualRemark() {
      if (this.virtualRemark && this.virtualRemark.length) {
        // 过滤掉没有填写的留言
        this.virtualRemark = this.virtualRemark.filter(el => el.value)
        let virtualRemarkList = []
        let virtualRemarks = []
        // 如果留言总数大于3条，先展示前一条（完整留言在弹窗中展示）
        if (this.virtualRemark.length > 3) {
          const list = JSON.parse(JSON.stringify(this.virtualRemark))
          virtualRemarks = list.splice(0, 1)
          this.isExtraLong = true
        } else {
          virtualRemarks = this.virtualRemark
          this.isExtraLong = false
        }
        // 全部留言拼接
        virtualRemarks.forEach((el, index) => {
          // if (index < virtualRemarks.length - 1) {
          //   virtualRemarkList = virtualRemarkList + el.name + ' ' + el.value + '，'
          // } else {
          //   virtualRemarkList = virtualRemarkList + el.name + ' ' + el.value
          // }
          virtualRemarkList.push([el.name, el.value])
        })
        if (this.isExtraLong) {
          this.virtualRemarkList = virtualRemarkList.push('......')
        } else {
          this.virtualRemarkList = virtualRemarkList
        }
      }
    },

    // 查看留言弹窗
    showViewMsgPopup: function() {
      if (this.isExtraLong) {
        this.showViewMsg = true
      }
    },
    closeMsgPopup: function() {
      this.showViewMsg = false
    },

    /**
     * 拨打自提点电话
     */
    // callStation: function() {
    //   uni.makePhoneCall({
    //     // 手机号
    //     phoneNumber: this.stationPhone,
    //     // 成功回调
    //     success: (res) => {
    //       console.log('调用成功!')
    //     },
    //     // 失败回调
    //     fail: (res) => {
    //       console.log('调用失败!')
    //     }
    //   });
    // },

    /**
     * 打开地图
     */
    // openMap: function (latitude,longitude,name) {
    //   console.log('打开地图')
    //   uni.getLocation({
    //     // type: 'gcj02', //返回可以用于uni.openLocation的经纬度
    //     success: (res) => {
    //       console.log('成功res',res)
    //       uni.openLocation({
    //           latitude: res.latitude,
    //           longitude: res.longitude,
    //           success: function () {
    //             console.log('success');
    //           }
    //       });
    //     },
    //     fail: () => {
    //       console.log('fail')
    //     }
    //   });
    // },

    /**
     * 生成二维码
     */
    // getQrcode: function(stationCode) {
    //   this.stationQrCode = Qr.createQrCodeImg(stationCode)
    // },

    /* 生成二维码 */
		// getQrcode: function (stationCode) {
		// 	new qrCode('orderQrcode', {
		// 		text: "pages/self-mention-order/self-mention-order?pickCode=" + stationCode,
		// 		width: 70,
		// 		height: 70,
		// 		colorDark: "#333333",
		// 		colorLight: "#FFFFFF",
		// 		correctLevel: qrCode.CorrectLevel.H
		// 	})
		// },

    // #ifdef  APP-PLUS
      /**
       * 一键复制事件
       */
      // 设置系统剪贴板的内容。
      copyBtn () {
        // 除了h5以外都可用的复制方法
        uni.setClipboardData({
          data: this.orderNumber,
          success: function () {
            wx.showToast({
              title: '复制成功',
              icon: 'none',
              duration: 1000
            })
          }
        });
      },
    // #endif

    // 查看提货凭证
    // viewCertificate() {
    //   var cont = {
    //     stationCode: this.stationCode, // 提货码
    //     stationAddress: this.stationAddress, // 自提点的地址
    //     stationPhone: this.stationPhone, // 自提点的联系电话
    //     stationTime: this.stationTime, // 自提时间(用户下单时选择)
    //     orderNumber: this.orderNumber, // 订单编号
    //     stationName: this.stationName
    //   }
    //   uni.setStorageSync('mall4jStationCont', cont)
    //   uni.navigateTo({
    //     url: '/pages/deliveryCertificate/deliveryCertificate'
    //   })
    // },

  }
};
</script>
<style>
@import "./order-detail.css";
</style>
