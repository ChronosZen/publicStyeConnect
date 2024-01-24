import { showMenu } from "./menuStart.js";

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import {
  getStorage,
  ref as sRef,
  listAll,
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
const colRefListing = collection(db, "pros_listing_v2");
// qureies

// get collection data

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
  }
});

const filterForm = document.querySelector(".filter");
const searchResult = document.querySelector("#search-result");
const searchHeader = document.querySelector("#search-header");
let totalResult = 0;

let searchHTML = "";
filterForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  searchHTML = "";
  totalResult = 0;
  searchResult.innerHTML = "";
  searchHeader.innerHTML = "";
  let colRef;

  if (filterForm.rating.value == 0) {
    // User does not want to filter by rating
    colRef = query(
      collection(db, "professional_profile_v2"),
      where(`skill.${filterForm.categories.value}`, "==", true),
      where(`area.${filterForm.location.value}`, "==", true)
    );
  } else {
    // User wants to filter by rating
    colRef = query(
      collection(db, "professional_profile_v2"),
      where(`skill.${filterForm.categories.value}`, "==", true),
      where(`area.${filterForm.location.value}`, "==", true),
      where("rating", ">=", +filterForm.rating.value)
    );
  }

  const listingsPromise = getDocs(colRefListing)
    .then((snapshot) => {
      let listings = [];
      snapshot.docs.forEach((x) => {
        listings.push({
          ...x.data(),
          id: x.id,
        });
      });
      return listings;
    })
    .catch((err) => {
      console.log(err.message);
    });

  const usersPromise = getDocs(colRef)
    .then((snapshot) => {
      let listings = [];

      snapshot.docs.forEach((x) => {
        listings.push({
          ...x.data(),
          listingId: x.id,
        });
      });

      return listings;
    })
    .catch((err) => {
      console.log(err.message);
    });

  const mergePromise = Promise.all([listingsPromise, usersPromise])
    .then(([listings, users]) => {
      let newArr = users
        .map((user) => {
          let lowestListing = listings.reduce((lowest, listing) => {
            if (
              user.userId === listing.userId &&
              listing.price < (lowest ? lowest.price : Infinity)
            ) {
              return listing;
            }
            return lowest;
          }, null);
          if (lowestListing) {
            // return object with lowest price
            return {
              ...user,
              startPrice: lowestListing.price,
            };
          }
        })
        .filter(Boolean);
      return newArr;
    })
    .catch((err) => {
      console.log(err.message);
    });

  displayListing(mergePromise);
});

const createCard = (x, queryString, downloadURL, ratingShow) => {
  const starsFull = "★".repeat(Math.floor(ratingShow));
  const starsHalf = ratingShow % 1 !== 0 ? "★" : "";
  const starsEmpty = "☆".repeat(5 - Math.ceil(ratingShow));

  return `
  <div class="card pros-card col-12 p-0  rounded-top-4">
    <div class="image-container position-relative">
        <img class="card-img-top rounded-top-4" src="${downloadURL}" alt="Image" style="height: 280px; width: 100%; object-fit: cover;">
        <p class="card-text price fs-6 position-absolute bottom-0 end-0 p-2 bg-light text-dark me-2 mb-2 rounded-2">Start from $${
          x.startPrice
        }</p>
    </div>
    <div class="card-body">
      <div class="row align-items-center">
        <div class="col-7 col-lg-8">
          <h3 class="card-title fs-6 fw-semibold">${
            x.firstName + " " + x.lastName
          }</h3>
          <p class="text-gold card-text mb-0 fs-6 text-wrap">${starsFull}${starsHalf}${starsEmpty}</p>
        </div>
        <div class="col-5 col-lg-4 text-center">
          <a href="booking.html?${queryString}" class="pe-3 ps-3 pt-2 pb-2 mt-5 text-decoration-none text-nowrap bg-light-purple text-accent-d rounded-1">View</a>
        </div>
      </div>
    </div>
  </div>`;
};
const displayListing = async (mergePromise) => {
  const storage = getStorage();

  const displayOBJ = await mergePromise;

  displayOBJ.forEach((x) => {
    let ratingShow = x.rating === undefined ? "" : x.rating;
    let obj = {
      userId: x.userId,
      firstName: x.firstName,
      lastName: x.lastName,
      address: x.address1,
      area: x.area,
      bio: x.bio,
      skill: x.skill,
      city: x.city,
      country: x.country,
      startPrice: x.startPrice,
      province: x.province,
      rating: x.rating,
      ratingCount: x.ratingCount,
    };

    const storageRef = sRef(storage, `img/${x.customerId}/profile`);

    let downloadURL = "";
    listAll(storageRef)
      .then(async (res) => {
        const fetchURL = await getDownloadURL(res.items[0]);

        downloadURL = fetchURL;
      })
      .then(() => {
        const searchParams = new URLSearchParams();
        searchParams.append("v1", JSON.stringify(obj));
        let queryString = searchParams.toString();
        searchHTML += createCard(x, queryString, downloadURL, ratingShow);
        totalResult += +1;
      })
      .then(() => {
        searchResult.innerHTML = searchHTML;
        searchHeader.innerHTML = `<h2 class="fw-bold mb-3">Search Results</h2>
                                  <h3 class="mb-4">Total Results: <span class="fs-4 text-accent-d">${totalResult}</span></h3>`;
      })
      .catch((error) => {
        console.log(error);
        // Uh-oh, an error occurred!
      });
  });
};

function getObjectKeys(obj, value) {
  return Object.keys(obj).filter((key) => obj[key] === value);
}
