import {
  getStorage,
  ref as sRef,
  getDownloadURL,
  uploadBytes,
} from "firebase/storage";
import { initializeApp } from "firebase/app";
import { showMenu } from "./menuStart.js";

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
import { getAuth, onAuthStateChanged } from "firebase/auth";

const auth = getAuth();
let currentUserUID = null;
onAuthStateChanged(auth, async (user) => {
  showMenu(user);
  if (user) {
    currentUserUID = user.uid;
  } else {
    console.log("This shouldn't be printed");
  }
});

const imgElems = [
  document.querySelector('#gallery-CTA1'),
  document.querySelector('#gallery-CTA2'),
  document.querySelector('#gallery-CTA3'),
  document.querySelector('#gallery-CTA4'),
  document.querySelector('#gallery-CTA5'),
  document.querySelector('#gallery-CTA6'),
];

function selectGallery() {
  let input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.setAttribute("multiple", "multiple");
  input.addEventListener("change", function showUploadModal() {
    const files = Array.from(this.files);
    const gallery = document.getElementById("gallery-row");
    files.forEach((file, idx) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function () {
        gallery.innerHTML += `<div class="col" style="aspect-ratio:5/4"><img src="${reader.result}" alt="" class="object-fit-cover rounded-2 h-100"></div>`;
      };
    });
    document.getElementById("upgallerybtn").addEventListener("click", () => {
      uploadGallery(files, `img/${currentUserUID}/gallery/`);
    });
    document.getElementById("upload-gallery-modal").showModal();
  });
  input.click();
}


window.selectGallery = selectGallery;

async function uploadGallery(files, targetDir) {
  const filesUploadPromises = files.map((file) => {
    const metaData = {
      contentType: file.type,
    };
    const storage = getStorage();
    const storageRef = sRef(storage, targetDir + file.name);
    return uploadBytes(storageRef, file, metaData);
  });
  document.getElementById("upgallerybtn").innerText = "Uploading Gallery";
  document.getElementById("upgallerybtn").setAttribute("disabled", "disabled");
  const snapShots = await Promise.all(filesUploadPromises);
  const URLs = await Promise.all(
    snapShots.map((snapshot) => getDownloadURL(snapshot.ref))
  );
 
  URLs.forEach((url, index) => {
    if (imgElems[index]) {
      imgElems[index].src = url;
    }
  });

  document.getElementById("upload-gallery-modal").close();
}


document.getElementById("proceed").addEventListener("click",()=> {
    window.location.assign("prosDashBoard.html");
})
