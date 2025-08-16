// Replace with your project keys
const firebaseConfig = {
  apiKey: "AIzaSyB4i9lTMyuiTK44VsGRd5Y9Vcf_UQEdq0s",
  authDomain: "project-888ab.firebaseapp.com",
  projectId: "project-888ab",
  storageBucket: "project-888ab.firebasestorage.app",
  messagingSenderId: "228515265618",
  appId: "1:228515265618:web:a5da43da768f523a61338b"
};

firebase.initializeApp(firebaseConfig);

// Make Firestore/Auth available globally
const db = firebase.firestore();
const auth = firebase.auth();

// -------------------- ADDED HELPERS --------------------

// Check if current user is admin
async function isAdmin(uid) {
  try {
    const doc = await db.collection("admins").doc(uid).get();
    return doc.exists && doc.data().isAdmin === true;
  } catch (err) {
    console.error("Error checking admin:", err);
    return false;
  }
}

// Load all users (for admin)
async function loadUsers() {
  const users = [];
  try {
    const snapshot = await db.collection("users").get();
    if (snapshot.empty) return users;
    snapshot.forEach(doc => {
      users.push({ id: doc.id, ...doc.data() });
    });
  } catch (err) {
    console.error("Error fetching users:", err);
  }
  return users; // array of {id, username, gender, favColor, zems}
}

// Example usage in addzems.html
// auth.onAuthStateChanged(async user => {
//   if (!user) return;
//   const admin = await isAdmin(user.uid);
//   if (!admin) { /* disable dropdown */ }
//   const users = await loadUsers();
//   console.log(users); // see if users load correctly
// });