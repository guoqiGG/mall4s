var http = require('./http.js')

// #ifdef H5
var wx = require('./jwx/index.js')
// #endif

var config = require('./config.js')
export default {
  // 判断是否在微信中
  isWechat() {
    var ua = window.navigator.userAgent.toLowerCase()
    if (ua.match(/micromessenger/i) == 'micromessenger') {
      // console.log('是微信客户端')
      return true
    } else {
      // console.log('不是微信客户端')
      return false
    }
  },

  // #ifdef H5
  getWxConfig(cb) {
    var params = {
      url: '/p/wx/jsapi/createJsapiSignature',
      method: 'POST',
      data: window.location.href,
      callBack: data => {
        // 下面要发起微信支付了
        wx.config({
          debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
          appId: config.mpAppId, // 必填，公众号的唯一标识
          timestamp: data.timestamp, // 必填，生成签名的时间戳
          nonceStr: data.nonceStr, // 必填，生成签名的随机串
          signature: data.signature, // 必填，签名，见附录1
          jsApiList: ['chooseWXPay', 'onMenuShareAppMessage', 'scanQRCode'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
        })
        if (cb) {
          cb()
        }
      }
    }
    http.request(params)
  },
  // #endif

  /**
	 * 唤起微信支付
	 * @param {Object} paydata 支付需要的参数
	 * @param {Object} cb 成功回调
	 * @param {Object} errorCb 失败回调
	 */
  callWexinPay(paydata, cb, errorCb) {
    // 获取后台传入的数据
    const appId = paydata.appId
    const timestamp = paydata.timeStamp
    const nonceStr = paydata.nonceStr
    const packages = paydata.packageValue
    const paySign = paydata.paySign
    const signType = paydata.signType

    this.getWxConfig(() => {
      wx.ready(function() {
        console.log(paydata)
        wx.chooseWXPay({
          timestamp: timestamp, // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
          nonceStr: nonceStr, // 支付签名随机串，不长于 32 位
          package: packages, // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=***）
          signType: signType, // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
          paySign: paySign, // 支付签名
          success: function(res) {
            // 支付成功后的回调函数
            cb(res)
          },
          fail: function(res) {
            // 失败回调函数
            errorCb(res)
          }
        })
      })
      wx.error(function(res) {
        // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
        alert('config信息验证失败')
      })
    })
  },

  /**
	 * 唤起微信分享
	 * @param {Object} sharedata 分享需要的参数
	 * @param {Object} cb 成功回调
	 * @param {Object} errorCb 失败回调
	 */
  callWexinShare(sharedata, cb, errorCb) {
    // 获取后台传入的数据
    const appId = sharedata.appId
    const title = sharedata.title
    const link = sharedata.link
    const imgUrl = sharedata.imgUrl
    // let type = sharedata.type
    // let dataUrl = sharedata.dataUrl
    // let desc = sharedata.desc
    console.log('唤起微信分享,sharedata：', sharedata)

    this.getWxConfig(() => {
      wx.ready(function() {
        console.log(sharedata)
        wx.onMenuShareAppMessage({
          title: title, // 分享标题
          link: link, // 分享链接
          imgUrl: imgUrl, // 分享图标
          // desc: desc, // 分享描述
          // type: type, // 分享类型,music、video或link，不填默认为link
          // dataUrl: dataUrl, // 如果type是music或video，则要提供数据链接，默认为空
          success: function(res) {
            // 支付成功后的回调函数
            cb(res)
          },
          fail: function(res) {
            // 失败回调函数
            errorCb(res)
          }
        })
      })
      wx.error(function(res) {
        // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
        alert('config信息验证失败')
      })
    })
  },

  /**
		 * scanQRCode-扫码
		 * @param {Object} cb 成功回调
		 * @param {Object} errorCb 失败回调
		 */
  scanQRCode(cb, errorCb) {
    this.getWxConfig(() => {
      wx.ready(function() {
        wx.scanQRCode({
					    needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
					    scanType: ['qrCode', 'barCode'], // 可以指定扫二维码还是一维码，默认二者都有
					    success: function(res) {
            var result = res.resultStr // 当needResult 为 1 时，扫码返回的结果
            cb(result)
          },
          fail: function(res) {
            // 失败回调函数
            errorCb(res)
          }
        })
      })
      wx.error(function(res) {
        // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
        alert('config信息验证失败res：', res.errMsg)
      })
    })
  }
}

