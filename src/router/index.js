import Vue from 'vue'
import Router from 'vue-router'
import firebase from 'firebase'

import TodoList from '@/components/TodoList'
import Login from '@/components/Login'

Vue.use(Router)

let router = new Router({
    routes: [
        {
          //path: '/user/:id',
          path: '/',
          name: 'TodoList',
          component: TodoList,
          meta: {
              requiresAuth: true
          }
        },
        {
          path: '/login',
          name: 'Login',
          component: Login,
          // redirect: to => {
          //     return '/login'
          // }
        },
        { path: '*', redirect: '/login' }
    ],
    mode: 'history'
})

router.beforeEach((to, from, next) => {

    firebase.auth().onAuthStateChanged((user) => {
        let requiresAuth = to.matched.some(record => record.meta.requiresAuth)

        if( requiresAuth && !user ) next('login')
        //else if (!requiresAuth && currentUser)
        else next()
    })

})


export default router
