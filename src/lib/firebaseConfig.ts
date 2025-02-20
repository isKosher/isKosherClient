// src/lib/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.PRIVATE_FIREBASE_API_KEY,
  authDomain: "iskosher-f8bd7.firebaseapp.com",
  projectId: "iskosher-f8bd7",
  storageBucket: "iskosher-f8bd7.firebasestorage.app",
  messagingSenderId: "326718613267",
  appId: "1:326718613267:web:6074b9bebbeec0c0c59ce6",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
