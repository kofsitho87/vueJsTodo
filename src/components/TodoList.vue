<template>
<div id="todo_wrap">

    <header id="top_nav">
        <div class="profile_wrap">
            <a href="javascript:void(0)">
                <img src="//ssl.gstatic.com/accounts/ui/avatar_1x.png" class="circle" />
                <span>userName</span>
            </a>
        </div>
        <div class="header_right">

        </div>
    </header>

    <div class="content">
        <section class="left_menu">
            <ul class="list-group">
                <li v-for="item in list"
                    class="list-group-item"
                    :class="{ active: item.active }"
                    v-on:click.prevent="selectList(item)">
                    {{item.title}}
                </li>
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
                     <li v-for="todo in selectedList.todos"
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

                 <footer class="footer" v-show="todos.length" v-cloak>
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
                 </footer>
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


<!-- <b-alert show>Default Alert</b-alert> -->
<!-- <b-modal ref="myModalRef" hide-footer title="Using Component Methods">

</b-modal> -->
</template>

<script>
import bModal from 'bootstrap-vue/es/components/modal/modal'
import firebase from 'firebase'
import moment from 'moment'
moment.locale('ko')

require("firebase/firestore")

const firebaseApp = firebase.initializeApp({
    apiKey: "AIzaSyBUl5GQ30BOzjC8rOfVkmpafs2AM0vJQD8",
    authDomain: "mytodo-12180.firebaseapp.com",
    databaseURL: "https://mytodo-12180.firebaseio.com",
    projectId: "mytodo-12180",
    storageBucket: "mytodo-12180.appspot.com",
    messagingSenderId: "880291223630"
})

var db = firebaseApp.firestore()
const LIST_COLLECTION = 'List'
const COLLECTION = 'Todos'
const STORAGE_KEY = 'MY_TODO'
const todoStorage = {
    async fetch(){
        var todos = []
        return new Promise((resolve, reject) => {
            db.collection(COLLECTION).orderBy('createdAt', 'desc').get()
            .then((snap) => {
                snap.forEach((doc) => {
                    //console.log(`${doc.id} => ${data.title}`)
                    let data = doc.data()
                    let todo = data
                    todo.id = doc.id
                    todo.ago = moment(todo.createdAt).fromNow()
                    todos.push(todo)
                })
                resolve(todos)
            }).catch(err => {
                reject(err)
            })
        })
    },
    async fetchList(){
        var list = []
        return new Promise((resolve, reject) => {
            db.collection(LIST_COLLECTION).get()
            .then((snap) => {
                snap.forEach((doc) => {
                    let data = doc.data()
                    let listItem = data
                    listItem.id = doc.id
                    listItem.todos = []

                    db.collection(LIST_COLLECTION).doc(doc.id)
                    .collection(COLLECTION).orderBy('createdAt').get()
                    .then((todosSnap) => {
                        var todos = []
                        todosSnap.forEach((doc) => {
                            let data = doc.data()
                            data.id = doc.id
                            todos.push(data)
                        })

                        listItem.todos = todos
                        list.push(listItem)
                    })
                })
                resolve(list)
            }).catch(err => {
                reject(err)
            })
        })
    },
    fetchFromLocal: function () {
        var todos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')

        todos.forEach((todo, index) =>{
            todo.id = index
            todo.ago = moment(todo.createdAt).fromNow()
        })
        todoStorage.uid = todos.length
        return todos
    },
    async save(todo, listId){
        return db.collection(LIST_COLLECTION).doc(listId).collection(COLLECTION).add(todo)
        .then(docRef => {
            //console.log(docRef.id)
            return docRef.id
        }).catch(err => {
            console.log(err)
        })
    },
    saveToLocal: function (todos) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
    }
}

var filters = {
  all: function (todos) {
      return todos
  },
  active: function (todos) {
      return todos.filter(function (todo) {
          return !todo.completed
      })
  },
  completed: function (todos) {
      return todos.filter(function (todo) {
          return todo.completed
      })
  }
}

export default {
    name: 'TodoList',
    route: {
        activate(a){
            console.log(a);
        }
    },
    created() {
        // var todo_wrap = document.querySelector('.todo_wrap')
        // console.log(todo_wrap);
        // todo_wrap.addEventListener('click', (e) => {
        //     this.toggleMenu(e)
        // }, false)
        // db.collection(COLLECTION).orderBy('createdAt', 'desc').get()
        // .then((snap) => {
        //     snap.forEach((doc) => {
        //         //console.log(`${doc.id} => ${data.title}`)
        //         let data = doc.data()
        //         let todo = data
        //         todo.id = doc.id
        //         todo.ago = moment(todo.createdAt).fromNow()
        //         this.todos.push(todo)
        //     })
        // })

    },
    data() {

        console.log(this.$root.$data);

        todoStorage.fetchList().then(list => {
            this.list = list
        })

        // todoStorage.fetch().then(todos => {
        //     //this.todos = todos
        // })

        this.defaultTodoModel = {
            id: null,
            title: '',
            important: false,
            completed:false
        }

        return {
            list: [],
            todos: [], //todoStorage.fetch(),
            newTodo: '',
            editedTodo: null,
            visibility: 'all',
            selectedTodo: this.defaultTodoModel,
            selectedList: null,
            activeMenu: false
        }
    },
    watch: {
        // todos: {
        //     handler(todos, oldTodos) {
        //         let newTodo = todos.filter(todo => oldTodos.indexOf(todo) < 0)
        //         //todoStorage.save(todos)
        //
        //         console.log(newTodo);
        //     },
        //     deep: true
        // }
    },
    computed: {
        filteredTodos: function () {
            let todos = this.selectedList ? this.selectedList.todos : []
            //console.log(todos);
            return filters[this.visibility](todos)
            //return _.orderBy(filters[this.visibility](this.todos), 'important')
        },
        remaining: function () {
            return filters.active(this.todos).length
        },
        allDone: {
            get: function () {
                return this.remaining === 0
            },
            set: function (value) {
                this.todos.forEach(function (todo) {
                    todo.completed = value
                })
            }
        }
    },
    filters: {
       pluralize: function (n) {
         return n === 1 ? 'item' : 'items'
       }
    },
    methods: {
        changeComplete(todo){
            this.updateTodo(todo).then(success => {
                if( !success ){
                    todo.completed = !todo.completed
                }
            })
        },
        addTodo(e) {
            let title = this.newTodo && this.newTodo.trim()
            if (!title) {
                return
            }

            let time = moment().toDate()

            let todoItem = {
                //id: todoStorage.id,
                title: title,
                completed: false,
                important: false,
                createdAt: time,
                ago: moment(time).fromNow()
            }

            //this.todos.push( todoItem )
            //this.todos.unshift( todoItem )
            //this.newTodo = ''

            todoStorage.save( todoItem, this.selectedList.id )
            .then(id => {
                if( id ){
                    this.newTodo = ''
                    todoItem.id = id
                    this.selectedList.todos.push(todoItem)
                }
            })
        },
        editTodo: function (e, todo) {
            e.stopPropagation()

            this.beforeEditCache = todo.title
            this.editedTodo = todo
        },
        removeTodo: function (todo) {
            if( !this.selectedList || !todo.id ) return

            db.collection(LIST_COLLECTION).doc(this.selectedList.id)
            .collection(COLLECTION).doc(todo.id).delete()
            .then(() => {
                this.selectedList.todos.splice(this.selectedList.todos.indexOf(todo), 1)
                this.activeMenu = false
            }).catch(err => {
                console.log(err)
            })
        },
        doneEdit: function (todo) {
            if (!this.editedTodo) {
                return
            }
            this.editedTodo = null
            // todo.title = todo.title.trim()
            //
            if (!todo.title) {
                this.removeTodo(todo)
                return
            }

            this.updateTodo(todo).then(success => {
                if( success ){
                    todo.title = todo.title.trim()
                }
            })
        },
        cancelEdit: function (todo) {
            this.editedTodo = null
            todo.title = this.beforeEditCache
        },
        removeCompleted: function () {
            let completeds = filters.completed(this.todos)
            completeds.forEach((todo) => {
                db.collection(COLLECTION).doc(todo.id).delete()
                .then(() => {
                    this.todos = filters.active(this.todos)
                }).catch(err => {
                    console.log(err)
                })
            })
            //this.todos = filters.active(this.todos)
        },
        async updateTodo(todo){
            if( !this.selectedList ) return

            return db.collection(LIST_COLLECTION).doc(this.selectedList.id)
            .collection(COLLECTION).doc(todo.id).update(todo)
            .then(() => {
                console.log('updated successfully!');
                return true
            }).catch(err => {
                console.log(err)
                return false
            })
        },

        changeState(state){
            this.visibility = state
        },
        toggleImportant(e, todo){
            e.stopPropagation()

            todo.important = !todo.important

            // let data = {
            //     id: todo.id,
            //     important: !todo.important
            // }
            this.updateTodo(todo).then(success => {
                if( !success ){
                    todo.important = !todo.important
                }
            })
        },
        toggleMenu(e, todo){
            e.stopPropagation()

            this.selectedTodo = todo || this.defaultTodoModel
            this.activeMenu = !!todo
        },
        updateNote(todo){
            //if( !todo.note || todo.note.length < 1 ) return
            this.updateTodo(todo).then(success => {
                if( !success ){
                    todo.note = null
                }
            })
        },
        addListItem(){
            let title = prompt('타이틀 작성')
            if( title ){
                let data = {
                    title: title,
                    active: false,
                    todos: []
                }
                db.collection(LIST_COLLECTION).add(data)
                .then((snap) => {
                    //console.log(snap.id);
                    data.id = snap.id
                    this.list.push(data)
                }).catch(err => {
                    console.log(err);
                })
            }
        },
        selectList(item){
            this.resetActiveList()
            item.active = true
            this.selectedList = item
        },
        resetActiveList(){
            this.list.forEach((item) => {
                item.active = false
            })
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
section.left_menu ul{
    display: flex;
    -webkit-box-orient: vertical;
    flex-direction: column;
    overflow-y: auto;
    box-flex:1;
    flex: 1;
}
section.left_menu ul li{
    border-radius: 0;
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
</style>
