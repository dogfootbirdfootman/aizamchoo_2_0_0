import firebase from 'firebase/app'
import "firebase/auth";
import "firebase/database";
import "firebase/firestore";
import "firebase/functions";
import "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDlTowrVOYOnFMuSozeArcDY1IebPRthkk",
    authDomain: "naturalmeeting-2e64a.firebaseapp.com",
    databaseURL: "https://naturalmeeting-2e64a-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "naturalmeeting-2e64a",
    storageBucket: "naturalmeeting-2e64a.appspot.com",
    messagingSenderId: "1059225886365",
    appId: "1:1059225886365:web:23a48ab0a295f16c69be74"
};

export default firebase.initializeApp(firebaseConfig);