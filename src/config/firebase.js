import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDUlP7meDcQLl2zvnf-XDqYbJQyBD9W5H0",
  authDomain: "projectmobileapp-6b2dc.firebaseapp.com",
  projectId: "projectmobileapp-6b2dc",
  storageBucket: "projectmobileapp-6b2dc.firebasestorage.app",
  messagingSenderId: "618203239154",
  appId: "1:618203239154:web:72cb4b6cf0dea97fe5766b",
  measurementId: "G-FRS6GKD3QF",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
