<script>
// app.js
var http = require('./utils/http.js')
var util = require('./utils/util.js')
export default {
  onLaunch: function() {
    console.log('mall4j.v230327')
    // #ifdef H5
    uni.getSystemInfo({
      success: function(res) {
        // 客户端平台，值域为：ios、android
        if (res.platform == 'ios') {
          uni.setStorageSync('mall4jIosUrl', window.location.href.split('#')[0])
        }
      }
    })
    // #endif
  },
  onShow: function() {

  },
  globalData: {
    // 定义全局请求队列
    requestQueue: [],
    // 是否正在进行登陆
    isLanding: false
  },
  onHide: function() { }
}
</script>

<style>
/*每个页面公共css */
@import "./app.css";

/* 隐藏头部 */
uni-page-head {
  display: none;
}

/* 轮播图指示点 */
uni-swiper .uni-swiper-dots-horizontal {
  bottom: 20px !important;
}
</style>
