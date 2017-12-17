import Vue from 'vue'
import Router from 'vue-router'

import Home from '@/components/Home'
import TodoList from '@/components/TodoList'
import Login from '@/components/Login'

Vue.use(Router)

export default new Router({
    routes: [
        {
          path: '/',
          name: 'TodoList',
          component: TodoList
        },
        {
          path: '/login',
          name: 'Login',
          component: Login
        },
    ]
})
