import { showMenu } from "./menuStart.js";
const bookingDetail = document.querySelector("#booking-detail");
const bookingTime = document.querySelector("#booking-time");
const whereDescription = document.querySelector("#where-description");

const url = window.location.href;
const arr = url.split("?");
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  serverTimestamp,
  Timestamp,
  setDoc,
  getDoc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD7wzxQRs4mKcMOB0Vcydzdxl0NRtZbXno",
  authDomain: "styleconnect-e781a.firebaseapp.com",
  projectId: "styleconnect-e781a",
  storageBucket: "styleconnect-e781a.appspot.com",
  messagingSenderId: "700825424755",
  appId: "1:700825424755:web:a0fcfadde53d4248912b06",
  measurementId: "G-BW2ZJHSJ2G",
};

// init firebase
initializeApp(firebaseConfig);

// init services
const db = getFirestore();
// get UID
import { getAuth, onAuthStateChanged } from "firebase/auth";
// collection ref
const colRef = collection(db, "customer_booking");
let addressData = null;
const auth = getAuth();
let currentUserUID = null;
const geoBaseURL = "https://api.tomtom.com/search/2/geocode/";
const APIKEY = "ebSKGOKaTk6WTADs40LNnaFX4X7lKlqG";
const ext = "json";

onAuthStateChanged(auth, async (user) => {
  showMenu(user);
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/auth.user
    currentUserUID = user.uid;

    if (arr[4] === "onhome") {
      addressData = await addressFectching(arr[3], "professional_profile_v2");
      const mapURL =
        geoBaseURL +
        encodeURI(addressData.address1) +
        "." +
        ext +
        "?key=" +
        APIKEY;
      const geoCodeResponse = await fetch(mapURL);
      const geoCodeJSON = await geoCodeResponse.json();
      const coordinates = geoCodeJSON.results[0].position;

      whereDescription.innerHTML = `<h2>Confirm Booking</h2> <p class="mt-3 mb-5">For this booking, you will need to go and get the service at the <span class="text-danger fs-5 fw-bold">Professional's location </span> as per below address.</p>
      <h5 class="mb-5">Address: ${addressData.address1}</h5>
      <img class="img-fluid" src="https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-l+ff2600(${coordinates.lon},${coordinates.lat})/${coordinates.lon},${coordinates.lat},10,0/400x400@2x?access_token=pk.eyJ1IjoicG5ndXllbjYzIiwiYSI6ImNsazk1aWlxNTA2djIzZWxueHo4M2NjbWIifQ.Gl4sErrXg13DhcvO_qgDMw" alt="map">`;
    } else {
      addressData = await addressFectching(arr[2], "customer_profile");
      whereDescription.innerHTML += `<p class="mb-5">For this booking, the professional will come to <span class="text-danger fs-4 fw-bold"> customer's location </span> as per below address.</p>
      <h5 class="mt-4">${addressData.address1}</h5>`;
    }
    // ...
  } else {
    // User is signed out
    // ...
  }
});

async function addressFectching(Id, type) {
  const customerTemp = await getDoc(doc(db, type, Id)).then((snapshot) => {
    return snapshot.data();
  });
  return customerTemp;
}

const confirmBooking = document.querySelector(".add");

confirmBooking.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const bookingDate = new Date(confirmBooking.bookingTime.value);
    const colRefCustomer = doc(db, "customer_profile", currentUserUID);
    let customerData = (await getDoc(colRefCustomer)).data();
    let firebastTime = Timestamp.fromDate(bookingDate);
    const docRef = doc(colRef);
    await setDoc(docRef, {
      customerId: arr[2],
      bookingId: docRef.id,
      bookingtime: firebastTime,
      customerfirstName: customerData.firstName,
      customerlastName: customerData.lastName,
      address: addressData.address1,
      serviceName: decodeURIComponent(arr[5]),
      where: arr[4],
      prosId: arr[3],
      listingId: arr[1],
      accepted: false,
      cancelled: false,
      createdAt: serverTimestamp(),
    });
    confirmBooking.reset();
    toastDisplay("Booking Confirm");
  } catch (error) {
    console.log(error);
  }

  /* window.location.href = '/dist/'; */
});

function toastDisplay(text) {
  let toast = document.getElementById("snackbar");
  // Add the "show" class to DIV
  toast.className = "show";
  toast.innerText = text;
  setTimeout(function () {
    toast.className = toast.className.replace("show", "");
    window.location.assign("customerDashboard.html");
  }, 2500);
}
