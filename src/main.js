import Vue from 'vue'
import App from './App'
import wechat from './utils/wechat.js'

// #ifdef H5
if (wechat.isWechat()) {
  Vue.prototype.$wechat = wechat
}
// #endif
Vue.config.productionTip = false

Vue.mixin({
  methods: {
    setData: function(obj, callback) {
      const that = this
      let keys = []
      let val, data
      Object.keys(obj).forEach(function(key) {
        keys = key.split('.')
        val = obj[key]
        data = that.$data
        keys.forEach(function(key2, index) {
          if (index + 1 == keys.length) {
            that.$set(data, key2, val)
          } else {
            if (!data[key2]) {
              that.$set(data, key2, {})
            }
          }
          data = data[key2]
        })
      })
      callback && callback()
    }
  }
})

App.mpType = 'app'

const app = new Vue({
  ...App
})
app.$mount()
