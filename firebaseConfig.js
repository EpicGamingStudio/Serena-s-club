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