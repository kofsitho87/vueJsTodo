<template>
    <div class="container">
        <div class="card card-container">
            <button class="btn btn-primary" v-on:click="loginAction('fb')">페이스북 로그인</button>
            <button class="btn btn-danger" v-on:click="loginAction('go')">구글 로그인</button>
            <button class="btn btn-info" v-on:click="loginAction('github')">깃허브 로그인</button>
        </div>
    </div><!-- /container -->
</template>

<script>
import firebase from 'firebase'
const messaging = firebase.messaging()

export default {
    name: 'Login',

    data() {
        return {
            email: '',
            password: ''
        }
    },
    methods: {
        loginAction(platform){
            let auth = firebase.auth()
            var provider

            if(platform == 'fb'){
                provider = new firebase.auth.FacebookAuthProvider()
                provider.addScope('email')
                provider.addScope('profile')
            }else if(platform == 'go'){
                provider = new firebase.auth.GoogleAuthProvider()
                provider.addScope('email')
                provider.addScope('profile')
            }else if (platform == 'github'){
                provider = new firebase.auth.GithubAuthProvider()
                provider.addScope('email')
                provider.addScope('profile')
            }



            var self = this
            auth.signInWithPopup(provider).then(function(result) {
                // This gives you a Google Access Token.
                //var token = result.credential.accessToken
                // The signed-in user info.
                const user = result.user
                messaging.getToken().then(token => {
                    user.token = token
                    self.$store.dispatch('login', user)
                })
                .catch(err => {
                    console.log(err)
                    user.token = null
                    self.$store.dispatch('login', user)
                })                
                //location.href = '/'
            }).catch(err => {
                console.log(err)
                alert(err)
            })
        }
    }
}
</script>

<style scoped>
body, html {
    height: 100%;
    background-repeat: no-repeat;
    background-image: linear-gradient(rgb(104, 145, 162), rgb(12, 97, 33));
}

.card-container.card {
    max-width: 350px;
    padding: 40px 40px;
}

.btn {
    font-weight: 700;
    height: 36px;
    -moz-user-select: none;
    -webkit-user-select: none;
    user-select: none;
    cursor: default;
}

/*
 * Card component
 */
.card {
    background-color: #F7F7F7;
    /* just in case there no content*/
    padding: 20px 25px 30px;
    margin: 0 auto 25px;
    margin-top: 50px;
    /* shadows and rounded borders */
    -moz-border-radius: 2px;
    -webkit-border-radius: 2px;
    border-radius: 2px;
    -moz-box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.3);
    -webkit-box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.3);
    box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.3);
}

.profile-img-card {
    width: 96px;
    height: 96px;
    margin: 0 auto 10px;
    display: block;
    -moz-border-radius: 50%;
    -webkit-border-radius: 50%;
    border-radius: 50%;
}

/*
 * Form styles
 */
.profile-name-card {
    font-size: 16px;
    font-weight: bold;
    text-align: center;
    margin: 10px 0 0;
    min-height: 1em;
}

.reauth-email {
    display: block;
    color: #404040;
    line-height: 2;
    margin-bottom: 10px;
    font-size: 14px;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    -moz-box-sizing: border-box;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
}

.form-signin #inputEmail,
.form-signin #inputPassword {
    direction: ltr;
    height: 44px;
    font-size: 16px;
}

.form-signin input[type=email],
.form-signin input[type=password],
.form-signin input[type=text],
.form-signin button {
    width: 100%;
    display: block;
    margin-bottom: 10px;
    z-index: 1;
    position: relative;
    -moz-box-sizing: border-box;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
}

.form-signin .form-control:focus {
    border-color: rgb(104, 145, 162);
    outline: 0;
    -webkit-box-shadow: inset 0 1px 1px rgba(0,0,0,.075),0 0 8px rgb(104, 145, 162);
    box-shadow: inset 0 1px 1px rgba(0,0,0,.075),0 0 8px rgb(104, 145, 162);
}

.btn.btn-signin {
    /*background-color: #4d90fe; */
    background-color: rgb(104, 145, 162);
    /* background-color: linear-gradient(rgb(104, 145, 162), rgb(12, 97, 33));*/
    padding: 0px;
    font-weight: 700;
    font-size: 14px;
    height: 36px;
    -moz-border-radius: 3px;
    -webkit-border-radius: 3px;
    border-radius: 3px;
    border: none;
    -o-transition: all 0.218s;
    -moz-transition: all 0.218s;
    -webkit-transition: all 0.218s;
    transition: all 0.218s;
}

.btn.btn-signin:hover,
.btn.btn-signin:active,
.btn.btn-signin:focus {
    background-color: rgb(12, 97, 33);
}

.forgot-password {
    color: rgb(104, 145, 162);
}

.forgot-password:hover,
.forgot-password:active,
.forgot-password:focus{
    color: rgb(12, 97, 33);
}
</style>
