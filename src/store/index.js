import Vue from 'vue'
import Vuex from 'vuex'
import firebase from '../firebase'
import moment from 'moment'
moment.locale('ko')

Vue.use(Vuex)

let db = firebase.firestore()

const USERS_COLLECTION = 'USERS'
const LIST_COLLECTION  = 'List'
const TODO_COLLECTION  = 'Todos'
const STORAGE_KEY      = 'MY_TODO'

const store = new Vuex.Store({
    state: {
        user: null,
        lists: [],
        visibility: 'all',
        selectedList: null,
        modalShow: false
    },
    getters: {
        isLogined: state => {
            return !!state.user
        },
    },
    mutations: {
        login(state, user){
            state.user = user
        },
        logout(state){
            state.user = null
        },
        setUserData(state, user){
            //console.log(state, user)
            state.user = user
        },

        fetchList(state, lists){
            state.lists = lists
        },
        addListItem(state, listData){
            state.lists.push(listData)
        },
        removeListItem(state, listData){
            state.lists.splice( state.lists.indexOf(listData), 1 )
        },

        showModal(state, show){
            //console.log(state, show);
            state.modalShow = show
        }
    },
    actions: {
        login(context, payload){
            context.commit('login', payload)
        },
        logout(context){
            firebase.auth().signOut().then(() => {
                context.commit('logout')
                console.log('logout successfully');
            }).catch(err=> {
                console.log(err);
                alert(err);
            })
        },
        setUserData(context, payload){
            context.commit('setUserData', payload)
        },
        addListItem(context, title){
            let uid = this.state.user.uid

            if( !title || !uid ) return

            let data = {
                title: title,
                active: false,
                todos: [],
                createdAt: moment().toDate()
            }

            db
            .collection(USERS_COLLECTION)
            .doc(uid)
            .collection(LIST_COLLECTION)
            .add(data)
            .then((snap) => {
                data.id = snap.id
                context.commit('addListItem', data)
            }).catch(err => {
                console.log(err);
            })
        },
        removeListItem(context, listItem){
            let uid = this.state.user.uid

            if( !uid ) return

            db
            .collection(USERS_COLLECTION)
            .doc(uid)
            .collection(LIST_COLLECTION)
            .doc(listItem.id)
            .delete()
            .then((snap) => {
                context.commit('removeListItem', listItem)
            }).catch(err => {
                console.log(err);
            })
        },
        updateeListItem(context, {listItem, data}){
            let uid = this.state.user.uid

            if( !uid ) return

            db
            .collection(USERS_COLLECTION)
            .doc(uid)
            .collection(LIST_COLLECTION)
            .doc(listItem.id)
            .update(data)
            .then((snap) => {
                listItem = data
            }).catch(err => {
                console.log(err);
            })
        },
        fetchList(context){
            let uid = this.state.user.uid
            if( !uid ) return

            db
            .collection(USERS_COLLECTION)
            .doc(uid)
            .collection(LIST_COLLECTION)
            .orderBy('createdAt', 'asc')
            .get()
            .then((snap) => {
                var lists = []
                snap.forEach((doc) => {
                    let listItem   = doc.data()
                    listItem.id    = doc.id
                    listItem.todos = []
                    lists.push(listItem)
                })
                context.commit('fetchList', lists)

            }).catch(err => {
                console.log(err)
            })
        },
        fetchTodos(context, listItem){
            let uid = this.state.user.uid
            if( !uid || !listItem.id ) return

            db
            .collection(USERS_COLLECTION)
            .doc(uid)
            .collection(LIST_COLLECTION)
            .doc(listItem.id)
            .collection(TODO_COLLECTION)
            .orderBy('createdAt', 'desc')
            .get()
            .then((todosSnap) => {
                var todos = []
                todosSnap.forEach((doc) => {
                    let todo = doc.data()
                    todo.id  = doc.id
                    todo.ago = moment(todo.createdAt).fromNow()
                    todos.push(todo)
                })
                listItem.todos = todos
            })
            .catch(err => {
                console.log(err);
            })
        },
        addTodo(context, {listItem, todo}){
            let uid = this.state.user.uid
            if( !uid || !listItem || !listItem.id ) return

            todo.createdAt = moment().toDate()
            todo.ago = moment(todo.createdAt).fromNow()

            db
            .collection(USERS_COLLECTION)
            .doc(uid)
            .collection(LIST_COLLECTION)
            .doc(listItem.id)
            .collection(TODO_COLLECTION)
            .add(todo)
            .then((todosSnap) => {
                todo.id = todosSnap.id
                listItem.todos.unshift(todo)
            })
            .catch(err => {
                console.log(err);
            })
        },
        updateTodo(context, {listItem, todo}){
            let uid = this.state.user.uid
            if( !uid || !listItem || !listItem.id ) return

            db
            .collection(USERS_COLLECTION)
            .doc(uid)
            .collection(LIST_COLLECTION)
            .doc(listItem.id)
            .collection(TODO_COLLECTION)
            .doc(todo.id)
            .update(todo)
            .then(() => {
                console.log('updated successfully!');
                Vue.toasted.success('업데이트완료');
            }).catch(err => {
                console.log(err)
                Vue.toasted.error(err);
            })
        },
        removeTodo(context, {listItem, todo}){
            let uid = this.state.user.uid
            if( !uid || !listItem || !listItem.id ) return

            return new Promise((resolve, reject) => {
                db
                .collection(USERS_COLLECTION)
                .doc(uid)
                .collection(LIST_COLLECTION)
                .doc(listItem.id)
                .collection(TODO_COLLECTION)
                .doc(todo.id)
                .delete()
                .then(() => {
                    listItem.todos.splice(listItem.todos.indexOf(todo), 1)
                    resolve(true)
                }).catch(err => {
                    reject(err)
                })
            })
        }
    }
})

export default store
