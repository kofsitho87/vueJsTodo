const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

const PUSH_COLLECTION = 'PUSH';

exports.pushNotification = functions.firestore.document(`/PUSH/{documentId}`).onCreate(event => {
    let id = event.params.documentId;
    let data = event.data;
    let push = data.data();
    let token = push.to.token;

    let from = push.from;
    let toUser = push.to;

    if( !token || !toUser.uid ){
        return event.data.ref.delete()
    }

    const getToUser = admin.auth().getUser(toUser.uid);
    const getFromUser = admin.auth().getUser(from.uid);

    return Promise.all([getToUser, getFromUser]).then((results) => {
        const toUser = results[0];
        const fromUser = results[1];

        push.notification.title = fromUser.displayName + push.notification.title;
        push.notification.click_action = "https://mytodo.xyz";
        push.notification.icon = fromUser.photoURL;

        // admin.firestore()
        // .collection('USERS')
        // .doc(toUser.uid)
        // .collection('Notification')
        // .add({
        //     action: push.data.action,
        //     title: push.notification.title,
        //     body: push.notification.body,
        //     read: false,
        //     createdAt: Date(),
        //     from: {
        //         uid: from.uid,
        //         displayName: fromUser.displayName,
        //         email: fromUser.email,
        //         photoURL: fromUser.photoURL
        //     },
        //     // data: {
        //     //     listId: 't' //push.data.listId
        //     // }
        // });
        

        const payload = {
            notification: push.notification
        };

        return admin.messaging().sendToDevice([token], payload);
    })
})