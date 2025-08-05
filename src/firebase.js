//创建 Firebase 配置文件
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDw-uW7oDjghCd6GDhKDJMssRXF63epFLw",
  authDomain: "nonprofitsystem.firebaseapp.com",
  projectId: "nonprofitsystem",
  storageBucket: "nonprofitsystem.firebasestorage.app",
  messagingSenderId: "381498355145",
  appId: "1:381498355145:web:58925def29abf82dfc8c18",
  measurementId: "G-H1GDB2X1ZB"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);