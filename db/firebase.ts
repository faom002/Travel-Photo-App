import { initializeApp } from "firebase/app";
import { getFirestore } from "@firebase/firestore";
import { getStorage } from "@firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC7K2TJiRepY_12M14JogEFfyY6HGhoh5I",
  authDomain: "tds200-1d648.firebaseapp.com",
  projectId: "tds200-1d648",
  storageBucket: "tds200-1d648.appspot.com",
  messagingSenderId: "243392774233",
  appId: "1:243392774233:web:8f588482e0ec508b067148",
  measurementId: "G-EBKLXNBD7M"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };

