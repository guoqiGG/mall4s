<template>
  <view class="modify-for-station-information">
    <form class="msg-box">
      <view class="msg-tit">
        <view class="shop-icon">
          <image src="/static/images/icon/shop-icon.png" />
        </view>
        <view class="shop-msg-tit">店铺管理</view>
      </view>
      <!-- 自提点名称 -->
      <view class="msg-cont-box">
        <label class="cont-txt">自提点名称</label>
        <input type="text" class="cont-int" :value="stationName" maxlength="50" placeholder="输入自提点名称" @input="bindStationNameInt"></input>
      </view>
      <!-- 自提点图片 -->
      <view class="msg-cont-box">
        <label class="cont-txt">自提点图片</label>
        <!-- 上传文件 -->
        <view class="upload-files align-top">
          <!-- 预览图片 -->
          <view v-if="logoImg.path" class="preview-img-box preview-logo">
            <image class="preview-img" :src="logoImg.url" mode="aspectFill" @error="logoImg.url='/static/images/icon/normal-bg.png'" />
            <!-- 删除 -->
            <image class="preview-img-del" data-type="logoImg" src="/static/images/icon/close2.png" @tap="removeImage" />
          </view>
          <!-- 上传 -->
          <view v-if="!logoImg.path " class="upload-icon upload-logo" data-type="logoImg" @tap="getUploadImg">+</view>
        </view>
        <!-- 上传文件end -->
      </view>
      <!-- /自提点图片 -->
      <!-- 状态 -->
      <view class="msg-cont-box">
        <label class="cont-txt">状态</label>
        <radio-group class="station-status">
          <label class="radio">
            <radio :checked="stationStatus===1" @tap="statusChange(1)" />营业
          </label>
          <label class="radio right-radio">
            <radio :checked="stationStatus===0" @tap="statusChange(0)" />关闭
          </label>
        </radio-group>
      </view>
      <!-- 电话号码 -->
      <view class="msg-cont-box">
        <label class="cont-txt">电话号码</label>
        <input type="number" placeholder="区号" :value="stationOwnerAreaCode" class="cont-left" maxlength="5" @input="bindStationOwnerAreaCodeInt"></input>
        <view class="num-line" />
        <input type="number" placeholder="电话/手机号码" :value="stationOwnerPhoneValue" class="cont-right" maxlength="11" @input="bindStationOwnerPhoneInt"></input>
      </view>
      <!-- 营业时间 -->
      <view class="msg-cont-box">
        <label class="cont-txt">营业时间</label>
        <view class="picker-section">
          <picker mode="time" :value="stationStartTime" @change="bindStartTimeChange">
            <view class="picker">
              开始<text class="station-time">{{ stationStartTime|tsDate }}</text>
            </view>
          </picker>
        </view>
        <view class="picker-section">
          <picker mode="time" :start="stationStartTime" @change="bindEndTimeChange">
            <view class="picker">
              结束<text class="station-time">{{ stationEndTime|tsDate }}</text>
            </view>
          </picker>
        </view>
      </view>
      <!-- 时间间隔 -->
      <view class="msg-cont-box">
        <label class="cont-txt">时间间隔</label>
        <view class="picker-section">
          <picker mode="selector" class="inter-time" :range="interTimeList" @change="bindInterTimeChange">
            <view class="picker">
              {{ interTimeList[interValue-1] }}
            </view>
          </picker>
        </view>
      </view>
      <!-- 提货时间 -->
      <view class="msg-cont-box">
        <label class="cont-txt">提货时间</label>
        <view class="">
          <input type="text" class="cont-day" :value="pickGoodStartTime" @input="bindPickGoodStartTime"></input>
          <text class="text-day">天后开始提货,开始提货</text>
          <input type="text" class="cont-day" :value="pickGoodEndTime" @input="bindPickGoodEndTime"></input>
          <text class="text-day">天后结束提货</text>
        </view>
      </view>
      <!-- 店铺地址 -->
      <view class="msg-cont-box addr" @tap="translate">
        <label class="cont-txt">所在地区</label>
        <!-- 展示 -->
        <view class="pca">{{ province }} {{ city }} {{ area }}</view>
        <view class="arrow">
          <image src="/static/images/icon/more.png" />
        </view>
        <!-- 弹框 -->
        <view class="animation-element-wrapper" :animation="animation" :style="'visibility:' + (show ? 'visible':'hidden')" @tap.stop="hiddenFloatView">
          <view class="animation-element" @tap.stop>
            <text class="right-bt" @tap.stop="hiddenFloatView">确定</text>
            <view class="line" />
            <picker-view indicator-style="height: 50rpx;" :value="value" @change="bindChange" @tap.stop>
              <!--省-->
              <picker-view-column>
                <view v-for="(item, index) in provArray" :key="index">{{ item.areaName }}</view>
              </picker-view-column>
              <!--地级市-->
              <picker-view-column>
                <view v-for="(item, index) in cityArray" :key="index">{{ item.areaName }}</view>
              </picker-view-column>
              <!--区县-->
              <picker-view-column>
                <view v-for="(item, index) in areaArray" :key="index">{{ item.areaName }}</view>
              </picker-view-column>
            </picker-view>
          </view>
        </view>
      </view>
      <!-- 详细地址 -->
      <view class="msg-cont-box">
        <label class="cont-txt">详细地址</label>
        <input type="text" :value="stationAddrValue" class="cont-int" placeholder="填写详细地址" @input="bindStationAddrInt"></input>
      </view>
      <!-- 经纬度(调用微信地图获取) -->
      <view class="msg-cont-box wx-map clearfix">
        <view class="cont-txt">地理位置</view>
        <view v-if="latitude" class="show-location">
          <view>{{ '纬度：' + latitude }}</view>
          <view>{{ '经度：' + longitude }}</view>
        </view>
        <view class="map" @tap="chooseLocation">点击获取位置</view>
      </view>
    </form>
    <!-- 提交申请 -->
    <view class="apply-btn">
      <view class="btn" @tap="submitApply">提交修改</view>
    </view>
  </view>
</template>

<script>
var http = require('../../utils/http.js')
var config = require('../../utils/config.js')
var util = require('../../utils/util.js')
var index = [18, 0, 0]
var t = 0
var show = false
var moveY = 200

export default {
  filters: {
    tsDate: function(value) {
      if (value) {
        try {
          value = value.split(':')
          value.pop()
          return value.join(':')
        } catch {
          return value
        }
      }
      return value
    }
  },
  data() {
    return {
      stationId: 0,									// 自提点Id
      stationStatus: 1,							// 自提点状态  0:关闭 1:营业
      stationName: '',							// 自提点名称
      logoImg: {},									// 自提点logo
      stationOwnerAreaCode: '', // 电话区号
      stationOwnerPhoneValue: '', // 电话/手机号码
      stationStartTime: '',					// 开始营业时间
      stationEndTime: '',						// 打烊的时间
      pickGoodStartTime: '',				// 提货开始时间
      pickGoodEndTime: '',					// 提货结束时间
      interValue: 1,
      interTime: '',
      interTimeList: [],						// 时间间隔几种方式
      value: [0, 0, 0],
      provinceId: 0,
      cityId: 0,
      areaId: 0,
      provArray: [],
      cityArray: [],
      areaArray: [],
      province: '',
      city: '',
      area: '',
      stationAddrValue: '',					// 详细地址
      latitude: '',									// 经度
      longitude: '',								// 纬度
      mapAddress: '',
      // 地图定位详细地址
      mapAddrName: '',
      // 地图上的地址名称
      shopNameValue: '',
      // 店铺名字
      shopDescribeValue: '',
      // 店铺描述
      shopAddrValue: '',
      // 详细地址
      shopOwnerValue: '',
      // 店主姓名
      shopOwnerPhoneValue: '',
      // 店主联系电话
      auditRemarks: '',
      animation: '',
      show: ''
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function(options) {
    this.assigInterTimeList()																				// 时间间隔下拉框列表赋值
    this.getStationInfo()																						// 获取自提点信息
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    // 底部弹框动画
    this.animation = wx.createAnimation({
      transformOrigin: '50% 50%',
      duration: 0,
      timingFunction: 'ease',
      delay: 0
    })
    this.animation.translateY(200 + 'vh').step()
    this.setData({
      animation: this.animation.export(),
      show: show
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {},

  methods: {
    /* 自提点信息 */
    getStationInfo: function() {
      wx.showLoading()
      var param = {
        url: '/p/station/info',
        method: 'GET',
        data: {},
        callBack: async res => {
          const timeDate = JSON.parse(res.timeDate)
          const interval = timeDate.interval ? timeDate.interval : 1
          const stationStartTime = util.formatTime(timeDate.shopTime[0]).split(' ')[1]					// 切割返回的营业时间
          const stationEndTime = util.formatTime(timeDate.shopTime[1]).split(' ')[1]						// 切割返回的打烊时间
          this.stationId = res.stationId
          this.stationName = res.stationName
          this.logoImg.url = config.picDomain + res.pic
          this.logoImg.path = res.pic
          this.stationStatus = res.status
          this.stationOwnerAreaCode = res.phonePrefix
          this.stationOwnerPhoneValue = res.phone
          this.interValue = interval
          this.stationStartTime = stationStartTime
          this.stationEndTime = stationEndTime
          this.pickGoodStartTime = timeDate.stationStartTime
          this.pickGoodEndTime = timeDate.stationEndTime
          this.provinceId = res.provinceId
          this.cityId = res.cityId
          this.areaId = res.areaId
          this.province = res.province
          this.city = res.city
          this.area = res.area
          this.stationAddrValue = res.addr
          this.latitude = res.lat
          this.longitude = res.lng
          wx.hideLoading()
          // 获取地址列表信息
          // const addrList = await this.getAreaListInfo()
          // this.setData({
          //   provArray: addrList
          // })
          this.initCityData(this.provinceId, this.cityId, this.areaId)
        }
      }
      http.request(param)
    },

    /* 改变自提点状态 */
    statusChange: function(v) {
      const stationStatus = v
      this.setData({
        stationStatus
      })
    },

    /**
		 *	给时间间隔下拉框列表赋值
		 */
    assigInterTimeList: function() {
      const interTimeList = ['天', '上下午晚上(12和18点为分界点)', '小时', '半小时']
      this.setData({
        interTimeList
      })
    },

    /**
     * 请求接口传数据
     */
    submitApply: function() {
      if (this.stationName.trim().length < 2) {
        wx.showToast({
          title: '请输入至少两位数字字母汉字组成的自提点名称',
          icon: 'none'
        })
      // } else if (!this.logoImg.url) {
      //   wx.showToast({
      //     title: '请上传自提点图片',
      //     icon: "none"
      //   })
      // } else if (this.stationOwnerAreaCode.trim().length < 3) {
      //   wx.showToast({
      //     title: '请输入正确的固话区号',
      //     icon: "none"
      //   })
      } else if (this.stationOwnerPhoneValue.trim().length == 0) {
        wx.showToast({
          title: '请输入电话号码',
          icon: 'none'
        })
      } else if (!this.stationStartTime || !this.stationEndTime) {
        wx.showToast({
          title: '请选择营业时间',
          icon: 'none'
        })
      } else if (this.stationStartTime == this.stationEndTime) {
        uni.showToast({
          title: '开始时间不能等于结束时间',
          icon: 'none'
        })
      } else if (!util.checkIsNum(this.pickGoodStartTime) || !util.checkIsNum(this.pickGoodEndTime)) {
        wx.showToast({
          title: '请输入正确的提货时间',
          icon: 'none'
        })
      } else if (this.pickGoodStartTime < 0 || this.pickGoodStartTime > 7) {
        wx.showToast({
          title: '自提开始时间只能为0-7天',
          icon: 'none'
        })
      } else if (this.pickGoodEndTime < 1 || this.pickGoodEndTime > 7) {
        wx.showToast({
          title: '自提结束时间只能为1-7天',
          icon: 'none'
        })
      } else if (!this.province && !this.city && !this.area) {
        wx.showToast({
          title: '请选择所在地区',
          icon: 'none'
        })
      } else if (this.stationAddrValue.trim().length < 2) {
        wx.showToast({
          title: '请输入正确的详细地址：不得少于2字',
          icon: 'none'
        })
      } else if (this.latitude == '' && this.longitude == '') {
        wx.showToast({
          title: '请选择地理位置',
          icon: 'none'
        })
      } else {
        let timeDate = {}
        timeDate.shopTime = []
        timeDate.stationStartTime = this.pickGoodStartTime
        timeDate.stationEndTime = this.pickGoodEndTime
        // 获取当前时间的年月日
        const date = new Date()
        const fragTime = util.formatTime(date.getTime()).split(' ')[0]
        timeDate.interval = this.interValue
        timeDate.shopTime[0] = util.dateToTimestamp(fragTime + ' ' + this.stationStartTime)
        timeDate.shopTime[1] = util.dateToTimestamp(fragTime + ' ' + this.stationEndTime)
        timeDate = JSON.stringify(timeDate)

        uni.showLoading()
        var params = {
          url: '/p/station/update',
          method: 'PUT',
          data: {
            stationId: this.stationId,
            stationName: this.stationName,
            pic: this.logoImg.path || '',
            status: this.stationStatus,
            phonePrefix: this.stationOwnerAreaCode,
            phone: this.stationOwnerPhoneValue,
            timeDate: timeDate,
            provinceId: this.provinceId,
            cityId: this.cityId,
            areaId: this.areaId,
            province: this.province,
            city: this.city,
            area: this.area,
            addr: this.stationAddrValue,
            lat: this.latitude,
            lng: this.longitude
          },
          callBack: function(res) {
            uni.hideLoading()
            uni.showToast({
              title: '修改成功',
              icon: 'success'
            })
            setTimeout(() => {
              uni.redirectTo({
                url: '/pages/index/index'
              })
            }, 1500)
          }
        }
        http.request(params)
      }
    },

    getAuditMsg() {
      http.request({
        url: '/p/shop/shopAudit',
        method: 'GET',
        data: {},
        callBack: res => {
          this.setData({
            auditRemarks: res.remarks
          })
        }
      })
    },

    /**
     * 获取经纬度
     */
    chooseLocation: function(e) {
      var that = this
      wx.chooseLocation({
        success: function(res) {
          console.log('succes1')
          console.log(res)
          that.setMapData(res)
        },
        fail: function() {
          wx.getSetting({
            success(res) {
              if (!res.authSetting['scope.userLocation']) {
                console.log('f1')
                wx.authorize({
                  scope: 'scope.userLocation',

                  success() {
                    wx.chooseLocation({
                      success: function(res) {
                        that.setMapData(res)
                      }
                    })
                    console.log('success2')
                  },

                  fail() {
                    wx.showToast({
                      title: '请在「右上角」 - 「关于」 - 「右上角」 - 「设置」授予获取位置信息的权限',
                      icon: 'none'
                    })
                  }

                })
              }
            }

          })
        }
      })
    },

    setMapData(res) {
      var latitude = res.latitude
      var longitude = res.longitude
      var address = res.address
      var name = res.name
      console.log('经度：' + latitude, '纬度：' + longitude, '详细地址：' + address)
      this.setData({
        latitude: latitude,
        longitude: longitude,
        mapAddress: address,
        mapAddrName: name
      })
    },

    /**
     * 获取input数据
     */

    // 获取自提点名称
    bindStationNameInt: function(e) {
      this.setData({
        stationName: e.detail.value
      })
    },
    // 获取区号
    bindStationOwnerAreaCodeInt: function(e) {
      this.setData({
        stationOwnerAreaCode: e.detail.value
      })
    },
    // 获取电话/手机号码
    bindStationOwnerPhoneInt: function(e) {
      this.setData({
        stationOwnerPhoneValue: e.detail.value
      })
    },
    // 获取营业开始时间
    bindStartTimeChange: function(e) {
      console.log('picker发送选择改变，携带值为', e.detail.value)
      const stationStartTime = e.detail.value + ':00'
      this.setData({
        stationStartTime,
        stationEndTime: ''
      })
    },
    // 获取营业结束时间
    bindEndTimeChange: function(e) {
      console.log('picker发送选择改变，携带值为', e.detail.value)
      const stationEndTime = e.detail.value + ':00'
      this.setData({
        stationEndTime
      })
    },
    // 获取时间间隔
    bindInterTimeChange: function(e) {
      console.log('picker发送选择改变，携带值为', e.detail.value)
      const idx = e.detail.value
      this.setData({
        interValue: idx + 1,
        interTime: this.interTimeList[idx]
      })
    },
    // 获取开始提货时间
    bindPickGoodStartTime: function(e) {
      this.setData({
        pickGoodStartTime: e.detail.value
      })
    },
    // 获取结束提货时间
    bindPickGoodEndTime: function(e) {
      this.setData({
        pickGoodEndTime: e.detail.value
      })
    },
    // 详细地址
    bindStationAddrInt: function(e) {
      this.setData({
        stationAddrValue: e.detail.value
      })
    },
    bindShopDescribeInt: function(e) {
      this.setData({
        shopDescribeValue: e.detail.value
      })
    },
    bindShopAddrInt: function(e) {
      this.setData({
        shopAddrValue: e.detail.value
      })
    },
    bindShopOwnerInt: function(e) {
      this.setData({
        shopOwnerValue: e.detail.value
      })
    },
    bindShopOwnerPhoneInt: function(e) {
      this.setData({
        shopOwnerPhoneValue: e.detail.value
      })
    },

    /**
     * 上传图片
     */
    getUploadImg: function(e) {
      const type = e.target.dataset.type
      console.log(type)
      var ths = this
      wx.chooseImage({
        count: 1, // 默认9
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: function(res) {
          // 图片的本地临时文件路径列表
          var tempFilePaths = res.tempFilePaths
          wx.showLoading({
            mask: true
          })
          var params = {
            url: '/p/file/upload',
            filePath: tempFilePaths[0],
            name: 'file',
            callBack: function(res2) {
              wx.hideLoading()
              var img = {}
              img.path = JSON.parse(res2).data.filePath
              img.url = JSON.parse(res2).data.resourcesUrl + JSON.parse(res2).data.filePath

              if (type == 'bussLicenImg') {
                ths.setData({
                  bussLicenImg: img
                })
              } else if (type == 'logoImg') {
                ths.setData({
                  logoImg: img
                })
              } else if (type == 'idcardFrontImg') {
                ths.setData({
                  idcardFrontImg: img
                })
              } else if (type == 'idcardBackImg') {
                ths.setData({
                  idcardBackImg: img
                })
              }
            }
          }
          http.upload(params)
        }
      })
    },

    /**
     * 删除图片
     */
    removeImage: function(e) {
      const type = e.target.dataset.type

      if (type == 'logoImg') {
        this.setData({
          logoImg: {}
        })
      } else if (type == 'idcardFrontImg') {
        this.setData({
          idcardFrontImg: {}
        })
      } else if (type == 'idcardBackImg') {
        this.setData({
          idcardBackImg: {}
        })
      } else if (type == 'bussLicenImg') {
        this.setData({
          bussLicenImg: {}
        })
      }

      console.log('删除图片')
    },
    // 获取地址列表
    getAreaListInfo() {
      return new Promise((resolve, reject) => {
        http.request({
          url: '/p/area/getAreaListInfo',
          method: 'GET',
          data: {},
          callBack: (res) => {
            console.log(res)
            resolve(res)
          }
        })
      })
    },
    // 处理省
    handleProvinceArray(provinceId, cityId, areaId) {
      if (provinceId) {
        for (let index = 0; index < this.provArray.length; index++) {
          if (this.provArray[index].areaId === provinceId) {
            this.setData({
              value: [index, this.value[1], this.value[2]]
            })
          }
        }
      }
      this.handleCityArray(provinceId || this.provArray[0].areaId, cityId, areaId)
    },
    // 处理得到市列表
    handleCityArray(provinceId, cityId, areaId) {
      const res = this.provArray.find(item => item.areaId === provinceId)
      this.setData({
        cityArray: res.areas || []
      })

      if (cityId) {
        for (let index = 0; index < this.cityArray.length; index++) {
          if (this.cityArray[index].areaId === cityId) {
            this.setData({
              value: [this.value[0], index, this.value[2]]
            })
          }
        }
      }
      this.handleAreaArray(cityId || this.cityArray[0].areaId, areaId)
    },
    // 处理得到区列表
    handleAreaArray(cityId, areaId) {
      const res = this.cityArray.find(item => item.areaId === cityId)
      this.setData({
        areaArray: res.areas || []
      })

      if (areaId) {
        for (let index = 0; index < this.areaArray.length; index++) {
          if (this.areaArray[index].areaId === areaId) {
            this.setData({
              value: [this.value[0], this.value[1], index]
            })
          }
        }
      }
    },
    /**
     * 滑动事件
     */
    bindChange: function(e) {
      var ths = this
      var val = e.detail.value // 判断滑动的是第几个column
      // 若省份column做了滑动则定位到地级市和区县第一位
      if (index[0] != val[0]) {
        val[1] = 0
        val[2] = 0 // 更新数据

        ths.getCityArray(this.provArray[val[0]].areaId) // 获取地级市数据
      } else {
        // 若省份column未做滑动，地级市做了滑动则定位区县第一位
        if (index[1] != val[1]) {
          val[2] = 0 // 更新数据

          ths.getAreaArray(this.cityArray[val[1]].areaId) // 获取区县数据
        }
      }

      index = val
      this.setData({
        value: [val[0], val[1], val[2]]
      })
      ths.setData({
        province: ths.provArray[ths.value[0]].areaName,
        city: ths.cityArray[ths.value[1]].areaName,
        area: ths.areaArray[ths.value[2]].areaName,
        provinceId: ths.provArray[ths.value[0]].areaId,
        cityId: ths.cityArray[ths.value[1]].areaId,
        areaId: ths.areaArray[ths.value[2]].areaId
      })
    },
    // 获取当前id下的地址信息
    listAreaByParentId(pid) {
      let paramData = {}
      if (!pid) {
        paramData = { level: 1 }
      } else {
        paramData = { pid }
      }
      return new Promise((resolve, reject) => {
        const params = {
          url: '/p/area/listByPid',
          method: 'GET',
          data: paramData,
          callBack: (res) => {
            console.log('地址信息')
            resolve(res)
          }
        }
        http.request(params)
      })
    },
    // 获取当前节点下的地址
    getCurrentAreas(curList, curId) {
      for (const item of curList) {
        if (item.areaId === curId) {
          return {
            curNode: item,
            areas: item.areas
          }
        }
      }
    },
    /**
     * 获取省市区
     */
    initCityData: async function(provinceId, cityId, areaId) {
      wx.showLoading()
      if (!this.provArray.length) {
        const provArray = await this.listAreaByParentId()
        this.setData({
          provArray
        })
      }

      if (provinceId) {
        for (let i = 0; i < this.provArray.length; i++) {
          if (this.provArray[i].areaId === provinceId) {
            this.setData({
              value: [i, this.value[1], this.value[2]]
            })
          }
        }
      }
      this.getCityArray(provinceId || this.provArray[0].areaId, cityId, areaId)
      wx.hideLoading()
    },

    /**
     * 根据省份ID获取 城市数据
     */
    getCityArray: async function(provinceId, cityId, areaId) {
      const { curNode, areas } = this.getCurrentAreas(this.provArray, provinceId)
      if (areas) {
        this.setData({
          cityArray: areas
        })
      } else {
        console.log('请求市列表')
        const cityArray = await this.listAreaByParentId(provinceId)
        this.setData({
          cityArray
        })
        curNode.areas = cityArray
      }

      if (cityId) {
        for (let i = 0, len = this.cityArray.length; i < len; i++) {
          if (this.cityArray[i].areaId === cityId) {
            this.setData({
              value: [this.value[0], i, this.value[2]]
            })
          }
        }
      }

      this.getAreaArray(cityId || this.cityArray[0].areaId, areaId)
    },

    /**
     * 根据城市ID获取 区数据
     */
    getAreaArray: async function(cityId, areaId) {
      const { curNode, areas } = this.getCurrentAreas(this.cityArray, cityId)
      if (areas) {
        this.setData({
          areaArray: areas
        })
      } else {
        console.log('请求区列表')
        const areaArray = await this.listAreaByParentId(cityId)
        this.setData({
          areaArray
        })
        curNode.areas = areaArray
      }

      if (areaId) {
        for (let i = 0, len = this.areaArray.length; i < len; i++) {
          if (this.areaArray[i].areaId === areaId) {
            this.setData({
              value: [this.value[0], this.value[1], i]
            })
          }
        }
        index = this.value
      }
    },

    /**
     * 移动按钮点击事件
     */
    translate: function(e) {
      if (t == 0) {
        moveY = 0
        show = false
        t = 1
      } else {
        moveY = 200
        show = true
        t = 0
      }

      this.setData({
        show: true
      }) // this.animation.translate(arr[0], arr[1]).step();

      this.animationEvents(this, moveY, show)
    },

    /**
     * 隐藏弹窗浮层
     */
    hiddenFloatView(e) {
      // console.log(e);
      moveY = 200
      show = true
      t = 0
      this.animationEvents(this, moveY, show)
    },

    /**
     * 动画事件
     */
    animationEvents: function(that, moveY, show) {
      // console.log("moveY:" + moveY + "\nshow:" + show);
      that.animation = wx.createAnimation({
        transformOrigin: '50% 50%',
        duration: 400,
        timingFunction: 'ease',
        delay: 0
      })
      that.animation.translateY(moveY + 'vh').step()
      that.setData({
        animation: that.animation.export()
      })
    }
  }
}
</script>

<style>
@import "./shop-adminsistration.css";
</style>

