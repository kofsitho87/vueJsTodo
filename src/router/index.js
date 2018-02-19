import Vue from 'vue'
import Router from 'vue-router'
import firebase from 'firebase'

import TodoList from '@/components/TodoList'
import Login from '@/components/Login'

Vue.use(Router)

const db = firebase.firestore()
const messaging = firebase.messaging()

let router = new Router({
    routes: [
        {
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
        else if ( user && to.path == '/login' ) next('/')
        else {
            next()

            //if( !user ) return;
            // messaging.getToken()
            // .then(token => {
            //     //서버로 토큰전송
            //     const data = {
            //         token: token
            //     }
                
            //     db
            //     .collection('USERS')
            //     .doc(user.uid)
            //     .set(data)
            //     .catch(err => {
            //         console.log(err)
            //     })
            // })
            // .catch(err => {
            //     console.log(err)
            // })
        }
    })

})






// function sendSubscriptionToServer(subscription) {
//     // clone the object without any of the extra getters and setters
//     var newSubscription = JSON.parse(JSON.stringify(subscription));
//     console.log(newSubscription);

//     // create the user in the database
//     // window.firebase.database()
//     //   .ref('subscriptions/' + this.safeEmail)
//     //   .set({
//     //     endpoint: newSubscription.endpoint,
//     //     keys: newSubscription.keys,
//     //     created_at: Date.now()
//     //   })
//     //   .then(function() {
//     //     console.log('Successfully saved into database.');
//     //   }).catch(function(err) {
//     //     console.error(err);
//     //   });
// }

// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('/sw.js', {
//         scope: '/'
//       })
//       .then(function(reg) {
//         // registration worked
//         console.log('Registration succeeded. Scope is ' + reg.scope);
//       }).catch(function(error) {
//         // registration failed
//         console.log('Registration failed with ' + error);
//       });
//   }

// navigator.serviceWorker.ready.then(serviceWorkerRegistration => {
//     serviceWorkerRegistration.pushManager.subscribe({
//         userVisibleOnly: true
//     })
//     .then(subscription => {
//         console.log(subscription);
//         // The subscription was successful
//         // this.isPushEnabled = true;
//         // this.buttonText = 'Already Registered';
//         // this.buttonDisable = true;

//         // Send the subscription.endpoint to your server
//         // and save it to send a push message at a later date
//         return sendSubscriptionToServer(subscription);
//     })
//     .catch(e => {
//         if (Notification.permission === 'denied') {
//             console.warn('Permission for Notifications was denied');
//             alert('Permission for Notifications was denied');
//         }else {
//             console.error('Unable to subscribe to push.', e);
//             alert(e);
//         }
//     })
// })


export default router
