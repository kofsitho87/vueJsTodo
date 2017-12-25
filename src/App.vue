<template>
    <div id="app">
        <router-view/>
        <simplert></simplert>

        <b-modal v-model="modalShow" title="Bootstrap-Vue">
            <p class="my-4">Hello from modal!</p>
        </b-modal>
    </div>
</template>

<script>
import Vue from 'vue'
import Simplert from 'vue2-simplert-plugin'
import firebase from './firebase'

import datePicker from 'vue-bootstrap-datetimepicker'
import 'eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.css'
Vue.use(datePicker);


Vue.use(Simplert)

export default {
    name: 'app',
    computed: {
        modalShow(){
            return this.$store.state.modalShow
        }
    }
}
</script>

<style>
html, body{
    height: 100%;
}
#app {
    height: 100%;
}
</style>
