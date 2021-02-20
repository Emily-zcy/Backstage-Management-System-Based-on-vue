import Vue from 'vue'
import App from './App.vue'
import router from './router'
// import './plugins/element.js'
// 导入全局样式表
import './assets/css/global.css'
// 导入字体图标
import './assets/fonts/iconfont.css'
// 导入树形表格
import TreeTable from 'vue-table-with-tree-grid'
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'

// 导入第三方进度条中的JS和CSS
import NProgress from 'nprogress'

// 导入axios包
import axios from 'axios'
// 配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 在request拦截器中，展示进度条 NProgress.start();
axios.interceptors.request.use(config => {
  NProgress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // console.log(config)
  // 在最后必须要return config，否则会报错
  return config
})
// 在response拦截器中，隐藏进度条 NProgress.done();
axios.interceptors.response.use(config => {
  NProgress.done()
  return config
})
/* 将axios包挂载到Vue的原型对象上，这样的话，
   每一个Vue组件都可以通过this直接访问到$http，从而去发起axios请求 */
Vue.prototype.$http = axios

Vue.config.productionTip = false

// 全局注册树形表格
Vue.component('tree-table', TreeTable)
// 将富文本编辑器注册为全局可用的组件
Vue.use(VueQuillEditor)

// 创建时间过滤器
Vue.filter('dateFormat', (originVal) => {
  const dt = new Date(originVal)
  // console.log(originVal)
  // 获取年月日
  const y = dt.getFullYear()
  // 月份是从0开始的，所以需要+1，如果月份不足两位，则在前面补0
  // 先将月份转换为字符串
  // padStart函数的第一个参数表示总长度为多少位，第二个参数表示使用什么字符串进行填充
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')
  // 获取时分秒
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
