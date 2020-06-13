import firebase from "firebase";

const firebaseConfig = {
  apiKey: "AIzaSyCoE_5IaQOwdfF7-vsLZpnO0LXSOjA7XXw",
  authDomain: "bibviz.firebaseapp.com",
  databaseURL: "https://bibviz.firebaseio.com",
  projectId: "bibviz",
  storageBucket: "bibviz.appspot.com",
  messagingSenderId: "681638902037",
  appId: "1:681638902037:web:e4d723b29595d7c2ba111c",
  measurementId: "G-SJY80WV1T8",
};

firebase.initializeApp(firebaseConfig);

export default firebase;
