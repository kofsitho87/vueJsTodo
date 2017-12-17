// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import VueFire from 'vuefire'
//import firebase from 'firebase'
//import moment from 'moment'

//import bModal from 'bootstrap-vue/es/components/modal/modal'
//import bModalDirective from 'bootstrap-vue/es/directives/modal/modal'

//import BootstrapVue from 'bootstrap-vue/dist/bootstrap-vue.esm'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import App from './App'
import router from './router'

Vue.config.productionTip = false

Vue.use(BootstrapVue)
Vue.use(VueFire)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App },
  data: {
      auth: {
          user: null,
          isLogined: false,
      }
  }
})
