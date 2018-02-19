<style scoped src="../style/todo_list.css"></style>
<template src="../template/todo_list.html"></template>

<script>
import Vue from 'vue'
import moment from 'moment'
moment.locale('ko')

import firebase from '../firebase'
import DatePicker from 'vue2-datepicker'

const todoStorage = {
    fetchFromLocal: function () {
        var todos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')

        todos.forEach((todo, index) =>{
            todo.id = index
            todo.ago = moment(todo.createdAt).fromNow()
        })
        todoStorage.uid = todos.length
        return todos
    },
    saveToLocal: function (todos) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
    }
}

export default {
    name: 'TodoList',

    components: {
        DatePicker
    },

    created() {
        let currentUser = firebase.auth().currentUser

        this.$store.dispatch('setUserData', currentUser)
        this.$store.dispatch('fetchList')

        this.$store.dispatch('watchingNotifications')
        this.$store.dispatch('watchingList')
    },
    data() {
        this.defaultTodoModel = {
            id: null,
            title: '',
            important: false,
            completed:false,
            expireDate: new Date(),
            alarmDate: null
        }

        return {
            currentDateFormat: moment().format('YYYY-MM-DD HH:mm'),
            newTodo: '',
            editedTodo: null,
            //visibility: 'active',
            completedVisible: false,
            selectedTodo: this.defaultTodoModel,
            //selectedList: null,
            activeMenu: false,
            addListName: '',
            emailKeyword: '',
            searchUsers: null,
            selectedWatingList: null
        }
    },
    computed: {
        user() {
            return this.$store.state.user
        },
        lists(){
            return this.$store.state.lists
        },
        watingLists(){
            return this.$store.state.watchingLists
        },
        selectedList(){
            return this.$store.state.selectedList
        },
        filterByImportant(){
            if( !this.selectedList ) return []

            return this.selectedList.todos.filter(todo => {
                return !todo.completed
            })
            .sort((a, b) => a.createdAt < b.createdAt)
            .sort((a, b) => a.important < b.important)
        },
        completeListPercentage(){
            if( !this.selectedList ) return 0
            var todos = this.selectedList.todos 
            var completedTodosCount = todos.filter(todo => todo.completed).length
            return Math.round((completedTodosCount / todos.length) * 100)
        },
        completedTodos(){
            if( !this.selectedList ) return []

            return this.selectedList.todos.filter(todo => {
                return todo.completed
            })
        },
        notifications(){
            return this.$store.state.notifications
        },
        filterByUnReadNotis(){
            if( this.notifications.length < 1 ) return []

            return this.notifications.filter(noti => {
                return !noti.read
            })
        },
        filterByReadNotis(){
            if( this.notifications.length < 1 ) return []

            return this.notifications.filter(noti => {
                return noti.read
            })
        },
        completeListPercentageByWatingList(){
            if( !this.selectedWatingList ) return 0

            let todos = this.selectedWatingList.todos 
            let completedTodosCount = todos.filter(todo => todo.completed).length
            return Math.round((completedTodosCount / todos.length) * 100)
        }
    },
    filters: {
        pluralize: function (n) {
            return n === 1 ? 'item' : 'items'
        },
        activeTodosCount(todos){
            return todos.filter(todo => {
                return !todo.completed
            }).length
        },
        overDueDateTodosCount(todos){
            return todos.filter(todo => {
                if( !todo.completed && todo.expireDate ){
                    return moment() > moment(todo.expireDate)
                }
                return false
            }).length
        }
    },
    methods: {
        addTodo(e) {
            let title = this.newTodo && this.newTodo.trim()
            if (!title) {
                return
            }

            this.newTodo = null

            let todo = {
                title: title,
                completed: false,
                important: false
            }
            this.$store.dispatch('addTodo', {
                listItem: this.selectedList,
                todo
            })
        },
        removeTodo: function (todo) {
            if( !this.selectedList || !todo.id ) return

            this.$store.dispatch('removeTodo', {
                listItem: this.selectedList,
                todo: todo
            }).then(() => {
                this.activeMenu = false
            }).catch(err => {
                console.log(err);
            })
        },
        editTodo: function (e, todo) {
            e.stopPropagation()
            this.beforeEditCache = todo.title
            this.editedTodo = todo
        },
        cancelEdit: function (todo) {
            this.editedTodo = null
            todo.title = this.beforeEditCache
        },
        // removeCompleted: function () {
        //     let completeds = filters.completed(this.todos)
        //     completeds.forEach((todo) => {
        //         db.collection(COLLECTION).doc(todo.id).delete()
        //         .then(() => {
        //             this.todos = filters.active(this.todos)
        //         }).catch(err => {
        //             console.log(err)
        //         })
        //     })
        //     //this.todos = filters.active(this.todos)
        // },
        updateTodo(todo){
            if( !this.selectedList ) return

            this.$store.dispatch('updateTodo', {
                listItem: this.selectedList,
                todo: todo
            })
        },
        changeComplete(todo){
            this.updateTodo(todo)
        },
        toggleImportant(e, todo){
            e.stopPropagation()

            todo.important = !todo.important
            this.updateTodo(todo)
        },
        updateNote(todo){
            //if( !todo.note || todo.note.length < 1 ) return
            this.updateTodo(todo)
        },
        toggleMenu(e, todo){
            e.stopPropagation()

            this.selectedTodo = todo || this.defaultTodoModel
            this.activeMenu = !!todo
        },
        doneEdit: function (todo) {
            if (!this.editedTodo) {
                return
            }
            this.editedTodo = null
            if (!todo.title) {
                this.removeTodo(todo)
                return
            }

            todo.title = todo.title.trim()
            this.updateTodo(todo)
        },
        addListItem(e){
            e.preventDefault()

            // let title = prompt('타이틀 작성')
            if( !this.addListName ) {
                alert('목록이름을 입력해주세요!');
                return
            }

            this.$refs.addListModal.hide()
            this.$store.dispatch('addListItem', this.addListName)
        },
        showAddListItem(){
            this.$refs.addListModal.show()
        },

        selectList(item){
            this.selectedWatingList = null
            this.resetActiveList()
            this.$store.dispatch('selectList', item)
            //item.active = true
            //this.selectedList = item

            this.activeMenu = false
        },
        resetActiveList(){
            this.lists.forEach((item) => {
                item.active = false
            })
        },
        logoutAction(){
            if( confirm('로그아웃 하시겠습니까?') ){
                this.$store.dispatch('logout')
            }
        },
        openEditMode(listItem){
            this.$refs.modifyListModal.show() 

            this.$refs.modifyInput.$el.value = listItem.title

            // let openFn = () => {
            //     let title = prompt('타이틀을 입력해주세요!', listItem.title)
            //     if(!title) return

            //     const data = listItem
            //     data.title = title
            //     this.$store.dispatch('updateeListItem', {
            //         listItem,
            //         data
            //     })
            // }

            // let closeFn = () => {
            //     this.$store.dispatch('removeListItem', listItem)
            // }

            // let obj = {
            //     title: '수정/삭제',
            //     message: '타이틀을 수정하세겠습니까?(수정) 삭제하시겠습니까?(삭제)',
            //     type: 'success',
            //     showXclose: true,
            //     useConfirmBtn: true,
            //     onConfirm: openFn,
            //     customConfirmBtnText: '수정',
            //     customCloseBtnText: '삭제',
            //     onClose: closeFn
            //     //customCloseBtnClass: 'btn-danger'
            // }
            // this.$Simplert.open(obj)
        },
        removeList(){
            this.$store.dispatch('removeListItem', this.selectedList)
            this.$refs.modifyListModal.hide() 
        },
        modifyListItem(e){
            e.preventDefault()

            const title = this.$refs.modifyInput.$el.value

            if( !title ){
                return
            }

            const selectedList = this.selectedList

            const data = selectedList
            data.title = title

            this.$store.dispatch('updateeListItem', data)

            this.$refs.modifyListModal.hide() 
        },
        shareListItem(){
            this.$refs.modifyListModal.hide()
            this.$refs.searchUserModal.show()
        },
        searchUserAction(e){
            e.preventDefault()
 
            if( !this.emailKeyword ){
                alert('검색할 유저의 이메일주소를 입력해주세요!')
                return
            }
            
            this.$store
            .dispatch('searchUser', this.emailKeyword)
            .then(users => {
                if( users.length < 1 ){
                    alert('검색된 유저가 없습니다.')
                }
                this.searchUsers = users
            })
            .catch(err => {
                alert(err)
            })
        },
        selectShareUser(user){
            if( !confirm('해당 프로젝트를 공유하시겠습니까?') ){
                return
            }

            if(!user.token){
                alert('상대방의 token이 없습니다.')
                return
            }
            

            const currentUser = firebase.auth().currentUser
            const data = {
                to: {
                    uid: user.uid,
                    displayName: user.displayName,
                    email: user.email,
                    token: user.token
                },
                from: {
                    uid: currentUser.uid,
                    displayName: currentUser.displayName,
                    email: currentUser.email
                },
                notification: {
                    title: '님이 프로젝트 더블체킹을 요청했습니다.',
                    body: `[${this.selectedList.title}]`
                },
                data: {
                    action: 'DOUBLE_CHECKING',
                    listId: `/USERS/${this.user.uid}/List/${this.selectedList.id}` 
                }                
            }

            this.$store.dispatch('addPushList', data)
        },
        confirmNoti(noti){
            console.log(noti)
            noti.read = true
            this.$store.dispatch('updateNotification', noti)

            if(noti.action == 'DOUBLE_CHECKING'){
                var confirmd = false
                if( confirm(noti.body + ' 더블체킹하는 것을 수락하시겠습니까?') ){
                    confirmd = true
                }

                if( confirmd ){
                    let data = {
                        listId: '/USERS/pxN8sqYuXkhkFYhpuYPL0Py57zy1/List/W1fhpir1lWoi9KcwYhu5'
                    }
                    //data[noti.data.listId] = 1
                    this.$store.dispatch('addWatchingList', data)
                }

                //noti.from
                // const currentUser = this.user
                // const data = {
                //     to: {
                //         uid: user.uid,
                //         displayName: user.displayName,
                //         email: user.email,
                //         token: user.token
                //     },
                //     from: {
                //         uid: currentUser.uid,
                //         displayName: currentUser.displayName,
                //         email: currentUser.email
                //     },
                //     notification: {
                //         title: '님이 프로젝트 더블체킹을 요청했습니다.',
                //         body: `[${this.selectedList.title}]`
                //     },
                //     data: {
                //         action: 'ALERT'
                //     }
                // }
                //this.$store.dispatch('addPushList', data)
            }
        },
        selectWatchingList(list){
            this.selectedWatingList = list
            
            this.resetActiveList()
            this.$store.dispatch('unSelectList')
        }
    },
    directives: {
        'todo-focus': function (el, binding) {
            if (binding.value) {
                el.focus()
            }
        }
    }
}
</script>
