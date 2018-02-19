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
const PUSH_COLLECTION = 'PUSH'
const NOTIFICATION_COLLECTION = 'Notification'

const store = new Vuex.Store({
    state: {
        user: null,
        lists: [],
        watchingLists: [],
        visibility: 'all',
        selectedList: null,
        modalShow: false,
        notifications: []
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
        selectList(state, item){
            item.active = true
            state.selectedList = item
        },
        unSelectList(state){
            state.selectedList = null
        },
        showModal(state, show){
            //console.log(state, show);
            state.modalShow = show
        },
        updateNotifications(state, notis){
            //console.log(state, notis)
            state.notifications = notis
        },
        addWatingList(state, list){
            state.watchingLists = list
        }
    },
    actions: {
        login(context, payload){
            const data = {
                uid: payload.uid,
                displayName : payload.displayName,
                email: payload.email ? payload.email : payload.providerData[0].email,
                token: payload.token
            }
            
            db
            .collection(USERS_COLLECTION)
            .doc(payload.uid)
            .set(data)

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
        updateeListItem(context, listItem){
            let uid = this.state.user.uid

            if( !uid ) return

            db
            .collection(USERS_COLLECTION)
            .doc(uid)
            .collection(LIST_COLLECTION)
            .doc(listItem.id)
            .update(listItem)
            .then((snap) => {
                
            }).catch(err => {
                console.log(err)
            })
        },
        fetchList(context){
            let uid = this.state.user.uid
            if( !uid ) return

            var listCollection = db.collection(USERS_COLLECTION).doc(uid).collection(LIST_COLLECTION)
            
            listCollection
            .orderBy('createdAt', 'asc')
            .get()
            .then((snap) => {
                var lists = []
                snap.forEach((doc) => {
                    let listItem   = doc.data()
                    listItem.id    = doc.id
                    listItem.todos = []
                    listItem.active = false
                    lists.push(listItem)

                    listCollection.doc(doc.id).collection('Todos').get().then(snap => {
                        snap.forEach(doc => {
                            let todo = doc.data()
                            todo.id = doc.id
                            todo.ago = moment(todo.createdAt).fromNow()
                            listItem.todos.push(todo)
                        })    
                    })
                })
                context.commit('fetchList', lists)
                context.commit('selectList', lists[0])

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
                listItem.count = todos.length
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
        },
        selectList(context, item){
            context.commit('selectList', item)
        },
        unSelectList(context){
            context.commit('unSelectList')
        },

        updateToken(context, {user, token}){
            const data = {
                email: user.email,
                displayName: user.displayName,
                token: token
            }

            db
            .collection(USERS_COLLECTION)
            .doc(user.uid)
            .update(data)
            .then(r => {
                console.log(r)
            })
            .catch(err => {
                console.log(err)
            })
        },
        searchUser(context, email){
            let currentUser = firebase.auth().currentUser

            return new Promise((resolve, reject) => {
                db.collection(USERS_COLLECTION).where('email', '==', email)
                .get()
                .then(snap => {
                    let users = []
                    if( snap.size > 0 ){
                        snap.forEach((doc) => {
                            let user = doc.data()
                            user.uid = doc.id
                            if(doc.id != currentUser.uid) {
                                users.push(user)
                            }
                        })
                    }
                    resolve(users)
                })
                .catch(err => {
                    console.log(err)
                    reject(err)
                })
            })
        },
        addPushList(context, data){
            db
            .collection(PUSH_COLLECTION)
            .add(data)
            .then(snap => {
                console.log(snap)
            })
            .catch(err => {
                console.log(err)
            })
        },
        addWatchingList(context, data){
            let uid = this.state.user.uid

            db
            .collection(USERS_COLLECTION)
            .doc(uid)
            .collection('WatchingList')
            .add(data)
            .then(snap => {
                console.log(snap)
            })
            .catch(err => {
                console.log(err)
            })
        },
        watchingNotifications(context){
            let uid = this.state.user.uid

            db
            .collection(USERS_COLLECTION)
            .doc(uid)
            .collection(NOTIFICATION_COLLECTION)
            .onSnapshot(snap => {
                const notis = []
                snap.forEach(doc => {
                    let data = doc.data()
                    data.id = doc.id
                    notis.push(data)
                })
                context.commit('updateNotifications', notis)
            })
        },
        updateNotification(context, noti){
            let uid = this.state.user.uid

            db
            .collection(USERS_COLLECTION)
            .doc(uid)
            .collection(NOTIFICATION_COLLECTION)
            .doc(noti.id)
            .update(noti)
        },
        watchingList(context){
            let uid = this.state.user.uid

            db
            .collection(USERS_COLLECTION)
            .doc(uid)
            .collection('WatchingList')
            .get()
            .then(snap => {
                let lists = []
                snap.forEach(doc => {
                    let data = doc.data()

                    db.doc(data.listId)
                    .get()
                    .then(snap => {
                        let list = snap.data()
                        
                        snap.ref.collection('Todos')
                        .onSnapshot(snap => {
                            let todos = []
                            snap.forEach(doc => {
                                let todo = doc.data()
                                todos.push(todo)
                            })

                            list.todos = todos
                        })
                        lists.push(list)
                    })
                })

                context.commit('addWatingList', lists)
            })
        }
    }
})

export default store
