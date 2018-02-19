import firebase from 'firebase'
import 'firebase/firestore'

const firebaseApp = firebase.initializeApp({
    apiKey: "AIzaSyBUl5GQ30BOzjC8rOfVkmpafs2AM0vJQD8",
    authDomain: "mytodo-12180.firebaseapp.com",
    databaseURL: "https://mytodo-12180.firebaseio.com",
    projectId: "mytodo-12180",
    storageBucket: "mytodo-12180.appspot.com",
    messagingSenderId: "880291223630"
})

export default firebaseApp
