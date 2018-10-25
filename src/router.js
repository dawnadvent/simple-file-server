import Vue from 'vue'
import Router from 'vue-router'
import Filelist from './views/Filelist.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      component: Filelist
    },
    {
      path: "*",
      component: Filelist
    }
  ]
})
