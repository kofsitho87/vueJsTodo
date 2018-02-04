<template>
<div id="todo_wrap">

    <header id="top_nav">
        <div class="profile_wrap" v-if="user">
            <a href="javascript:void(0)"
                v-on:click="logoutAction">
                <img v-bind:src="user.photoURL" class="circle" />
                <span>{{ user.displayName }}</span>
            </a>
        </div>
        <div class="header_right">

        </div>
    </header>

    <div class="content">
        <section class="left_menu">
            <ul class="list-group">
                <li v-for="item in lists"
                    class="list-group-item justify-content-between"
                    :class="{ active: item.active }"
                    v-on:click.prevent="selectList(item)">
                    {{item.title}} ({{item.todos.length}})
                    <button type="button"
                        class="close edit_list"
                        v-on:click.prevent="openEditMode(item)">
                        <span class="fa fa-pencil" aria-hidden="true"></span>
                    </button>
                </li>
                <!-- <a  href="javascript:void(0)"
                    class="list-group-item"
                    :class="{ active: item.active }"
                    v-for="item in lists"
                    v-on:click.prevent="selectList(item)"
                    v-on:dblclick.prevent="openEditMode(item)">
                    {{item.title}}
                </a> -->
            </ul>
            <div class="add_list">
                <button class="btn-block btn btn-primary" @click="addListItem()">목록추가</button>
            </div>
        </section>

        <div v-if="selectedList" class="todo_wrap" @click="toggleMenu($event)">
            <header class="input_header">
                <div class="input_wrap">
                    <form name="todo" v-on:submit.prevent="addTodo">
                        <input
                            type="text"
                            name="new_todo"
                            class="form-control new-todo"
                            placeholder="할일추가"
                            v-model="newTodo" />
                    </form>
                </div>
            </header>

            <section class="main" v-cloak>
                 <ul class="todo-list">
                     <li v-for="todo in filterByImportant"
                        class="todo"
                        :class="{ completed: todo.completed, editing: todo == editedTodo }"
                        @click="toggleMenu($event, todo)">

                        <div class="view">
                            <input class="toggle" type="checkbox" v-model="todo.completed" v-on:change="changeComplete(todo)">
                            <label @dblclick="editTodo($event, todo)">{{ todo.title }}</label>

                            <div class="float_right">
                                <span class="ago">{{ todo.ago }}</span>
                                <a class="important" @click="toggleImportant($event, todo)">
                                    <i class="fa fa-star" v-show="todo.important"></i>
                                    <i class="fa fa-star-o" v-show="!todo.important"></i>
                                </a>
                            </div>
                            <!-- <button class="destroy" @click="removeTodo(todo)"></button> -->
                        </div>

                        <input type="text"
                            class="form-control edit"
                            v-model="todo.title"
                            v-todo-focus="todo == editedTodo"
                            @blur="doneEdit(todo)"
                            @keyup.enter="doneEdit(todo)"
                            @keyup.esc="cancelEdit(todo)" />
                    </li>
                 </ul>

                 <div v-if="completedTodos.length > 0">
                     <button
                        type="button"
                        class="btn btn-sm btn-info"
                        v-on:click="completedVisible = !completedVisible">
                        완료된할일 표시
                    </button>

                     <ul v-if="completedVisible" class="todo-list">
                         <li v-for="todo in completedTodos"
                            class="todo completed"
                            @click="toggleMenu($event, todo)">
                            <div class="view">
                                <input class="toggle" type="checkbox" v-model="todo.completed" v-on:change="changeComplete(todo)">
                                <label @dblclick="editTodo($event, todo)">{{ todo.title }}</label>

                                <div class="float_right">
                                    <span class="ago">{{ todo.ago }}</span>
                                    <a class="important" @click="toggleImportant($event, todo)">
                                        <i class="fa fa-star" v-show="todo.important"></i>
                                        <i class="fa fa-star-o" v-show="!todo.important"></i>
                                    </a>
                                </div>
                                <!-- <button class="destroy" @click="removeTodo(todo)"></button> -->
                            </div>
                        </li>
                     </ul>
                 </div>

                 <!-- <footer class="footer" v-show="todos.length" v-cloak>
                    <span class="todo-count">
                        <strong>{{ remaining }}</strong> {{ remaining | pluralize }} left
                    </span>
                    <ul class="filters">
                        <li>
                            <button
                                v-on:click.prevent="changeState('all')"
                                :class="{ selected: visibility == 'all' }">
                                all
                            </button>
                        </li>
                        <li>
                            <button
                                v-on:click.prevent="changeState('active')"
                                :class="{ selected: visibility == 'active' }">
                                active
                            </button>
                        </li>
                        <li>
                            <button
                                v-on:click.prevent="changeState('completed')"
                                :class="{ selected: visibility == 'completed' }">
                                completed
                            </button>
                        </li>
                    </ul>
                    <button class="clear-completed" @click="removeCompleted" v-show="todos.length > remaining">
                        Clear completed
                    </button>
                 </footer> -->
            </section>
        </div>

        <section v-if="selectedList" class="right_hidden" :class="{active: activeMenu}">
            <header>
                <div>
                    <input type="checkbox" class="toggle" v-model="selectedTodo.completed" />
                    <label>{{selectedTodo.title}}</label>
                    <a class="important" @click="toggleImportant($event, selectedTodo)">
                        <i class="fa fa-star" v-show="selectedTodo.important"></i>
                        <i class="fa fa-star-o" v-show="!selectedTodo.important"></i>
                    </a>
                </div>
            </header>

            <header class="expire-date-setting">
                <div>
                    <label>기한설정</label>
                    <date-picker v-model="selectedTodo.expire_date" :config="config"></date-picker>
                </div>
            </header>
            <div class="content">
                <textarea
                    class="form-control note"
                    placeholder="메모"
                    v-model="selectedTodo.note"></textarea>
            </div>

            <footer>
                <button
                    class="btn"
                    :class="{'btn-default': !selectedTodo.note, 'btn-primary': selectedTodo.note}"
                    @click="updateNote(selectedTodo)">저장</button>
                <button class="btn btn-danger" @click="removeTodo(selectedTodo)">삭제</button>
            </footer>
        </section>
    </div>
</div>

</template>

<script>
import moment from 'moment'
moment.locale('ko')

import firebase from '../firebase'

// const messaging = firebase.messaging()

// messaging.requestPermission()
// .then(() => {
//     console.log('Notification permission granted.')
//     messaging.getToken().then(currentToken => {
//         console.log(currentToken);
//     })
//     // messaging.onMessage(function(payload) {
//     //     console.log("Message received. ", payload);
//     // });
// })
// .catch(function(err) {
//     console.log('Unable to get permission to notify.', err);
// });


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
    },

    created() {
        let currentUser = firebase.auth().currentUser

        this.$store.dispatch('setUserData', currentUser)
        this.$store.dispatch('fetchList')
    },
    data() {
        let config = {
            minDate: moment().startOf('day'),
            format: 'YYYY-MM-DD',
            useCurrent: false,
            //showClose: true,
            //showClear: true,
            locale: 'ko',
            icons: {
                time: 'glyphicon glyphicon-time'
            }
        }
        this.defaultTodoModel = {
            id: null,
            title: '',
            important: false,
            completed:false,
            expire_date: new Date()
        }

        return {
            config: config,
            newTodo: '',
            editedTodo: null,
            //visibility: 'active',
            completedVisible: false,
            selectedTodo: this.defaultTodoModel,
            selectedList: null,
            activeMenu: false
        }
    },
    computed: {
        user() {
            return this.$store.state.user
        },
        lists(){
            return this.$store.state.lists
        },
        filterByImportant(){
            if( !this.selectedList ) return []

            return this.selectedList.todos.filter(todo => {
                return !todo.completed
            })
            .sort((a, b) => a.createdAt < b.createdAt)
            .sort((a, b) => a.important < b.important)
        },
        completedTodos(){
            if( !this.selectedList ) return []

            return this.selectedList.todos.filter(todo => {
                return todo.completed
            })
        }
    },
    filters: {
       pluralize: function (n) {
         return n === 1 ? 'item' : 'items'
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

        addListItem(){
            let title = prompt('타이틀 작성')
            if( !title ) return

            this.$store.dispatch('addListItem', title)
        },
        selectList(item){
            this.$store.dispatch('fetchTodos', item)

            this.resetActiveList()
            item.active = true
            this.selectedList = item
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
            let openFn = () => {
                let title = prompt('타이틀을 입력해주세요!', listItem.title)
                if(!title) return

                const data = listItem
                data.title = title
                this.$store.dispatch('updateeListItem', {
                    listItem,
                    data
                })
            }

            let closeFn = () => {
                this.$store.dispatch('removeListItem', listItem)
            }

            let obj = {
                title: '수정/삭제',
                message: '타이틀을 수정하세겠습니까?(수정) 삭제하시겠습니까?(삭제)',
                type: 'success',
                showXclose: true,
                useConfirmBtn: true,
                onConfirm: openFn,
                customConfirmBtnText: '수정',
                customCloseBtnText: '삭제',
                onClose: closeFn
                //customCloseBtnClass: 'btn-danger'
            }
            this.$Simplert.open(obj)
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

<style scoped>
#top_nav{
    background-color: lightgray;
    apadding:10px;
    display: flex;
    border-bottom: 1px solid;
    height:60px;
    align-items: center;
}
#top_nav .profile_wrap{

}
#top_nav .profile_wrap a{
    padding:5px 10px;
    display: block;
    text-decoration: none;
    box-sizing: border-box;

    border-radius:10px;
}
#top_nav .profile_wrap a:hover{
    aoutline: 1px solid;
    box-shadow: 0 0 0 1px black;
}
#top_nav .profile_wrap img{
    width: 24px;
}

#todo_wrap{
    
    position: relative;
    height: 100%;
}
#todo_wrap > .content {
    display: flex;
    position: absolute;
    top:60px;
    bottom: 0;
    width: 100%;
    overflow-y: auto;
    overflow-x: hidden;
}

.todo_wrap{
    overflow-y: auto;
    flex:1;
    padding: 10px;
}

section.left_menu{
    width: 250px;
    border-right: 1px solid;
    display: flex;
    -webkit-box-orient: vertical;
    flex-direction: column;
}
section.left_menu .list-group {
    border-radius: 0;
    display: flex;
    -webkit-box-orient: vertical;
    flex-direction: column;
    overflow-y: auto;
    box-flex:1;
    flex: 1;
}
section.left_menu .list-group > li,
section.left_menu .list-group > a,
section.left_menu .list-group > button{
    border-radius: 0;
    cursor: pointer;
    xborder: 0;
    xborder-bottom:1px solid rgba(0, 0, 0, 0.125);
}
section.left_menu .list-group > li:first-child{
    border-top: 0;
}
section.left_menu .list-group .list-group-item.active{

}
section.left_menu .list-group > li .edit_list{
    position: absolute;
    top:0;
    bottom:0;
    right: 0;
    width: 34px;
    background-color: white;
    opacity: 1;
    border-left: 1px solid;
}
section.left_menu .add_list button{
    border-radius: 0;
}

.main {
    margin-top: 20px;
}
.todo-list{
    list-style-type: none;
    padding:0;
}
.todo{
    border-radius:8px;
    padding:10px;
    border: 1px solid;
    margin-bottom: 10px;
    position:relative;
    cursor: pointer;
}

.todo input {
    margin-right: 5px;
}
.todo .view{
    display: flex;
    align-items: center;
}
.todo .edit{
    display: none;
}
.todo.editing .view{
    display: none;
}
.todo .view .toggle{
    aposition: relative;
    top: 4px;
}
.todo .view label{
    margin: 0;
    flex: 1;
    cursor: inherit;
}
.todo .view .float_right{

}
.todo .view .important {
    afloat: right;
    margin-right: 10px;
}
.todo .view .ago{
    afloat: right;
    font-size: 12px;
}
.todo.completed .view label{
    text-decoration: line-through;
}
.todo.editing .edit{
    display: inline-block;
}

section.right_hidden{
    background-color: lightgray;
    border-left: 1px solid;
    width:0%;
    transition:width 0.24s ease-out;
    display: flex;
    flex-direction: column;
}
section.right_hidden.active{
    width:25%;
}
section.right_hidden header{
    padding: 10px;
    border-bottom: 1px solid;
}
section.right_hidden header > div{
    display: flex;
    align-items: center;
}
section.right_hidden header .toggle{
    margin-right: 10px;
}
section.right_hidden header label{
    font-size: 20px;
    font-weight: bold;
    margin: 0;
    flex:1
}
section.right_hidden .content {
    padding: 10px;
    overflow-y: auto;
    flex:1
}
section.right_hidden .content textarea {
    height: 100%;
}
section.right_hidden footer{
    background: white;
    padding: 10px;
}

/* .expire-date-setting > div{
    display: flex
} */
.expire-date-setting > div > label {
    font-size:16px !important;
    flex: none !important;
}
.expire-date-setting input{
    background: none;
    border:0;
    box-shadow: none;
    flex:1
}
</style>
