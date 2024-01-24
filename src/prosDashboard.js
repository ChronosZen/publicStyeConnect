import { showMenu } from "./menuStart.js";

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  onSnapshot,
  setDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
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
import { getAuth, onAuthStateChanged } from "firebase/auth";
let prosId = null;
const auth = getAuth();
onAuthStateChanged(auth, async (user) => {
  showMenu(user);
  if (user) {
    prosId = await getProsId(user.uid);
    fetchListingData(prosId);
  } else {
    // User is signed out
    // ...
  }
});

// init services
const db = getFirestore();
const colRefListing = collection(db, "pros_listing_v2");
const colRefProsListing = collection(db, "pros_listing_v2");
const colRefProsProfile = collection(db, "professional_profile_v2");

// fetch prosId
async function getProsId(currentUserUID) {
  const queryProsRef = query(
    colRefProsProfile,
    where("customerId", "==", currentUserUID)
  );
  const prosIdSnap = await getDocs(queryProsRef);
  return prosIdSnap.docs[0].data().userId;
}

function fetchListingData(prosId) {
  const queryRef = query(colRefListing, where("userId", "==", prosId));
  onSnapshot(
    queryRef,
    (snapshot) => {
      let listing = [];
      snapshot.forEach((x) => listing.push(x.data()));
      displayListing(listing);
    },
    (err) => {
      console.log(err);
    }
  );
}

const listCard = document.getElementById("listing-display");

function displayListing(prosListArr) {
  // If no listings
  if (prosListArr.length === 0) {
    listCard.innerHTML = "<p>No listings found.</p>";
    return;
  }
  let listingDisplay = "";
  prosListArr.forEach((x) => {
    let obj = {
      listingId: x.listingId,
      country: x.country,
      onhome: x.onhome,
      onlocation: x.onlocation,
      servicedescription: x.servicedescription,
      price: x.price,
      service: x.service,
    };
    const searchParams = new URLSearchParams();
    searchParams.append("v1", JSON.stringify(obj));

    let queryString = searchParams.toString();
    listingDisplay += `
    <div class="container p-0 d-flex justify-content-around align-items-center mb-3">
        <div class="row listing-edit flex-nowrap w-100 align-items-center">
            <div class="col-8 p-0">
                <div class="p-0 d-flex flex-row border border-contrast-l rounded-2 justify-content-between">
                    <div class="d-flex align-items-center m-0 p-3">
                        <h4 class="fw-semibold smalltext m-0">${x.service}</h4>
                    </div>
                    <div class="d-flex align-items-center text-brightness-l bg-contrast-d m-0 p-3 rounded-end-2">
                        <p class="fw-semibold m-0 price-tag">$${parseFloat(
                          x.price
                        ).toFixed(2)}</p>
                    </div>
                </div>
            </div>
            <div class="col-2 p-0 m-0">
                <a href="editlisting.html?${queryString}">
                    <img src="/img/fi-rs-pencil.svg" alt="edit" class="d-block ms-auto img72 p-3 border border-contrast-l rounded-2">
                </a>
            </div>
            <div class="col-2 p-0 m-0">
                <img src="/img/fi-rs-trash.svg" alt="cancel" class="d-block ms-auto p-3 img72 border border-contrast-l rounded-2">
            </div>
        </div>
    </div>`;
  });

  listCard.innerHTML = listingDisplay;
}

// Service listing to firebase
const addServiceForm = document.querySelector(".list");
const addServiceButton = document.querySelector("#add-service");
const addModal = document.querySelector("#addmodal");

addServiceButton.addEventListener("click", (e) => {});
addServiceForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const newDocRef = doc(colRefProsListing);
    await setDoc(newDocRef, {
      userId: prosId,
      listingId: newDocRef.id,
      onlocation: Boolean(parseInt(addServiceForm.onlocation.value)),
      onhome: Boolean(parseInt(addServiceForm.onhome.value)),
      servicedescription: addServiceForm.servicedescription.value,
      service: addServiceForm.service.value,
      price: +addServiceForm.price.value,
      createdAt: serverTimestamp(),
    });
    addServiceForm.reset();
    addModal.click();
  } catch (error) {
    console.log(error);
  }
});
