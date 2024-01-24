// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// import { getAuth } from "firebase/auth";

import firebase from "firebase/compat/app";
import * as firebaseui from "firebaseui";
import "firebaseui/dist/firebaseui.css";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD7wzxQRs4mKcMOB0Vcydzdxl0NRtZbXno",
    authDomain: "styleconnect-e781a.firebaseapp.com",
    projectId: "styleconnect-e781a",
    storageBucket: "styleconnect-e781a.appspot.com",
    messagingSenderId: "700825424755",
    appId: "1:700825424755:web:a0fcfadde53d4248912b06",
    measurementId: "G-BW2ZJHSJ2G"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// const auth = getAuth(app);

let ui = new firebaseui.auth.AuthUI(firebase.auth());

// ui.start("#firebaseui-auth-container", {
//   signInOptions: [
//     {
//       provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
//       requireDisplayName: false,
//     },
//   ],
// });

var uiConfig = {
  callbacks: {
    signInSuccessWithAuthResult: function (authResult, redirectUrl) {
      // User successfully signed in.
      // Return type determines whether we continue the redirect automatically
      // or whether we leave that to developer to handle.
      return true;
    },
    uiShown: function () {
      // The widget is rendered.
      // Hide the loader.
      document.getElementById("loader").style.display = "none";
    },
  },
  // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
  signInFlow: "popup",
  signInSuccessUrl: "./index.html",
  signInOptions: [
    // Leave the lines as is for the providers you want to offer your users.
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
    firebase.auth.GoogleAuthProvider.PROVIDER_ID
  ],
};

// The start method will wait until the DOM is loaded.
ui.start("#firebaseui-auth-container", uiConfig);
