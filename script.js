// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB4i9lTMyuiTK44VsGRd5Y9Vcf_UQEdq0s",
  authDomain: "project-888ab.firebaseapp.com",
  projectId: "project-888ab",
  storageBucket: "project-888ab.firebasestorage.app",
  messagingSenderId: "228515265618",
  appId: "1:228515265618:web:a5da43da768f523a61338b"
};

// Init Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Sign Up
function signUp() {
  const username = document.getElementById("signupUsername").value;
  const gender = document.getElementById("signupGender").value;
  const favColor = document.getElementById("signupFavColor").value;
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;

  auth.createUserWithEmailAndPassword(email, password)
    .then(userCredential => {
      const uid = userCredential.user.uid;
      return db.collection("users").doc(uid).set({
        username,
        gender,
        favColor,
        zems: 0 // initialize Zems
      });
    })
    .then(() => {
      alert("Account created!");
      window.location.href = "homepage.html";
    })
    .catch(error => alert(error.message));
}

// Sign In
function signIn() {
  const email = document.getElementById("signinEmail").value;
  const password = document.getElementById("signinPassword").value;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      window.location.href = "homepage.html";
    })
    .catch(error => alert(error.message));
}

// Homepage: Display user info + Zems
if (window.location.pathname.includes("homepage.html")) {
  auth.onAuthStateChanged(user => {
    if (user) {
      db.collection("users").doc(user.uid).onSnapshot(doc => {
        if (doc.exists) {
          const data = doc.data();
          document.getElementById("username").innerText = data.username || "";
          document.getElementById("gender").innerText = data.gender || "";
          document.getElementById("favColor").innerText = data.favColor || "";
          document.getElementById("zems").innerText = data.zems || 0;
        }
      });
    } else {
      window.location.href = "index.html";
    }
  });
}

// Profile page
if (window.location.pathname.includes("profile.html")) {
  auth.onAuthStateChanged(user => {
    if (!user) window.location.href = "index.html";
  });
}

function updateDetails() {
  const username = document.getElementById("updateUsername").value;
  const gender = document.getElementById("updateGender").value;
  const favColor = document.getElementById("updateFavColor").value;

  const user = auth.currentUser;
  if (user) {
    db.collection("users").doc(user.uid).update({
      ...(username && { username }),
      ...(gender && { gender }),
      ...(favColor && { favColor })
    }).then(() => {
      alert("Details updated!");
      window.location.href = "homepage.html";
    });
  }
}

// Logout
function logout() {
  auth.signOut().then(() => {
    window.location.href = "index.html";
  });
}

// Go back from contest page
function goBack() {
  window.location.href = "homepage.html";
}

// Join contest
function joinContest() {
  auth.onAuthStateChanged(user => {
    if (user) {
      window.location.href = "contest.html";
    } else {
      alert("You must be signed in to join the contest.");
    }
  });
}