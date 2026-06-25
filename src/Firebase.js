// src/firebase.js
// ─────────────────────────────────────────────────────────────────────────
// Firebase init. SKIP THIS FILE if you already initialize Firebase elsewhere
// (e.g. for Auth in app/context/AuthContext.jsx) — just point analytics.js's
// `import { db } from '../../firebase'` at your existing file instead.
// ─────────────────────────────────────────────────────────────────────────
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Put these in a .env file (Vite: VITE_*, CRA: REACT_APP_*) — never hardcode keys.
const firebaseConfig = {
  apiKey: "AIzaSyD_noM41_xlx_QG3dUPrwslxSu4VhUpNFk",
  authDomain: "ruzix-410b1.firebaseapp.com",
  projectId: "ruzix-410b1",
  storageBucket: "ruzix-410b1.firebasestorage.app",
  messagingSenderId: "140041657763",
  appId: "1:140041657763:web:816301ffd20beda225ce16"
};


// Avoid "Firebase App already exists" error if this file gets imported twice
// or if your AuthContext also calls initializeApp().
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export default app;