import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import Toasted from 'vue-toasted'

import App from './App'
import router from './router'
import store from './store';

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.config.productionTip = false

Vue.use(BootstrapVue)


Vue.use(Toasted, {
    position: 'top-center',
    duration: '1000'
})

new Vue({
    el: '#app',
    router,
    template: '<App/>',
    components: {
        App
    },
    store
})
