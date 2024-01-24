import {
  getStorage,
  ref as sRef,
  listAll,
  getDownloadURL,
} from "firebase/storage";
export function showMenu(user) {
  const login1 = document.getElementById("login1");
  const login2 = document.getElementById("login2");
  const login3 = document.getElementById("login3");
  const login4 = document.getElementById("login4");
  const profileImg = document.getElementById("profile-img");

  if (user) {
    // User is signed in.
    login1.classList.remove("visually-hidden");
    login2.classList.remove("visually-hidden");
    login3.classList.add("visually-hidden");
    login4.classList.add("visually-hidden");
    const storage = getStorage();
    const storageRef = sRef(storage, `img/${user.uid}/profile`);

    let downloadURL = "";
    listAll(storageRef)
      .then(async (res) => {
        const fetchURL = await getDownloadURL(res.items[0]);
        downloadURL = fetchURL;
        profileImg.setAttribute("src", downloadURL);
      })
      .catch((error) => {
        console.log(error);
        // Uh-oh, an error occurred!
      });
  } else {
    // No user is signed in.
    login1.classList.add("visually-hidden");
    login2.classList.add("visually-hidden");
    login3.classList.remove("visually-hidden");
    login4.classList.remove("visually-hidden");
  }
}
