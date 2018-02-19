import firebase from 'firebase'
import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import Toasted from 'vue-toasted'

import App from './App'
import router from './router'
import store from './store'

import 'bootstrap/dist/css/bootstrap.css'

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

const messaging = firebase.messaging()

messaging.requestPermission()
.then(function() {
    console.log('Notification permission granted.');
})
.catch(function(err) {
    console.log('Unable to get permission to notify.', err);
});

messaging.onMessage(function(payload) {
    console.log("Message received. ", payload);
    // ...
    //alert(payload)
})