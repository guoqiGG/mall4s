
// 时间戳转成0000-00-00 00:00:00
const formatTime = timeStamp => {
  const date = new Date(timeStamp)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  // return [hour, minute, second].map(formatNumber).join(':')
  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const formatHtml = content => {
  content = content.replace(/\<img/gi,
    '<img style="width:100% !important;height:auto !important;margin:0;display:flex;" ')
  content = content.replace(/style="/gi,
    'style="max-width:100% !important;table-layout:fixed;word-wrap:break-word;word-break;break-all;')
  content = content.replace(/\<table/gi,
    '<table style="table-layout:fixed;word-wrap:break-word;word-break;break-all;" ')
  content = content.replace(/\<td/gi,
    '<td  cellspacing="0" cellpadding="0" border="0" style="display:block;vertical-align:top;margin: 0px; padding: 0px; border: 0px;outline-width:0px;" '
  )
  content = content.replace(/width=/gi, 'sss=')
  content = content.replace(/height=/gi, 'sss=')
  content = content.replace(/ \/\>/gi,
    ' style="max-width:100% !important;height:auto !important;margin:0;display:block;" \/\>')
  return content
}

const endOfStartTime = (startTime, endTime) => {
  let result = {
    day: '00',
    hou: '00',
    min: '00',
    sec: '00'
  }

  if (endTime - startTime > 0) {
    const time = (endTime - startTime) / 1000 // 获取天、时、分、秒

    const day = parseInt(time / (60 * 60 * 24))
    const hou = parseInt(time % (60 * 60 * 24) / 3600)
    const min = parseInt(time % (60 * 60 * 24) % 3600 / 60)
    const sec = parseInt(time % (60 * 60 * 24) % 3600 % 60)
    result = {
      day: `${timeFormat(day)}`,
      hou: `${timeFormat(hou)}`,
      min: `${timeFormat(min)}`,
      sec: `${timeFormat(sec)}`
    }
  }

  return result
} // 小于10的格式化函数

const timeFormat = times => {
  return times < 10 ? '0' + times : times
}

// 时间转时间戳
const dateToTimestamp = dateStr => {
  if (!dateStr) {
    return ''
  }
  const newDataStr = dateStr.replace(/\.|\-/g, '/')
  const date = new Date(newDataStr)
  const timestamp = date.getTime()
  return timestamp
}

// 检查是否授权
const checkAuthInfo = fn => {
  if (wx.getStorageSync('mall4jStationLoginResult').access_token) {
    fn()
  } else {
    wx.hideLoading()
    // 没有userId
    wx.redirectTo({
      url: '/pages/account-login/account-login'
    })
  }
}

/**
 * 手机号正则校验
 */
const checkPhoneNumber = (phoneNumber) => {
  var regexp = /^[1]([3-9])[0-9]{9}$/
  return regexp.test(phoneNumber)
}

/**
 * 用户名正则校验
 */
const checkUserName = (userName) => {
  var regexp = /^([a-zA-Z0-9_]{4,16})$/
  return regexp.test(userName)
}

const checkIsVerification = (num) => {
  var regexp = /^[0-9]{8,13}$/
  return regexp.test(num)
}

const checkIsNum = (num) => {
  var regexp = /^[0-9]+$/
  return regexp.test(num)
}

/**
 * 获取链接上的参数
 */
const getUrlKey = (name) => {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.href) || ['', ''])[1]
    .replace(/\+/g, '%20')) || null
}

/**
 * 防抖
 * @param fn
 * @param wait
 * @returns {Function}
 * @constructor
 */
const debounce = (fn, t) => {
  const delay = t || 300
  let timer
  return function() {
    const args = arguments
    if (timer) {
      clearTimeout(timer)
    }
    const callNow = !timer
    timer = setTimeout(() => {
      timer = null
    }, delay)
    if (callNow) fn.apply(this, args)
  }
}

module.exports = {
  getUrlKey: getUrlKey,
  dateToTimestamp: dateToTimestamp,
  formatTime: formatTime,
  formatHtml: formatHtml,
  endOfStartTime: endOfStartTime,
  checkAuthInfo: checkAuthInfo,
  checkPhoneNumber: checkPhoneNumber,
  checkUserName: checkUserName,
  checkIsNum: checkIsNum,
  checkIsVerification: checkIsVerification,
  debounce: debounce
}
