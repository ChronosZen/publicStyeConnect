import { showMenu } from "./menuStart.js";

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  serverTimestamp,
  setDoc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";

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

// get UID
const auth = getAuth();
let currentUserUID = null;

onAuthStateChanged(auth, async (user) => {
  showMenu(user);
  if (user) {
    // User is signed in, see docs for a list of available properties
    currentUserUID = user.uid;
    const docRef = doc(db, "customer_profile", currentUserUID);
    getDoc(docRef).then((docSnap) => {
      if (docSnap.exists()) {
        // User profile data exists, populate the form fields
        const userData = docSnap.data();
        addProfileForm.fname.value = userData.firstName || "";
        addProfileForm.lname.value = userData.lastName || "";
        addProfileForm.phone.value = userData.phone || "";
        addProfileForm.address1.value = userData.address1 || "";

        // Disable all form fields
        addProfileForm.fname.disabled = true;
        addProfileForm.lname.disabled = true;
        addProfileForm.phone.disabled = true;
        addProfileForm.address1.disabled = true;

        // Create and append the "Edit Profile" button
        const editButton = document.createElement("button");
        editButton.textContent = "Edit Profile";
        editButton.id = "edit-profile";
        editButton.classList.add(
          "btn",
          "bg-accent-d",
          "rounded-2",
          "text-brightness-l",
          "mt-3",
          "mb-3"
        );
        document.querySelector("#button-container").appendChild(editButton);

        // Add event listener to the button to enable form fields
        editButton.addEventListener("click", () => {
          // Enable all form fields
          addProfileForm.fname.disabled = false;
          addProfileForm.lname.disabled = false;
          addProfileForm.phone.disabled = false;
          addProfileForm.address1.disabled = false;
        });
      } else {
        console.log("No such document!");
      }
    });
  } else {
    // User is signed out
    currentUserUID = null;
  }
});

// init services
const db = getFirestore();

// collection ref
const colRef = collection(db, "customer_profile");

// adding Profile documents
const addProfileForm = document.querySelector(".add");

const API_KEY = "ebSKGOKaTk6WTADs40LNnaFX4X7lKlqG";
const addressInput = addProfileForm.address1;
const suggestionsContainer = document.getElementById("suggestions");

// Event listener for input changes
addressInput.addEventListener("input", handleInput);
// Fetch autocomplete suggestions
function handleInput() {
  const inputValue = addressInput.value;
  const autocompleteUrl = `https://api.tomtom.com/search/2/search/${encodeURIComponent(
    inputValue
  )}.json?key=${API_KEY}&limit=5&language=en-US`;
  fetch(autocompleteUrl)
    .then((response) => response.json())
    .then((data) => {
      showSuggestions(addressInput, data.results);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
// Display autocomplete suggestions
function showSuggestions(input, suggestions) {
  suggestionsContainer.innerHTML = "";
  suggestions.forEach((suggestion) => {
    const suggestionElement = document.createElement("div");
    suggestionElement.classList.add("suggestion");
    suggestionElement.textContent = suggestion.address.freeformAddress;
    suggestionElement.addEventListener("click", () => {
      // Handle the selected address
      const selectedAddress = suggestion.address.freeformAddress;
      addressInput.value = selectedAddress;
      suggestionsContainer.innerHTML = "";
    });
    suggestionsContainer.appendChild(suggestionElement);
    // input.addEventListener("blur", () => {
    //   suggestionsContainer.innerHTML = "";
    // });
  });
}

const logOut = document.getElementById("log-out");

logOut.addEventListener("click", (e) => {
  signOut(auth)
    .then(() => {
      window.location.href = "index.html";
    })
    .catch((error) => {
      // An error happened.
    });
});
addProfileForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    if (currentUserUID) {
      const docRef = doc(colRef, currentUserUID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        // Document exists, so update it
        await updateDoc(docRef, {
          firstName: addProfileForm.fname.value,
          lastName: addProfileForm.lname.value,
          phone: addProfileForm.phone.value,
          address1: addProfileForm.address1.value,
        });
      } else {
        // Document doesn't exist, so create it
        await setDoc(docRef, {
          userId: currentUserUID,
          firstName: addProfileForm.fname.value,
          lastName: addProfileForm.lname.value,
          phone: addProfileForm.phone.value,
          address1: addProfileForm.address1.value,
          createdAt: serverTimestamp(),
        });
      }
      addProfileForm.reset();
      window.location.assign("index.html");
    } else {
      console.log("User not signed in");
    }
  } catch (error) {
    console.error("Error updating or creating profile:", error);
  }
});
