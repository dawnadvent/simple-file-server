import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './plugins/element.js'
import api from './api'
import filename from './filename'

Vue.config.productionTip = false
Vue.prototype.$api = api;
Vue.prototype.$filename = filename;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
