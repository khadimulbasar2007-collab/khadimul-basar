
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.3.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/13.3.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/13.3.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDgiz7twvoWwo06Ieirw3mzluXEWdrKYvU",
  authDomain: "khadimul-basar.firebaseapp.com",
  projectId: "khadimul-basar",
  storageBucket: "khadimul-basar.firebasestorage.app",
  messagingSenderId: "329867756790",
  appId: "1:329867756790:web:a9727b82145747ded7d8d7",
  measurementId: "G-DGK57GTPTE"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
