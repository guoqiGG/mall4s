var config = require('./config.js') // 统一的网络请求方法
import {
  AppType
} from './constant.js'

function request(params, isGetTonken) {
  // 全局变量
  if (Object.prototype.toString.call(params.data) == '[object Array]') {
    params.data = JSON.stringify(params.data)
  } else if (Object.prototype.toString.call(params.data) == '[object Number]') {
    params.data = params.data + ''
  }

  uni.request({
    url: config.domain + params.url,
    // 接口请求地址
    data: params.data,
    header: {
      // 'content-type': params.method == "GET" ? 'application/x-www-form-urlencoded' : 'application/json;charset=utf-8',
      'Authorization': params.login ? undefined : uni.getStorageSync('mall4jStationToken')
    },
    method: params.method == undefined ? 'POST' : params.method,
    dataType: 'json',
    responseType: params.responseType == undefined ? 'text' : params.responseType,
    success: (res) => {
      const responseData = res.data
      if (responseData.code === '00000') {
        if (params.callBack) {
          params.callBack(responseData.data)
        }
      } else if (responseData.code === 'A00005') {
        uni.hideLoading()
        setTimeout(() => {
          uni.showToast({
            title: '服务器出了点小差',
            icon: 'none'
          })
        }, 1)
      } else if (responseData.code === 'A00004') {
        uni.removeStorageSync('mall4jStationLoginResult')
        uni.removeStorageSync('mall4jStationToken')
        uni.hideLoading()
        if (!params.dontTrunLogin) {
          if (uni.getStorageSync('mall4jHadLogin')) {
            uni.showModal({
              title: '提示',
              content: '登录已过期，请重新登陆！',
              success: res => {
                if (res.confirm) {
                  // 跳转登录页面
                  uni.redirectTo({
                    url: '/pages/account-login/account-login'
                  })
                } else {
                  uni.navigateTo({
                    url: '/pages/index/index'
                  })
                }
              }
            })
          } else {
            // 跳转登录页面
            uni.navigateTo({
              url: '/pages/account-login/account-login'
            })
          }
        }
      } else if (responseData.code === 'A00001' && !params.errCallBack) {
        uni.hideLoading()
        setTimeout(() => {
          uni.showToast({
            title: res.data.msg,
            icon: 'none'
          })
        }, 1)
      } else {
        if (params.errCallBack) {
          params.errCallBack(res)
        }
        uni.hideLoading()
      }
    },
    fail: function() {
      uni.hideLoading()
      setTimeout(() => {
        uni.showToast({
          title: '服务器出了点小差',
          icon: 'none'
        })
      }, 1)
    }
  })
}

/**
 * 上传文件统一接口
 */
function upload(params) {
  uni.uploadFile({
    url: config.domain + params.url,
    filePath: params.filePath,
    name: params.name,
    header: {
      'Authorization': params.login ? undefined : uni.getStorageSync('mall4jStationToken')
    },
    dataType: 'json',
    responseType: params.responseType == undefined ? 'json' : params.responseType,
    success: (res) => {
      const responseData = JSON.parse(res.data)
      if (responseData.code === '00000') {
        if (params.callBack) {
          params.callBack(res.data)
        }
      } else {
        uni.showToast({
          title: '服务器出了点小差',
          icon: 'none'
        })
      }
    },
    fail: function() {
      uni.hideLoading()
    }
  })
}

/**
 * 微信公众号登录
 * @param {Object} fn  登录成功回调
 * @param {String} code  微信授权返回的code, 用于登录
 */
var mpLogin = function(fn, code) {
  // 发送 res.code 到后台换取 openId, sessionKey, unionId
  request({
    login: true,
    url: '/social/mp',
    data: code,
    callBack: result => {
      loginSuccess(result, fn)
    },
    errCallBack: err => {
      uni.setStorageSync('mall4jSTempUid', err.data)
    }
  }, true)
}

var getToken = function(fn) {

}

/**
 * 登录成功后执行
 * @param {Object} result  登录成功返回的数据
 * @param {Object} fn		登录成功后的回调
 */
function loginSuccess(result, fn) {
  uni.setStorageSync('mall4jStationToken', result.accessToken)
  if (fn) {
    fn()
  }
}

function mpAuthLogin(page, needCode) {
  // 在微信环境打开,请求公众号网页登陆
  var redirectUrl = null

  if (!page) {
    redirectUrl = window.location.href
  } else {
    var {
      protocol,
      host
    } = window.location
    redirectUrl = `${protocol}//${host}` + page
  }
  var scope = 'snsapi_userinfo'
  window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + config.mpAppId +
		'&redirect_uri=' +
		encodeURIComponent(redirectUrl) + '&response_type=code&scope=' + scope + '&state=' + (needCode ? 'needCode'
    : 'unNeedCode') +
		'#wechat_redirect'
}

exports.getToken = getToken
exports.mpLogin = mpLogin
exports.request = request
exports.upload = upload
exports.mpAuthLogin = mpAuthLogin
exports.loginSuccess = loginSuccess
