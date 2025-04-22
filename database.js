// database.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBTV8M7e_y8zjHR_8eFv2B6Zvnj4ZikDQI",
  authDomain: "nfc-c0d91.firebaseapp.com",
  projectId: "nfc-c0d91",
  storageBucket: "nfc-c0d91.appspot.com",
  messagingSenderId: "353816260176",
  appId: "1:353816260176:web:8b26af7cfab59e9e98eb55",
  measurementId: "G-VVBDNKNMQ4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and export
const db = getFirestore(app);
export { db, collection, addDoc, serverTimestamp };