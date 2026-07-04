import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyATkdficGEqnRqt4y8OQy855D3JMaN5Wi4",
  authDomain: "income-af42d.firebaseapp.com",
  projectId: "income-af42d",
  storageBucket: "income-af42d.firebasestorage.app",
  messagingSenderId: "958590891184",
  appId: "1:958590891184:web:cce5b9a574b0fd60efb775",
  measurementId: "G-SYW9L38L2L"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
