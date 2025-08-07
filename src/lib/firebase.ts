// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  projectId: "distributors-connect-vrglt",
  appId: "1:419892415781:web:6eafb3827013130dcb1ecc",
  storageBucket: "distributors-connect-vrglt.appspot.com",
  apiKey: "AIzaSyCPsC3RzJkiTELNQVmc-UPlz47aZI0nVNM",
  authDomain: "distributors-connect-vrglt.firebaseapp.com",
  messagingSenderId: "419892415781",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { app, db, storage, auth };
