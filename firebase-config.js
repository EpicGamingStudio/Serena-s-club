// firebase-config.js
// Put this file in /public and import it in other modules.
// Use the modular (v9+) SDK via CDN imports in other modules.

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCSo35pMBbp5g1B6zKDUWQqYQ2tzlrQxFA",
  authDomain: "new-projecttttt-75da4.firebaseapp.com",
  projectId: "new-projecttttt-75da4",
  storageBucket: "new-projecttttt-75da4.appspot.com",
  messagingSenderId: "791536392605",
  appId: ""
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

