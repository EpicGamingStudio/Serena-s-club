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

// Helper: show professional message
function showMsg(el, message, type="error") {
  el.textContent = message;
  el.classList.remove("error", "success");
  el.classList.add(type);
}

// Sign Up
function signUp() {
  const username = document.getElementById("signupUsername").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value.trim();
  const msgEl = document.getElementById("signupMsg");

  if (!username || !email || !password) {
    return showMsg(msgEl, "All fields are required!");
  }
  if (password.length < 6) {
    return showMsg(msgEl, "Password must be at least 6 characters long.");
  }

  showMsg(msgEl, "Creating account...", "success");

  auth.createUserWithEmailAndPassword(email, password)
    .then(userCredential => {
      const uid = userCredential.user.uid;
      return db.collection("users").doc(uid).set({
        username,
        zems: 0
      });
    })
    .then(() => {
      showMsg(msgEl, "Account created successfully!", "success");
      setTimeout(() => { window.location.href = "homepage.html"; }, 1000);
    })
    .catch(error => {
      // Use error.code for reliable messages
      let cleanMessage = "";
      switch(error.code) {
        case "auth/network-request-failed":
          cleanMessage = "No internet connection. Please check your network.";
          break;
        case "auth/email-already-in-use":
          cleanMessage = "This email is already registered. Try signing in.";
          break;
        case "auth/invalid-email":
          cleanMessage = "Invalid email address.";
          break;
        case "auth/weak-password":
          cleanMessage = "Password is too weak. Minimum 6 characters required.";
          break;
        default:
          cleanMessage = error.message.replace(/^Firebase:\s*/, "").trim();
      }

      showMsg(msgEl, cleanMessage, "error");
    });
}

// Sign In
function signIn() {
  const email = document.getElementById("signinEmail").value.trim();
  const password = document.getElementById("signinPassword").value.trim();
  const msgEl = document.getElementById("signinMsg");

  if (!email || !password) {
    return showMsg(msgEl, "Please enter email and password.");
  }

  showMsg(msgEl, "Signing in...", "success");

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      showMsg(msgEl, "Sign in successful!", "success");
      setTimeout(() => { window.location.href = "homepage.html"; }, 500);
    })
    .catch(error => {
      let cleanMessage = "";
      switch(error.code) {
        case "auth/user-not-found":
          cleanMessage = "No account found with this email.";
          break;
        case "auth/wrong-password":
          cleanMessage = "Incorrect password. Please try again.";
          break;
        case "auth/network-request-failed":
          cleanMessage = "No internet connection. Please check your network.";
          break;
        case "auth/invalid-email":
          cleanMessage = "Invalid email address.";
          break;
        default:
          cleanMessage = error.message.replace(/^Firebase:\s*/, "").trim();
      }

      showMsg(msgEl, cleanMessage, "error");
    });
}

// Homepage: Display user info + Zems
if (window.location.pathname.includes("homepage.html")) {
  auth.onAuthStateChanged(user => {
    if (user) {
      db.collection("users").doc(user.uid).onSnapshot(doc => {
        if (doc.exists) {
          const data = doc.data();
          document.getElementById("username").innerText = data.username || "";
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
  const username = document.getElementById("updateUsername").value.trim();
  const msgEl = document.getElementById("updateMsg"); // Add a <p> in profile.html

  if (!username) return showMsg(msgEl, "Username cannot be empty.");

  const user = auth.currentUser;
  if (user) {
    db.collection("users").doc(user.uid).update({ username })
      .then(() => showMsg(msgEl, "Details updated successfully!", "success"))
      .catch(() => showMsg(msgEl, "Failed to update details. Try again.", "error"));
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