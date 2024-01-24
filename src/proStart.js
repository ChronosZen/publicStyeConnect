import { showMenu } from "./menuStart.js";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  serverTimestamp,
  setDoc,
  query,
  where,
  getDocs,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import {
  getStorage,
  ref as sRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

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

// collection ref
const colRef = collection(db, "professional_profile_v2");

// get UID
import { getAuth, onAuthStateChanged } from "firebase/auth";

const auth = getAuth();
let currentUserUID = null;
let prosId = null;
onAuthStateChanged(auth, async (user) => {
  showMenu(user);
  if (user) {
    currentUserUID = user.uid;
    prosId = await getProsId(currentUserUID);
    if (prosId !== null) {
      const docRef = doc(db, "professional_profile_v2", prosId);
      getDoc(docRef).then((docSnap) => {
        if (docSnap.exists()) {
          // User profile data exists, populate the form fields
          const userData = docSnap.data();
          addProfileForm.fname.value = userData.firstName || "";
          addProfileForm.lname.value = userData.lastName || "";
          addProfileForm.bio.value = userData.bio || "";
          addProfileForm.category1.checked = userData.skill?.Haircut || false;
          addProfileForm.category2.checked = userData.skill?.Eyelash || false;
          addProfileForm.category3.checked = userData.skill?.Massage || false;
          addProfileForm.category4.checked = userData.skill?.Nail || false;
          addProfileForm.address1.value = userData.address1 || "";
          addProfileForm.area1.checked = userData.area?.downtown || false;
          addProfileForm.area2.checked = userData.area?.burnaby || false;
          addProfileForm.area3.checked = userData.area?.richmond || false;
          addProfileForm.fname.disabled = true;
          addProfileForm.lname.disabled = true;
          addProfileForm.bio.disabled = true;
          addProfileForm.category1.disabled = true;
          addProfileForm.category2.disabled = true;
          addProfileForm.category3.disabled = true;
          addProfileForm.category4.disabled = true;
          addProfileForm.address1.disabled = true;
          addProfileForm.area1.disabled = true;
          addProfileForm.area2.disabled = true;
          addProfileForm.area3.disabled = true;

          const editButton = document.createElement("button");
          editButton.textContent = "Edit Profile";
          editButton.id = "edit-profile";
          editButton.classList.add(
            "btn",
            "bg-accent-d",
            "rounded-2",
            "text-brightness-l",
            "mb-3"
          );

          document.querySelector("#button-container").appendChild(editButton);

          // Add event listener to the button to enable form fields
          editButton.addEventListener("click", () => {
            addProfileForm.fname.disabled = false;
            addProfileForm.lname.disabled = false;
            addProfileForm.bio.disabled = false;
            addProfileForm.profile.disabled = false;
            addProfileForm.category1.disabled = false;
            addProfileForm.category2.disabled = false;
            addProfileForm.category3.disabled = false;
            addProfileForm.category4.disabled = false;
            addProfileForm.address1.disabled = false;
            addProfileForm.area1.disabled = false;
            addProfileForm.area2.disabled = false;
            addProfileForm.area3.disabled = false;
          });
        } else {
          console.log("No such document!");
        }
      });
    }
    // ...
  } else {
  }
});

//   adding Profile documents
const addProfileForm = document.querySelector(".add");

const API_KEY = "ebSKGOKaTk6WTADs40LNnaFX4X7lKlqG";
const addressInput = addProfileForm.address1;
const suggestionsContainer = document.getElementById("suggestions");

// Event listener for input changes
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

function showModal() {
  const modal = document.getElementById("image-modal");
  modal.showModal();
}

window.showModal = showModal; //make function available to be called by onClick through webpack

function fromComputer() {
  let input = document.createElement("input");
  input.type = `file`;
  input.accept = `image/*`;
  input.addEventListener("change", function showUploadModal() {
    const file = this.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
      document.getElementById("myimg").src = reader.result;
    };
    document.getElementById("upbtn").addEventListener("click", () => {
      uploadImage(file, `img/${currentUserUID}/profile/`);
    });
    document.getElementById("image-modal").close();
    document.getElementById("upload-modal").showModal();
  });
  input.click();
}

window.fromComputer = fromComputer;

function takePicture() {
  document.getElementById("image-modal").close();
  document.getElementById("cam-modal").showModal();
  let feed = document.getElementById("cam-feed");
  let picBtn = document.getElementById("take-pic");
  async function webcamCapture() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      // Not adding `{ audio: true }` since we only want video now
      try {
        // Show webcam stream
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 4096 },
            height: { ideal: 2160 },
          },
        });
        feed.srcObject = stream;

        // Wait until the feed starts playing
        await feed.play();

        // Pipe video image in a canvas feed for image capture
        const canvas = document.createElement("canvas");
        const captureWidth = Math.floor((feed.videoHeight * 400) / 280);
        const captureHeight = feed.videoHeight;
        canvas.width = captureWidth;
        canvas.height = captureHeight;
        const ctx = canvas.getContext("2d");

        // Capture button functionality
        picBtn.addEventListener("click", async () => {
          // Reference for how to "crop" video feed onto canvas
          // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
          ctx.drawImage(
            feed,
            (feed.videoWidth - captureWidth) / 2,
            0,
            captureWidth,
            captureHeight,
            0,
            0,
            captureWidth,
            captureHeight
          );
          const dataURL = canvas.toDataURL("image/jpeg");
          document.getElementById("myimg").src = dataURL;
          const blob = await (await fetch(dataURL)).blob();
          const file = new File([blob], `${Math.random().toString(20)}.jpg`, {
            type: "image/jpeg",
            lastModified: new Date(),
          });

          document.getElementById("upbtn").addEventListener("click", () => {
            uploadImage(file, `img/${currentUserUID}/profile/`);
          });
          document.getElementById("cam-modal").close();
          const tracks = feed.srcObject.getTracks();
          tracks.forEach((track) => track.stop());
          document.getElementById("upload-modal").showModal();
        });
        // Make button click work since webcam feed has started
        picBtn.removeAttribute("disabled");
      } catch (error) {
        console.log("failed to get media stream", error);
      }
    } else {
      console.log("media devices not available in this browser");
    }
  }
  webcamCapture();
}

window.takePicture = takePicture;

async function uploadImage(file, targetDir) {
  const metaData = {
    contentType: file.type,
  };
  const storage = getStorage();
  const storageRef = sRef(storage, targetDir + file.name);
  const uploadTask = uploadBytesResumable(storageRef, file, metaData);
  uploadTask.on(
    "state-changed",
    (snapshot) => {
      const progress = Math.round(
        (snapshot.bytesTransferred / snapshot.totalBytes) * 100
      );
      // setProgresspercent(progress);
      document.getElementById("upprogress").innerHTML =
        "Upload" + progress + "%";
    },
    (error) => {
      alert(error);
    },
    //using a callback function  if upload is successful
    //using 'then' downloadURL to save the url into the database
    () => {
      getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
        document.getElementById("image-preview").src = downloadURL;
        document.getElementById("upload-modal").close();
      });
    }
  );
}

window.uploadImage = uploadImage;

addProfileForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    prosId = await getProsId(currentUserUID);
    if (prosId !== null) {
      let docRef = doc(db, "professional_profile_v2", prosId);
      await updateDoc(docRef, {
        firstName: addProfileForm.fname.value,
        lastName: addProfileForm.lname.value,
        bio: addProfileForm.bio.value,
        skill: {
          Haircut: addProfileForm.category1.checked,
          Eyelash: addProfileForm.category2.checked,
          Massage: addProfileForm.category3.checked,
          Nail: addProfileForm.category4.checked,
        },
        address1: addProfileForm.address1.value,
        area: {
          downtown: addProfileForm.area1.checked,
          burnaby: addProfileForm.area2.checked,
          richmond: addProfileForm.area3.checked,
        },
      });
    } else {
      // Document doesn't exist, so create it
      let docRef2 = doc(colRef);

      await setDoc(docRef2, {
        customerId: currentUserUID,
        userId: docRef2.id,
        firstName: addProfileForm.fname.value,
        lastName: addProfileForm.lname.value,
        bio: addProfileForm.bio.value,
        skill: {
          Haircut: addProfileForm.category1.checked,
          Eyelash: addProfileForm.category2.checked,
          Massage: addProfileForm.category3.checked,
          Nail: addProfileForm.category4.checked,
        },
        address1: addProfileForm.address1.value,
        area: {
          downtown: addProfileForm.area1.checked,
          burnaby: addProfileForm.area2.checked,
          richmond: addProfileForm.area3.checked,
        },
        createdAt: serverTimestamp(),
      });
    }
    addProfileForm.reset();
    window.location.assign("prosGallery.html");
  } catch (error) {
    console.error("Error updating or creating profile:", error);
  }
});

async function getProsId(currentUserUID) {
  const queryProsRef = query(colRef, where("customerId", "==", currentUserUID));
  const prosIdSnap = await getDocs(queryProsRef);
  if (!prosIdSnap.empty) {
    // If there are documents, return the userId from the first document
    return prosIdSnap.docs[0].data().userId;
  } else {
    return null;
  }
}
