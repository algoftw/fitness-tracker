import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBjYul2VhoRIaFfPObym1nO2iRyRgTqNk4",
  authDomain: "fitness-tracker-a3589.firebaseapp.com",
  projectId: "fitness-tracker-a3589",
  storageBucket: "fitness-tracker-a3589.firebasestorage.app",
  messagingSenderId: "1092195480945",
  appId: "1:1092195480945:web:855d1a6e4ddbb9f74c72d0",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
