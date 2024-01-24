import { showMenu } from './menuStart.js';

const addServiceForm = document.querySelector('.list');
const url =window.location.href;
const searchParams = new URL(url).searchParams;
const entries = new URLSearchParams(searchParams).values();
const array = Array.from(entries);
const obj = JSON.parse(array[0])
addServiceForm.onlocation.value = obj.onlocation ? "1" : "0";
addServiceForm.onhome.value = obj.onhome ? "1" : "0";
addServiceForm.servicedescription.value = obj.servicedescription;
addServiceForm.service.value = obj.service;
addServiceForm.price.value = obj.price;

import { initializeApp } from 'firebase/app'
import {
    getFirestore, collection, doc,
    serverTimestamp, updateDoc
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyD7wzxQRs4mKcMOB0Vcydzdxl0NRtZbXno",
  authDomain: "styleconnect-e781a.firebaseapp.com",
  projectId: "styleconnect-e781a",
  storageBucket: "styleconnect-e781a.appspot.com",
  messagingSenderId: "700825424755",
  appId: "1:700825424755:web:a0fcfadde53d4248912b06",
  measurementId: "G-BW2ZJHSJ2G"
};

// init firebase
initializeApp(firebaseConfig)

// init services
const db =getFirestore();


// get UID
import { getAuth, onAuthStateChanged } from "firebase/auth";

const auth = getAuth();
onAuthStateChanged(auth, (user) => {
  showMenu(user);
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/auth.user
    const uid = user.uid;
    // ...
  } else {
    // User is signed out
    // ...
  }
});

// collection ref
const colRefListing = collection(db, 'pros_listing_v2');


addServiceForm.addEventListener('submit', async (e) =>{
    e.preventDefault();
    try{
    const docRef = doc(colRefListing,obj.listingId);
    await updateDoc(docRef,{ 
        onlocation:  Boolean(parseInt(addServiceForm.onlocation.value)),
        onhome:  Boolean(parseInt(addServiceForm.onhome.value)),    
        servicedescription: addServiceForm.servicedescription.value,
        service: addServiceForm.service.value,
        price: +addServiceForm.price.value,
        createdAt: serverTimestamp()
    })
    addServiceForm.reset();
    window.location.assign("prosDashboard.html");}
    
    catch(error){
        console.log(error);
    }

})
