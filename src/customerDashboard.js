import { showMenu } from "./menuStart.js";

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  query,
  where,
  updateDoc,
  getDoc,
  getDocs,
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

initializeApp(firebaseConfig);
const db = getFirestore();
const auth = getAuth();
let currentUserUID = null;
onAuthStateChanged(auth, async (user) => {
  showMenu(user);
  if (user) {
    currentUserUID = user.uid;
    // Fetch bookings immediately after user logs in
    fetchBookings(currentUserUID);
  } else {
    // User is signed out
    // Clear out existing bookings
    bookingDetail.innerHTML = "";
  }
});

// collection ref
const colRef = collection(db, "customer_booking");
const colRefProsProfile = collection(db, "professional_profile_v2");

const ratingSubmit = document.querySelector("#rating-form");
const bookingDetail = document.querySelector("#booking-detail");
const starDialog = document.getElementById("star-dialog");
const confirmBtn = starDialog.querySelector("#confirmBtn");

waitingConfirmationTab.classList.add("active");

function fetchBookings(uid) {
  const data = query(colRef, where("customerId", "==", uid));

  onSnapshot(data, async (snapshot) => {
    if (snapshot.empty) {
      document.getElementById("waitingConfirmationTab").innerHTML =
        "<div class='booking-history-customer me-5 ms-5'><p>No bookings found</p></div>";
      document.getElementById("waitingReviewTab").innerHTML =
        "<div class='booking-history-customer me-5 ms-5'><p>No bookings found</p></div>";
      document.getElementById("completedTab").innerHTML =
        "<div class='booking-history-customer me-5 ms-5'><p>No bookings found</p></div>";
      return;
    }

    const waitingConfirmationTab = document.getElementById(
      "waitingConfirmationTab"
    );
    const waitingReviewTab = document.getElementById("waitingReviewTab");
    const completedTab = document.getElementById("completedTab");

    waitingConfirmationTab.classList.add("active");

    waitingConfirmationTab.innerHTML = "";
    waitingReviewTab.innerHTML = "";
    completedTab.innerHTML = "";

    let waitingConfirmationBookings = [];
    let waitingReviewBookings = [];
    let completedBookings = [];

    for (let doc of snapshot.docs) {
      let record = await createRecord(doc);

      if (doc.data().accepted === false) {
        waitingConfirmationBookings.push(record);
      } else if (
        doc.data().accepted === true &&
        doc.data().rating === undefined
      ) {
        waitingReviewBookings.push(record);
      } else if (
        doc.data().accepted === true &&
        doc.data().rating !== undefined
      ) {
        completedBookings.push(record);
      }
    }

    if (waitingConfirmationBookings.length === 0) {
      waitingConfirmationTab.innerHTML =
        "<div class='booking-history-customer me-5 ms-5'><p>No bookings found</p></div>";
    } else {
      waitingConfirmationBookings.forEach((booking) =>
        waitingConfirmationTab.appendChild(booking)
      );
    }

    if (waitingReviewBookings.length === 0) {
      waitingReviewTab.innerHTML =
        "<div class='booking-history-customer me-5 ms-5'><p>No bookings found</p></div>";
    } else {
      waitingReviewBookings.forEach((booking) =>
        waitingReviewTab.appendChild(booking)
      );
    }

    if (completedBookings.length === 0) {
      completedTab.innerHTML =
        "<div class='booking-history-customer me-5 ms-5'><p>No bookings found</p></div>";
    } else {
      completedBookings.forEach((booking) => completedTab.appendChild(booking));
    }
  });
}

document
  .getElementById("waitingConfirmationTabButton")
  .addEventListener("click", function () {
    setActiveTab("waitingConfirmationTab", "waitingConfirmationTabButton");
  });

document
  .getElementById("waitingReviewTabButton")
  .addEventListener("click", function () {
    setActiveTab("waitingReviewTab", "waitingReviewTabButton");
  });

document
  .getElementById("completedTabButton")
  .addEventListener("click", function () {
    setActiveTab("completedTab", "completedTabButton");
  });

function setActiveTab(tabId, buttonId) {
  const tabs = document.querySelectorAll(".tabContent");
  tabs.forEach((tab) => {
    tab.classList.remove("active");
    tab.classList.add("d-none");
  });

  const buttons = document.querySelectorAll(".tab-button");
  buttons.forEach((button) => {
    button.classList.remove("tab-active");
  });

  const activeTab = document.getElementById(tabId);
  activeTab.classList.add("active");
  activeTab.classList.remove("d-none");

  document.getElementById(buttonId).classList.add("tab-active");
}

setActiveTab("waitingConfirmationTab", "waitingConfirmationTabButton");

async function createRecord(record) {
  const data = record.data();
  const currentDate = new Date();
  const bookingDate = record.data().bookingtime.toDate();

  const div = document.createElement("div");
  div.classList.add(
    "booking-history-customer",
    "d-flex",
    "justify-content-between",
    "align-items-center",
    "mb-3",
    "border",
    "me-5",
    "ms-5",
    "rounded-2"
  );

  const dateDiv = document.createElement("div");
  dateDiv.classList.add(
    "text-white",
    "bg-dark",
    "p-4",
    "ps-3",
    "ps-lg-5",
    "pe-3",
    "pe-lg-5",
    "rounded-start-2"
  );
  const formattedDate = bookingDate.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
  });
  dateDiv.textContent = formattedDate;

  const nameTimeDiv = document.createElement("div");
  nameTimeDiv.classList.add("me-auto", "ps-3");

  const btn = document.createElement("button");
  btn.innerText = "Review";
  btn.classList.add("btn", "btn-primary", "me-2", "me-lg-5");
  btn.addEventListener("click", () => {
    starDialog.setAttribute("docId", record.id);
    starDialog.setAttribute("prosId", record.data().prosId);
    starDialog.showModal();
  });

  const prosData = await prosFectching(data.prosId);

  const paragraph1 = document.createElement("div");
  const paragraph2 = document.createElement("div");
  const formattedTime = bookingDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const timeDiv = document.createElement("div");
  timeDiv.classList.add("d-flex", "flex-column", "align-items-start");
  const nameElement = document.createElement("p");
  nameElement.textContent = prosData.firstName;
  nameElement.classList.add("fw-bold", "m-0");

  const youGaveText = document.createElement("p");
  youGaveText.classList.add("fs-6", "me-2", "mb-1");

  const nameStarContainer = document.createElement("div");
  nameStarContainer.classList.add(
    "name-star-container",
    "d-flex",
    "flex-column",
    "flex-lg-row"
  );

  nameStarContainer.appendChild(youGaveText);
  nameStarContainer.appendChild(nameElement);

  timeDiv.appendChild(nameStarContainer);

  const timeImgDiv = document.createElement("div");
  timeImgDiv.classList.add("d-flex", "align-items-center");

  const imgElement = document.createElement("img");
  imgElement.src = "/img/fi-rs-time-quarter-past.svg";
  imgElement.alt = `${formattedTime}`;
  timeImgDiv.appendChild(imgElement);

  const timeElement = document.createElement("p");
  timeElement.textContent = formattedTime;
  timeElement.classList.add("m-0", "ms-2");
  timeImgDiv.appendChild(timeElement);

  timeDiv.appendChild(timeImgDiv);

  paragraph1.appendChild(timeDiv);
  if (data.accepted && currentDate >= bookingDate && isNaN(data.rating)) {
    const waitingReviewText = document.createElement("p");
    waitingReviewText.textContent = `Waiting review for ${prosData.firstName}`;
    waitingReviewText.classList.add("fs-6", "me-2", "mb-1");
    nameStarContainer.classList.add("d-none");
    paragraph1.innerHTML = "";
    paragraph1.appendChild(waitingReviewText);
    paragraph1.appendChild(timeDiv);
  } else if (!isNaN(data.rating)) {
    const youGaveText = document.createElement("p");
    youGaveText.textContent = "You gave ";
    youGaveText.classList.add("fs-6", "me-2", "mb-1");

    const nameStarContainer = document.createElement("div");
    nameStarContainer.classList.add(
      "name-star-container",
      "d-flex",
      "flex-column",
      "flex-lg-row"
    );
    nameStarContainer.appendChild(youGaveText);
    nameStarContainer.appendChild(nameElement);

    timeDiv.prepend(nameStarContainer);

    for (let i = 0; i < data.rating; i++) {
      const starSpan = document.createElement("span");
      starSpan.textContent = "★";
      starSpan.classList.add("text-gold", "fs-6");
      nameElement.appendChild(starSpan);
    }
    btn.disabled = true;
  } else {
    nameStarContainer.classList.add("d-none");

    const locationNote = document.createElement("i");
    locationNote.classList.add("fas", "fa-info-circle", "tooltiptext");
    locationNote.setAttribute("data-bs-toggle", "tooltip");
    locationNote.setAttribute("data-bs-placement", "top");
    locationNote.setAttribute(
      "title",
      data.where === "onlocation"
        ? "The professional will service at your location"
        : "You need to visit the professional address for the service"
    );
    locationNote.classList.add("ms-1", "text-accent-d");
    // ... rest of the code

    const locationButton =
      data.where === "onlocation"
        ? ""
        : `<a href="#" class="serviceAddressButton text-decoration-none text-primary" data="${data.address}">Address</a>`;

    paragraph1.textContent = data.accepted
      ? `You can rate after the service is completed`
      : `Waiting accept from ${prosData.firstName}`;
    paragraph1.appendChild(locationNote);
    new bootstrap.Tooltip(locationNote);
    paragraph1.appendChild(timeDiv);
    paragraph2.innerHTML = locationButton;
    btn.disabled = true;
  }

  div.appendChild(dateDiv);
  nameTimeDiv.appendChild(paragraph1);
  nameTimeDiv.appendChild(paragraph2);
  div.appendChild(nameTimeDiv);
  div.appendChild(btn);

  return div;
}

async function prosFectching(prosId) {
  const prosTemp = await getDoc(
    doc(db, "professional_profile_v2", prosId)
  ).then((prosSnap) => {
    return prosSnap.data();
  });
  return prosTemp;
}

ratingSubmit.addEventListener("change", (e) => {
  e.preventDefault();
  confirmBtn.value = document.querySelector('input[name="star"]:checked').value;
});

starDialog.addEventListener("close", async (e) => {
  const starRadios = document.querySelectorAll('input[name="star"]');
  starRadios.forEach((radio) => {
    radio.checked = false;
  });
  if (starDialog.returnValue != "cancel") {
    const docId = starDialog.getAttribute("docId");
    const prosId = starDialog.getAttribute("prosId");
    const docRef = doc(colRef, docId);
    const proRef = doc(colRefProsProfile, prosId);
    const prosData = await ratingFetching(prosId);
    const prosRating = isNaN(prosData.rating)
      ? +starDialog.returnValue
      : (
          (+starDialog.returnValue + prosData.rating * +prosData.ratingCount) /
          (+prosData.ratingCount + 1)
        ).toFixed(2);
    const prosRatingCount = isNaN(prosData.ratingCount)
      ? 1
      : prosData.ratingCount + 1;

    const reviewText = document.querySelector("#review-text").value;

    await updateDoc(docRef, {
      rating: starDialog.returnValue,
      review: reviewText,
    });
    await updateDoc(proRef, {
      rating: prosRating,
      ratingCount: +prosRatingCount,
    });
    document.querySelector("#review-text").value = "";
  }
});

confirmBtn.addEventListener("click", (event) => {
  event.preventDefault();
  starDialog.close(confirmBtn.value);
});

async function ratingFetching(prosId) {
  const prosData = await getDoc(
    doc(db, "professional_profile_v2", prosId)
  ).then((snapshot) => {
    return snapshot.data();
  });
  return prosData;
}

// TOMTOM
bookingDetail.addEventListener("click", function (e) {
  if (e.target.classList.contains("serviceAddressButton")) {
    // Check if clicked element is a serviceAddress button.
    const address = e.target.getAttribute("data");
    mapDialog.showModal();
    loadMap(address);
  }
});

// import { getCustomerAddress } from './addressPic';
import { default as ttServices } from "@tomtom-international/web-sdk-services";
import { default as ttMaps } from "@tomtom-international/web-sdk-maps";
const mapDialog = document.getElementById("map-dialog");
// setting and showing a map
const APIKEY = "ebSKGOKaTk6WTADs40LNnaFX4X7lKlqG";

// display the distance.

// When open the map page, the map and start point automatically displayed.
const successCallback = (currentLocation) => {
  return currentLocation.coords;
};
const errorCallback = (error) => {
  const errorArr = [
    "An unknown error occurred.",
    "User denied the request for Geolocation.",
    "Location information is unavailable.",
    "The request to get user location timed out.",
  ];
  console.error(error);

  // displayGeo.innerText = "";

  // const errorMsg = document.createElement("p");
  // const errorNo = error.code;
  // errorMsg.innerHTML = `error#${errorNo}: ${errorArr[errorNo]}`;
  // displayGeo.appendChild(errorMsg);
};
const optionObj = {
  timeout: 10000,
  enableHighAccuracy: false,
  maximumAge: 0,
};

function getPosition(options) {
  return new Promise((successCallback, errorCallback) =>
    navigator.geolocation.getCurrentPosition(
      successCallback,
      errorCallback,
      options
    )
  );
}

// create map object with SDK to show the map
let map = ttMaps.map({
  key: APIKEY,
  container: "map",
  // dragPan: !isMobileOrTablet()
});
map.addControl(new ttMaps.FullscreenControl());
map.addControl(new ttMaps.NavigationControl());

// creat markers
function createMarkerElement(markerType) {
  // element is the container of an icon
  let element = document.createElement("div");
  // innerElement is an icon itself
  let innerElement = document.createElement("div");

  element.className = "route-marker";
  innerElement.className = "icon tt-icon -white -" + markerType;
  element.appendChild(innerElement);
  return element;
}
// Create different marker for the end point
function createEndPointMarkerElement() {
  let element = document.createElement("div");
  let innerElement = document.createElement("div");
  element.className = "route-marker-end";
  innerElement.className = "icon tt-icon -red -finish";
  element.appendChild(innerElement);
  return element;
}

// add markers at the start point and end point in the map.
function addMarkers(feature) {
  let startPoint, endPoint;
  if (feature.geometry.type === "MultiLineString") {
    startPoint = feature.geometry.coordinates[0][0]; //get first point from first line
    endPoint = feature.geometry.coordinates.slice(-1)[0].slice(-1)[0]; //get last point from last line
  } else {
    startPoint = feature.geometry.coordinates[0];
    endPoint = feature.geometry.coordinates.slice(-1)[0];
  }
  console.log(startPoint, endPoint);

  new ttMaps.Marker({
    element: createMarkerElement("start"),
  })
    .setLngLat(startPoint)
    .addTo(map);
  new ttMaps.Marker({
    element: createEndPointMarkerElement(),
  })
    .setLngLat(endPoint)
    .addTo(map);
}

// create a layer to show route & markers
function findFirstBuildingLayerId() {
  //to access each layers.
  let layers = map.getStyle().layers;

  // go through every layer and find the idex # of fill-extrusion layer which enables to add the 3D or markers.
  for (let index in layers) {
    if (layers[index].type === "fill-extrusion") {
      return layers[index].id;
    }
  }
  // display error if there is fill-extrusion layer.
  throw new Error(
    "Map style does not contain any layer with fill-extrusion type."
  );
}

// // get a route only when user access the page or reload.
// var resultsManager = new ResultsManager();

function loadMap(address) {
  document.getElementById("address-line").innerText = address;
  // assign map object to the map variable
  map = ttMaps.map({
    key: APIKEY,
    container: "map",
  });

  // add controls
  map.addControl(new ttMaps.FullscreenControl());
  map.addControl(new ttMaps.NavigationControl());

  // handle map load
  map.once("load", async () => {
    const results = await Promise.all([
      getPosition(optionObj),
      getCustomerLocation(address),
    ]);
    ttServices.services
      .calculateRoute({
        key: APIKEY,
        traffic: false,
        locations: `${results[0].coords.longitude},${results[0].coords.latitude}:${results[1].lon},${results[1].lat}`,
      })
      .then(function (response) {
        let geojson = response.toGeoJson();
        map.addLayer(
          {
            id: "route",
            type: "line",
            source: {
              type: "geojson",
              data: geojson,
            },
            paint: {
              "line-color": "#4a90e2",
              "line-width": 8,
            },
          },
          findFirstBuildingLayerId()
        );
        addMarkers(geojson.features[0]);

        let bounds = new ttMaps.LngLatBounds();
        geojson.features[0].geometry.coordinates.forEach(function (point) {
          bounds.extend(ttMaps.LngLat.convert(point));
        });
        map.fitBounds(bounds, {
          duration: 0,
          padding: 50,
        });
      });
  });
}

// Convert user's address into a latitude and longitude using user's booking information

const geoBaseURL = "https://api.tomtom.com/search/2/geocode/";
const ext = "json";
// console.log(geoBaseURL);

async function getCustomerLocation(address) {
  try {
    const url = geoBaseURL + encodeURI(address) + "." + ext + "?key=" + APIKEY;
    const res = await fetch(url);
    const data = await res.json();
    const position = data.results[0].position; //get latitude & logititude;
    console.log(position);
    return position;
  } catch (error) {
    console.error("Error", error);
  }
}

document.getElementById("close-dialog").addEventListener("click", function () {
  mapDialog.close();
});
